import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { log } from "@/utils/logger";

// CORS 헤더 정의
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/**
 * GET /api/products/[id] - 상품 상세 조회
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  log.info('=== GET /api/products/[id] START ===');
  log.info('Product ID:', id);

  try {
    // Product 조회
    const productQuery = `
      SELECT * FROM products
      WHERE id = $1 AND is_delete = false
    `;

    const productResult = await pool.query(productQuery, [id]);

    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '상품을 찾을 수 없습니다.' },
        { status: 404, headers: corsHeaders }
      );
    }

    const product = productResult.rows[0];

    // Options 조회
    const optionsQuery = `
      SELECT * FROM product_options
      WHERE id_product = $1
      ORDER BY display_order ASC, created_at ASC
    `;

    const optionsResult = await pool.query(optionsQuery, [id]);

    const productWithOptions = {
      ...product,
      options: optionsResult.rows
    };

    log.info('상품 조회 완료:', productWithOptions.name_ko);

    return NextResponse.json(
      {
        success: true,
        data: productWithOptions
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('GET /api/products/[id] 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '상품 조회 중 오류가 발생했습니다.'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/products/[id] - 상품 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  log.info('=== PUT /api/products/[id] START ===');
  log.info('Product ID:', productId);

  const client = await pool.connect();

  try {
    const body = await request.json();
    log.info('요청 Body:', body);

    // 필수 필드 검증
    const {
      name_ko,
      name_en,
      regular_price,
      sale_price,
      price_notice_enabled = false,
      event_title_ko,
      event_title_en,
      event_desc_ko,
      event_desc_en,
      event_images = [],
      event_start_date,
      event_end_date,
      event_start_immediate = true,
      event_no_end_date = true,
      tags = [],
      options = []
    } = body;

    // Validation
    if (!name_ko || !name_en) {
      return NextResponse.json(
        { success: false, error: '상품명(한국어, 영어)은 필수입니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!regular_price || !sale_price) {
      return NextResponse.json(
        { success: false, error: '정상가와 할인가는 필수입니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (sale_price > regular_price) {
      return NextResponse.json(
        { success: false, error: '할인가는 정상가보다 클 수 없습니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (event_images.length > 10) {
      return NextResponse.json(
        { success: false, error: '이벤트 이미지는 최대 10개까지 업로드 가능합니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 트랜잭션 시작
    await client.query('BEGIN');
    log.info('트랜잭션 시작');

    // 1. Product 수정
    const productQuery = `
      UPDATE products SET
        name_ko = $1,
        name_en = $2,
        regular_price = $3,
        sale_price = $4,
        price_notice_enabled = $5,
        event_title_ko = $6,
        event_title_en = $7,
        event_desc_ko = $8,
        event_desc_en = $9,
        event_images = $10,
        event_start_date = $11,
        event_end_date = $12,
        event_start_immediate = $13,
        event_no_end_date = $14,
        tags = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16 AND is_delete = false
      RETURNING *
    `;

    const productValues = [
      name_ko,
      name_en,
      regular_price,
      sale_price,
      price_notice_enabled,
      event_title_ko || null,
      event_title_en || null,
      event_desc_ko || null,
      event_desc_en || null,
      event_images,
      event_start_date || null,
      event_end_date || null,
      event_start_immediate,
      event_no_end_date,
      tags,
      productId
    ];

    const productResult = await client.query(productQuery, productValues);

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: '상품을 찾을 수 없습니다.' },
        { status: 404, headers: corsHeaders }
      );
    }

    const updatedProduct = productResult.rows[0];
    log.info('Product 수정 완료:', updatedProduct.id);

    // 2. 기존 Options 모두 삭제
    const deleteOptionsQuery = `
      DELETE FROM product_options
      WHERE id_product = $1
    `;
    await client.query(deleteOptionsQuery, [productId]);
    log.info('기존 Options 삭제 완료');

    // 3. 새 Options 삽입
    const createdOptions = [];
    for (const option of options) {
      const optionQuery = `
        INSERT INTO product_options (
          id_product,
          option_name_ko,
          option_name_en,
          original_price,
          selling_price,
          description_ko,
          description_en,
          display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const optionValues = [
        productId,
        option.option_name_ko,
        option.option_name_en,
        option.original_price || null,
        option.selling_price,
        option.description_ko || null,
        option.description_en || null,
        option.display_order || 0
      ];

      const optionResult = await client.query(optionQuery, optionValues);
      createdOptions.push(optionResult.rows[0]);
      log.info('Option 생성 완료:', optionResult.rows[0].id);
    }

    // 트랜잭션 커밋
    await client.query('COMMIT');
    log.info('트랜잭션 커밋 완료');

    return NextResponse.json(
      {
        success: true,
        data: {
          product: updatedProduct,
          options: createdOptions
        },
        message: '상품이 성공적으로 수정되었습니다.'
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    // 트랜잭션 롤백
    await client.query('ROLLBACK');
    log.error('트랜잭션 롤백:', error);

    console.error('PUT /api/products/[id] 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '상품 수정 중 오류가 발생했습니다.'
      },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    client.release();
  }
}

/**
 * DELETE /api/products/[id] - 상품 삭제 (Soft Delete)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  log.info('=== DELETE /api/products/[id] START ===');
  log.info('Product ID:', id);

  try {
    // Soft Delete (is_delete = true)
    const deleteQuery = `
      UPDATE products SET
        is_delete = true,
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_delete = false
      RETURNING *
    `;

    const result = await pool.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '상품을 찾을 수 없습니다.' },
        { status: 404, headers: corsHeaders }
      );
    }

    log.info('상품 삭제 완료:', result.rows[0].name_ko);

    return NextResponse.json(
      {
        success: true,
        message: '상품이 성공적으로 삭제되었습니다.'
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('DELETE /api/products/[id] 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '상품 삭제 중 오류가 발생했습니다.'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { log } from "@/utils/logger";

// CORS 헤더 정의
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/**
 * POST /api/products - 상품 생성
 */
export async function POST(request: NextRequest) {
  log.info('=== POST /api/products START ===');

  const client = await pool.connect();

  try {
    const body = await request.json();
    log.info('요청 Body:', body);

    // 필수 필드 검증
    const {
      id_uuid_hospital,
      current_user_uid,
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
    if (!id_uuid_hospital) {
      return NextResponse.json(
        { success: false, error: '병원 정보가 필요합니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

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

    // 1. Product 삽입
    const productQuery = `
      INSERT INTO products (
        id_uuid_hospital,
        name_ko,
        name_en,
        regular_price,
        sale_price,
        price_notice_enabled,
        event_title_ko,
        event_title_en,
        event_desc_ko,
        event_desc_en,
        event_images,
        event_start_date,
        event_end_date,
        event_start_immediate,
        event_no_end_date,
        tags,
        is_active,
        is_delete
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const productValues = [
      id_uuid_hospital,
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
      true, // is_active
      false // is_delete
    ];

    const productResult = await client.query(productQuery, productValues);
    const createdProduct = productResult.rows[0];
    log.info('Product 생성 완료:', createdProduct.id);

    // 2. Product Options 삽입
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
        createdProduct.id,
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
          product: createdProduct,
          options: createdOptions
        },
        message: '상품이 성공적으로 생성되었습니다.'
      },
      { status: 201, headers: corsHeaders }
    );

  } catch (error) {
    // 트랜잭션 롤백
    await client.query('ROLLBACK');
    log.error('트랜잭션 롤백:', error);

    console.error('POST /api/products 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '상품 생성 중 오류가 발생했습니다.'
      },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    client.release();
  }
}

/**
 * GET /api/products - 상품 목록 조회
 */
export async function GET(request: NextRequest) {
  log.info('=== GET /api/products START ===');

  try {
    const { searchParams } = new URL(request.url);
    const id_uuid_hospital = searchParams.get('id_uuid_hospital');

    if (!id_uuid_hospital) {
      return NextResponse.json(
        { success: false, error: '병원 ID가 필요합니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    log.info('병원 ID:', id_uuid_hospital);

    // Products 조회 (is_delete = false인 것만)
    const productsQuery = `
      SELECT * FROM products
      WHERE id_uuid_hospital = $1 AND is_delete = false
      ORDER BY created_at DESC
    `;

    const productsResult = await pool.query(productsQuery, [id_uuid_hospital]);
    const products = productsResult.rows;

    log.info('조회된 상품 수:', products.length);

    // 각 Product의 Options 조회
    const productsWithOptions = await Promise.all(
      products.map(async (product) => {
        const optionsQuery = `
          SELECT * FROM product_options
          WHERE id_product = $1
          ORDER BY display_order ASC, created_at ASC
        `;

        const optionsResult = await pool.query(optionsQuery, [product.id]);
        return {
          ...product,
          options: optionsResult.rows
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: productsWithOptions
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('GET /api/products 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '상품 목록 조회 중 오류가 발생했습니다.'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

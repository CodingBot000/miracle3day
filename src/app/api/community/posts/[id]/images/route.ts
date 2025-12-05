import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-helper';
import { q } from '@/lib/db';
import { TABLE_COMMUNITY_POSTS } from '@/constants/tables';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';
import { uploadImage, deleteAllPostImages, deleteImages } from '@/utils/communityImageStorage';

export const runtime = 'nodejs';

const MAX_IMAGES = 5;

// Image upload
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authSession = await getAuthSession(req);
  if (!authSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = authSession;
  const postId = parseInt(params.id);

  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
  }

  try {
    // Get member UUID
    const member = await findMemberByUserId(userId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 403 });
    }

    const memberUuid =
      (member['uuid'] as string | undefined) ??
      (member['id_uuid'] as string | undefined) ??
      userId;

    // Verify post ownership
    const postRows = await q(
      `SELECT id, uuid_author, images FROM ${TABLE_COMMUNITY_POSTS} WHERE id = $1 AND is_deleted = false`,
      [postId]
    );

    const post = postRows[0];
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.uuid_author !== memberUuid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const currentImages: string[] = post.images || [];

    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Check limit
    if (currentImages.length + files.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    // Upload each file
    const newPaths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const path = await uploadImage(
        postId,
        buffer,
        currentImages.length + i,
        file.type
      );
      newPaths.push(path);
    }

    // Update database
    const allImages = [...currentImages, ...newPaths];
    await q(
      `UPDATE ${TABLE_COMMUNITY_POSTS} SET images = $1, updated_at = now() WHERE id = $2`,
      [allImages, postId]
    );

    return NextResponse.json({ images: allImages });
  } catch (error) {
    console.error('POST /api/community/posts/[id]/images error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Image delete (single or all)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authSession = await getAuthSession(req);
  if (!authSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = authSession;
  const postId = parseInt(params.id);
  const { searchParams } = new URL(req.url);
  const imagePath = searchParams.get('path');

  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
  }

  try {
    // Get member UUID
    const member = await findMemberByUserId(userId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 403 });
    }

    const memberUuid =
      (member['uuid'] as string | undefined) ??
      (member['id_uuid'] as string | undefined) ??
      userId;

    // Verify post ownership
    const postRows = await q(
      `SELECT id, uuid_author, images FROM ${TABLE_COMMUNITY_POSTS} WHERE id = $1 AND is_deleted = false`,
      [postId]
    );

    const post = postRows[0];
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.uuid_author !== memberUuid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (imagePath) {
      // Delete single image
      await deleteImages([imagePath]);
      await q(
        `UPDATE ${TABLE_COMMUNITY_POSTS} SET images = array_remove(images, $1), updated_at = now() WHERE id = $2`,
        [imagePath, postId]
      );
    } else {
      // Delete all images
      await deleteAllPostImages(postId);
      await q(
        `UPDATE ${TABLE_COMMUNITY_POSTS} SET images = '{}', updated_at = now() WHERE id = $1`,
        [postId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/community/posts/[id]/images error:', error);
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

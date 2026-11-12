import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// 指定した商品がお気に入り登録済みか確認する
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { message: 'ログインしてください。' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const productId = Number(id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { message: '商品IDが正しくありません。' },
        { status: 400 }
      );
    }

    const favorites = await executeQuery<{ id: number }>(
      `SELECT id
       FROM favorites
       WHERE product_id = ? AND user_id = ?;`,
      [productId, user.userId]
    );

    return NextResponse.json(favorites.length > 0);
  } catch (err) {
    console.error('お気に入り状態取得エラー：', err);

    return NextResponse.json(
      { message: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// 指定した商品のお気に入りを解除する
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { message: 'ログインしてください。' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const productId = Number(id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { message: '商品IDが正しくありません。' },
        { status: 400 }
      );
    }

    await executeQuery(
      `DELETE FROM favorites
       WHERE product_id = ? AND user_id = ?;`,
      [productId, user.userId]
    );

    return NextResponse.json({
      message: 'お気に入りを解除しました。',
    });
  } catch (err) {
    console.error('お気に入り解除エラー：', err);

    return NextResponse.json(
      { message: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
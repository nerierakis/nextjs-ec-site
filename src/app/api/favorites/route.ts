import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// お気に入りデータ1件分の型
type Favorite = {
  id: number;
  product_id: number;
  user_id: number;
  created_at: string;
};

// ログインユーザーのお気に入りを全件取得
export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { message: 'ログインしてください。' },
        { status: 401 }
      );
    }

    const favorites = await executeQuery<Favorite>(
      `SELECT *
       FROM favorites
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC;`,
      [user.userId]
    );

    return NextResponse.json({ favorites });
  } catch (err) {
    console.error('お気に入り取得エラー：', err);

    return NextResponse.json(
      { message: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// 商品をお気に入りに登録
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { message: 'ログインしてください。' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const productId = Number(body.product_id);

    // 商品IDが正の整数であることを確認
    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { message: '商品IDが正しくありません。' },
        { status: 400 }
      );
    }

    await executeQuery(
      `INSERT IGNORE INTO favorites (product_id, user_id)
       VALUES (?, ?);`,
      [productId, user.userId]
    );

    return NextResponse.json({
      message: 'お気に入りに登録しました。',
    });
  } catch (err) {
    console.error('お気に入り登録エラー：', err);

    return NextResponse.json(
      { message: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
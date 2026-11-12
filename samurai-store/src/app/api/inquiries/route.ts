import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// お問い合わせを新しい順に取得
export async function GET() {
  try {
    const inquiries = await executeQuery(
      'SELECT * FROM inquiries ORDER BY created_at DESC'
    );

    return NextResponse.json(inquiries);
  } catch {
    return NextResponse.json(
      { message: 'お問い合わせの取得に失敗しました。' },
      { status: 500 }
    );
  }
}

// お問い合わせを保存
export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // 必須項目のチェック
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { message: 'すべての項目を入力してください。' },
        { status: 400 }
      );
    }

    await executeQuery(
      'INSERT INTO inquiries (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );

    return NextResponse.json(
      { message: 'お問い合わせを送信しました。' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: 'お問い合わせの保存に失敗しました。' },
      { status: 500 }
    );
  }
}
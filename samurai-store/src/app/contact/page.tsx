'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
        }),
      });

      if (!response.ok) {
        setErrorMessage('お問い合わせの送信に失敗しました。');
        return;
      }

      router.push('/?submitted=1');
    } catch {
      setErrorMessage('通信に失敗しました。');
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <Link href="/">トップページへ戻る</Link>
      <h1 className="text-2xl my-4">お問い合わせ</h1>

      {errorMessage && <p className="text-red-600">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          氏名
          <input name="name" required className="block border p-2 w-full" />
        </label>

        <label className="block">
          メールアドレス
          <input
            name="email"
            type="email"
            required
            className="block border p-2 w-full"
          />
        </label>

        <label className="block">
          お問い合わせ内容
          <textarea
            name="message"
            required
            className="block border p-2 w-full"
          />
        </label>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2">
          送信
        </button>
      </form>
    </main>
  );
}
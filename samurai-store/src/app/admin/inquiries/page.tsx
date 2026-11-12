import Link from 'next/link';

type Inquiry = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export default async function AdminInquiriesPage() {
  const response = await fetch(
    `${process.env.BASE_URL}/api/inquiries`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    return <p>お問い合わせの取得に失敗しました。</p>;
  }

  const inquiries: Inquiry[] = await response.json();
  const cellStyle = 'border p-3 text-left';

  return (
    <main className="container mx-auto p-6">
      <Link href="/admin/products">トップページへ戻る</Link>

      <h1 className="text-2xl my-4">お問い合わせ一覧</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className={cellStyle}>ID</th>
            <th className={cellStyle}>氏名</th>
            <th className={cellStyle}>メールアドレス</th>
            <th className={cellStyle}>お問い合わせ内容</th>
            <th className={cellStyle}>送信日時</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id}>
              <td className={cellStyle}>{inquiry.id}</td>
              <td className={cellStyle}>{inquiry.name}</td>
              <td className={cellStyle}>{inquiry.email}</td>
              <td className={cellStyle}>{inquiry.message}</td>
              <td className={cellStyle}>
                {new Date(inquiry.created_at).toLocaleString('ja-JP')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
'use client';

import { useState } from 'react';

type FavoriteControlsProps = {
  productId: number;
  initialIsFavorite: boolean;
};

export default function FavoriteControls({
  productId,
  initialIsFavorite,
}: FavoriteControlsProps) {
  // 現在のお気に入り状態
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  // APIとの通信中かどうか
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // 追加済みなら解除、未追加なら登録する
      const response = isFavorite
        ? await fetch(`/api/favorites/${productId}`, {
            method: 'DELETE',
          })
        : await fetch('/api/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product_id: productId,
            }),
          });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '処理に失敗しました。');
      }

      // APIが成功したら表示を切り替える
      setIsFavorite((prev) => !prev);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : '通信エラーが発生しました。';

      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-pressed={isFavorite}
      style={{ fontFamily: 'sans-serif' }}
      className="text-pink-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isFavorite ? '♥ お気に入り解除' : '♡ お気に入り追加'}
    </button>
  );
}
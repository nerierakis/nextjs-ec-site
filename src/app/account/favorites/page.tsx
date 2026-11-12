'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import type { ProductData } from '@/types/product';

type Favorite = {
  id: number;
  product_id: number;
  user_id: number;
  created_at: string;
};

export default function FavoritesPage() {
  const { addItem, isInCart } = useCart();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);

  // ページを開いたときにお気に入り商品を取得
  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      try {
        const response = await fetch('/api/favorites', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'ログインしてください。'
              : 'お気に入り一覧を取得できませんでした。'
          );
        }

        const data: { favorites: Favorite[] } = await response.json();

        // お気に入りに登録された各商品の詳細を取得
        const favoriteProducts = await Promise.all(
          data.favorites.map(async (favorite) => {
            const productResponse = await fetch(
              `/api/products/${favorite.product_id}`,
              { cache: 'no-store' }
            );

            if (!productResponse.ok) {
              throw new Error('商品情報を取得できませんでした。');
            }

            const product: ProductData = await productResponse.json();
            return product;
          })
        );

        if (!cancelled) {
          setProducts(favoriteProducts);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : '通信エラーが発生しました。'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  // 商品を1つカートに追加
  function handleAddToCart(product: ProductData) {
    if (isInCart(String(product.id))) return;
    if ((product.stock ?? 0) <= 0) return;

    addItem(
      {
        id: String(product.id),
        title: product.name,
        price: product.price,
        imageUrl: product.image_url ?? '',
      },
      1
    );
  }

  // 確認後、お気に入りを解除
  async function handleRemove(productId: number) {
    if (removingId !== null) return;

    if (!window.confirm('本当にお気に入りから削除しますか？')) {
      return;
    }

    setRemovingId(productId);

    try {
      const response = await fetch(`/api/favorites/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('お気に入りを解除できませんでした。');
      }

      // DBで削除できたら、画面の一覧からも除外
      setProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : '通信エラーが発生しました。'
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link
        href="/account"
        className="text-indigo-600 hover:underline"
      >
        ← マイページへ戻る
      </Link>

      <h1 className="my-8 text-center">お気に入り一覧</h1>

      {isLoading ? (
        <p className="text-center">読み込み中です…</p>
      ) : error ? (
        <p role="alert" className="text-center text-red-600">
          {error}
        </p>
      ) : products.length === 0 ? (
        <p className="text-center">
          お気に入りの商品はまだありません。
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => {
            const inCart = isInCart(String(product.id));
            const soldOut = (product.stock ?? 0) <= 0;

            const imageUrl = product.image_url
              ? `/uploads/${product.image_url}`
              : '/images/no-image.jpg';

            return (
              <article
                key={product.id}
                className="flex flex-wrap gap-4 rounded-md border border-gray-300 p-4 shadow-sm"
              >
                <Link href={`/products/${product.id}`}>
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    width={120}
                    height={120}
                    className="h-[120px] w-[120px] object-contain"
                  />
                </Link>

                <div className="min-w-0 flex-1 space-y-3">
                  <h2 className="text-lg font-bold">
                    {product.name}
                  </h2>

                  <p className="text-indigo-600">
                    ¥{product.price.toLocaleString()}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={inCart || soldOut}
                      className="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {inCart
                        ? '追加済み'
                        : soldOut
                          ? '売り切れ'
                          : 'カートに追加'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(product.id)}
                      disabled={removingId !== null}
                      className="rounded border border-pink-500 px-4 py-2 text-pink-600 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {removingId === product.id
                        ? '解除中…'
                        : 'お気に入り解除'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
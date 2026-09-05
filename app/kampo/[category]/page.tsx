import Link from "next/link";
import { notFound } from "next/navigation";
import KampoGuideDetail from "@/components/KampoGuideDetail";
import { getKampoGuide } from "@/lib/kampo/retrieve";
import type { KampoCategory } from "@/lib/kampo/types";

export default async function KampoCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const guide = getKampoGuide(category as KampoCategory);

  if (!guide) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/kampo"
        className="mb-4 inline-block text-sm text-blue-700 underline hover:text-blue-900"
      >
        ← 一覧に戻る
      </Link>

      <KampoGuideDetail guide={guide} />
    </main>
  );
}

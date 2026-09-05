import Link from "next/link";
import { notFound } from "next/navigation";
import SymptomGuideDetail from "@/components/SymptomGuideDetail";
import { getOutpatientSymptomGuide } from "@/lib/outpatient/retrieve";
import type { OutpatientCategory } from "@/lib/outpatient/types";

export default async function OutpatientCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const guide = getOutpatientSymptomGuide(category as OutpatientCategory);

  if (!guide) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/outpatient"
        className="mb-4 inline-block text-sm text-blue-700 underline hover:text-blue-900"
      >
        ← 一覧に戻る
      </Link>

      <SymptomGuideDetail guide={guide} />
    </main>
  );
}

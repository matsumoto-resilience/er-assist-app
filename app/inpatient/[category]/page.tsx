import Link from "next/link";
import { notFound } from "next/navigation";
import SymptomGuideDetail from "@/components/SymptomGuideDetail";
import { getInpatientSymptomGuide } from "@/lib/inpatient/retrieve";
import type { InpatientSymptomCategory } from "@/lib/inpatient/types";

export default async function InpatientCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const guide = getInpatientSymptomGuide(category as InpatientSymptomCategory);

  if (!guide) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/inpatient"
        className="mb-4 inline-block text-sm text-blue-700 underline hover:text-blue-900"
      >
        ← 一覧に戻る
      </Link>

      <SymptomGuideDetail guide={guide} />
    </main>
  );
}

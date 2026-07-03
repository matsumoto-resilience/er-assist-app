export default function DisclaimerBanner() {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">本ツールは臨床意思決定を支援する参考情報を提供するものであり、診断・治療を確定するものではありません。</p>
      <p className="mt-1">
        出力内容は必ず指導医・担当医が確認し、最終的な診断・治療方針は医師の責任において決定してください。
        本ツールは医療機器として承認されたものではありません。
      </p>
    </div>
  );
}

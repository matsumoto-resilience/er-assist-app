export const metadata = {
  title: "プライバシーポリシー — ER Assist",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-sm leading-relaxed text-gray-800">
      <h1 className="mb-6 text-xl font-bold">プライバシーポリシー</h1>

      <p className="mb-4 text-gray-500">
        ※ このページは App Store 掲載に必要な最低限の草案です。公開前に必ず内容を法務・運営者にてご確認・修正してください。
      </p>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">1. 本アプリについて</h2>
        <p>
          ER Assist（以下「本アプリ」）は、医療従事者向けの臨床意思決定支援ツールです。本アプリは診断・治療を確定するものではなく、参考情報の提供を目的としています。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">2. 取得する情報</h2>
        <p>
          本アプリの利用にあたり入力された症状・検査値等の情報は、AI生成による支援情報の作成のため、外部のAI提供事業者（Anthropic, Google等）のAPIに送信される場合があります。入力情報には患者を特定できる情報を含めないでください。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">3. 情報の利用目的</h2>
        <p>取得した情報は、本アプリの機能提供（AIによる支援情報の生成）のみに利用します。</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">4. 第三者提供</h2>
        <p>法令に基づく場合を除き、取得した情報を第三者に提供することはありません。</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">5. お問い合わせ</h2>
        <p>本ポリシーに関するお問い合わせは、運営者までご連絡ください。</p>
      </section>
    </main>
  );
}

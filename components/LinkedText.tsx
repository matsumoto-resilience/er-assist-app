import type { GlossaryTerm } from "@/lib/symptom-guide/types";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function LinkedText({
  text,
  glossary,
}: {
  text: string;
  glossary: GlossaryTerm[];
}) {
  if (glossary.length === 0) return <>{text}</>;

  // 長い語句から先に照合することで、部分一致による分割ミスを防ぐ(例: "正常高値血圧"と"高値血圧")。
  const terms = [...glossary].sort((a, b) => b.term.length - a.term.length);
  const pattern = new RegExp(`(${terms.map((t) => escapeRegExp(t.term)).join("|")})`, "g");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        const match = terms.find((t) => t.term === part);
        if (!match) return part;
        return (
          <a
            key={i}
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline decoration-dotted underline-offset-2 hover:text-blue-900"
          >
            {part}
          </a>
        );
      })}
    </>
  );
}

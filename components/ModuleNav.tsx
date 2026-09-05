"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";

const MODULES = [
  { href: "/", label: "救急外来" },
  { href: "/outpatient", label: "外来" },
  { href: "/inpatient", label: "入院" },
  { href: "/kampo", label: "漢方薬" },
] as const;

export default function ModuleNav() {
  const pathname = usePathname();

  // サインイン/サインアップ画面ではナビを隠す(青いフルスクリーン画面のため)
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return null;
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-1 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1">
          {MODULES.map((mod) => {
            const active =
              pathname === mod.href || (mod.href !== "/" && pathname.startsWith(`${mod.href}/`));
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className={`border-b-2 px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {mod.label}
              </Link>
            );
          })}
        </div>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}

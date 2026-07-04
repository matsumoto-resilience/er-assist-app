"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MODULES = [
  { href: "/", label: "救急外来" },
  { href: "/outpatient", label: "外来" },
  { href: "/inpatient", label: "入院" },
] as const;

export default function ModuleNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl gap-1 px-4 sm:px-6 lg:px-8">
        {MODULES.map((mod) => {
          const active = pathname === mod.href;
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
    </nav>
  );
}

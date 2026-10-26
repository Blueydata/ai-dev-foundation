"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type AppShellProps = {
  brand: ReactNode;
  navigation: NavigationItem[];
  footer?: ReactNode;
  children: ReactNode;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ brand, navigation, footer, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 z-20 flex flex-col border-b bg-sidebar text-sidebar-foreground md:h-dvh md:border-r md:border-b-0">
        <div className="flex h-14 items-center justify-between gap-3 px-4 md:h-16 md:px-5">
          {brand}
          {footer ? <div className="md:hidden">{footer}</div> : null}
        </div>
        <nav aria-label="Principal" className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:overflow-visible md:px-3 md:pb-0">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-2.5 rounded-md px-3 text-sm transition-colors",
                  active ? "bg-background font-medium text-foreground shadow-xs" : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4", active ? "text-primary" : "")} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        {footer ? <div className="hidden border-t p-3 md:block">{footer}</div> : null}
      </aside>
      <main className="min-w-0">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}

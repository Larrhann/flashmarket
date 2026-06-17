import { Suspense } from "react";
import Link from "next/link";
import { SiteNav } from "./site-nav";
import { HeaderNotifications } from "./admin/header-notifications";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-3">
        <Link href="/" className="text-lg font-bold text-primary">
          FlashMarket
        </Link>
        <div className="flex items-center gap-3">
          <SiteNav />
          <Suspense fallback={null}>
            <HeaderNotifications />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

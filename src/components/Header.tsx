"use client";

import { ModeToggle } from "~/components/mode-toggle";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="font-medium">Sail It</div>
        <ModeToggle />
      </div>
    </header>
  );
}



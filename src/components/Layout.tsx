import type { ReactNode } from "react"
import { ThemeToggle } from "./ThemeToggle"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  )
}

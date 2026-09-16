import type { ReactNode } from "react"
import { buttonVariants } from "@/components/ui/button"
import { GithubIcon } from "@/components/icons/github"
import { ThemeToggle } from "./ThemeToggle"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh">
      <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
        <a
          href="https://github.com/Hemki/client-converter"
          target="_blank"
          rel="noreferrer"
          aria-label="View source on GitHub"
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <GithubIcon />
        </a>
        <ThemeToggle />
      </div>
      <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  )
}

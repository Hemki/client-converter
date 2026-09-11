import { Button } from "@/components/ui/button"

function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Convert client files without leaving your browser
      </h1>
      <p className="max-w-md text-lg text-pretty text-muted-foreground">
        Everything runs locally. Nothing gets uploaded.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg">Choose a file</Button>
        <Button size="lg" variant="outline">
          How it works
        </Button>
      </div>
    </main>
  )
}

export default App

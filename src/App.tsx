import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useWorker } from "@/hooks/useWorker"
import { FileDropzone } from "@/components/FileDropZone"

function App() {
  const [file, setFile] = useState<File | null>(null)
  const { send, result } = useWorker()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Convert files in your browser
          </h1>
          <p className="text-lg text-pretty text-muted-foreground">
            Everything runs locally. Nothing gets uploaded.
          </p>
        </div>

        <FileDropzone
          file={file}
          onFile={(f) => {
            setFile(f)
            send(f)
          }}
          onClear={() => setFile(null)}
        />

        {result && (
          <Card>
            <CardContent className="font-mono text-sm break-all text-muted-foreground">
              {result}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

export default App

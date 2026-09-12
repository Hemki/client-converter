import { FileDropzone } from "@/components/FileDropZone"
import { Card, CardContent } from "@/components/ui/card"
import { useWorker } from "@/hooks/useWorker"
import { useState } from "react"

export function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const { send, result } = useWorker()

  return (
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
  )
}

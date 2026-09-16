import { FileDropzone } from "@/components/FileDropZone"
import { Card, CardContent } from "@/components/ui/card"
import { useConverter } from "@/hooks/useConverter"
import { targetsFor } from "@/converters/config"

function outputName(file: File, to: string) {
  return `${file.name.replace(/\.[^./]+$/, "")}.${to}`
}

export function Dashboard() {
  const { jobs, convert, retarget, remove } = useConverter()

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
        jobs={jobs}
        onFilesAdded={(files) => files.forEach((file) => convert(file))}
        onRemove={remove}
      />

      {jobs.length > 0 && (
        <div className="space-y-2">
          {jobs.map((job) => {
            const targets = targetsFor(job.file)
            return (
              <Card key={job.id}>
                <CardContent className="flex items-center gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate font-mono text-muted-foreground">
                    {job.file.name}
                  </span>

                  {targets.length > 0 && (
                    <select
                      className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                      value={job.to}
                      onChange={(e) => retarget(job.id, e.target.value)}
                    >
                      {targets.map((format) => (
                        <option key={format.id} value={format.id}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {job.status === "queued" && (
                    <span className="text-muted-foreground">Queued</span>
                  )}
                  {job.status === "processing" && (
                    <span className="text-muted-foreground">
                      Converting… {job.progress}%
                    </span>
                  )}
                  {job.status === "error" && (
                    <span className="text-destructive">{job.error}</span>
                  )}
                  {job.status === "done" && job.resultUrl && (
                    <a
                      className="text-primary underline"
                      href={job.resultUrl}
                      download={outputName(job.file, job.to)}
                    >
                      Download
                    </a>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

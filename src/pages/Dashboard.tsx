import { FileDropzone } from "@/components/FileDropZone"
import { Card, CardContent } from "@/components/ui/card"
import { useConverter } from "@/hooks/useConverter"

export function Dashboard() {
  const { jobs, convert, remove } = useConverter()

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
        files={jobs.map((job) => job.file)}
        onFilesAdded={(files) => files.forEach((file) => convert(file, "TBD"))}
        onRemove={(file) => {
          const job = jobs.find((j) => j.file === file)
          if (job) remove(job.id)
        }}
      />

      {jobs.length > 0 && (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="font-mono text-sm break-all text-muted-foreground">
                {job.file.name} — {job.status}
                {job.status === "done" && `: ${job.result}`}
                {job.status === "error" && `: ${job.error}`}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

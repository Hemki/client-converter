import { FileDropzone } from "@/components/FileDropZone"
import { useConverter } from "@/hooks/useConverter"

export function Dashboard() {
  const { jobs, convert, retarget, remove } = useConverter()

  return (
    <div className="w-full max-w-xl space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Convert files in your browser
        </h1>
        <p className="text-lg text-pretty text-muted-foreground">
          All files stay on your device, and your device only.
        </p>
      </div>

      <FileDropzone
        jobs={jobs}
        onFilesAdded={(files) => files.forEach((file) => convert(file))}
        onRemove={remove}
        onRetarget={retarget}
      />
    </div>
  )
}

export type ConvertFn = (
  file: File,
  to: string,
  onProgress?: (value: number) => void,
) => Promise<Blob>

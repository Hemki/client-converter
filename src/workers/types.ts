export type Request = { id: number; file: File; to: string }
export type Response =
  | { id: number; type: "progress"; value: number }
  | { id: number; type: "done"; blob: Blob }
  | { id: number; type: "error"; message: string }

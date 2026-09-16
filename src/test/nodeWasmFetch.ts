import { readFile } from "node:fs/promises"

/**
 * jSquash's codecs load their .wasm binaries with `fetch(new URL(...))`, which
 * only works when served over http(s). Node's fetch has no support for
 * `file:` URLs, so under Vitest (no dev server) every codec init would fail.
 * This patches `fetch` to serve `file:` URLs straight off disk, leaving
 * everything else to the real implementation.
 */
export function installNodeWasmFetch() {
  const realFetch = globalThis.fetch

  globalThis.fetch = async (input, init) => {
    const url =
      input instanceof URL
        ? input
        : new URL(input instanceof Request ? input.url : input)

    if (url.protocol === "file:") {
      const bytes = await readFile(url)
      return new Response(bytes, {
        status: 200,
        headers: { "Content-Type": "application/wasm" },
      })
    }

    return realFetch(input, init)
  }
}

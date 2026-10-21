# buffer-repro

Shows how reading `stdout.buffer` from `execFile` (with `encoding: "buffer"`) can leak unrelated
memory.

## What's going on

`stdout` is a Node `Buffer`, which is a _view_ (`byteOffset` + `byteLength`) into an underlying
`ArrayBuffer`. Small buffers come from a shared 8 KiB pool. So `stdout.buffer` is the **whole pool
slab**, not just your data. It can include bytes from other allocations and uninitialized memory.

The page at `/` renders `example-file.txt` twice:

1. **Correct:** slices `stdout.buffer` using `byteOffset`/`byteLength`, so you only get the file
   contents.
2. **Wrong:** uses `stdout.buffer` directly, so the file contents are surrounded by unrelated bytes.

This is documented Node behaviour, not a Node bug. Code that uses `.buffer` without the offset and
length is the bug.

**Fix:** use the `Buffer` itself (`stdout.toString()`), use `encoding: "utf8"`, or slice
`stdout.buffer` with `byteOffset` and `byteLength` as in the correct example.

## Run locally

```sh
yarn install
yarn dev
```

Open http://localhost:3000.

## Run with Docker

The image copies the local `node_modules`, so reduce deps down to production only first:

```sh
yarn workspaces focus --production
docker build -t buffer-repro .
docker run --rm -p 3000:3000 buffer-repro
```

Open http://localhost:3000.

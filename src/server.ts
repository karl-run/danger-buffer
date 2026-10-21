import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { html, raw } from "hono/html";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const app = new Hono();

app.get("/", async (c) => {
  const { stdout: first } = await execFileAsync("cat", ["./example-file.txt"], {
    encoding: "buffer",
  });
  const clean = first.buffer.slice(
    first.byteOffset,
    first.byteOffset + first.byteLength,
  ) as ArrayBuffer;

  const { stdout } = await execFileAsync("cat", ["./example-file.txt"], { encoding: "buffer" });
  const bad = stdout.buffer;

  return c.html(
    html`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>buffer-repro</title>
          <style>
            body {
              font-family: sans-serif;
            }
          </style>
        </head>
        <body>
          <h1>Buffer oopsie repro</h1>
          <p>This file is is loaded using cat through execFile.</p>
          <h2>This one is correctly sliced using the stdout's byteOffset and byteLength:</h2>
          <pre>${raw(Buffer.from(clean).toString("utf-8"))}</pre>
          <h2>This one is directly accessed through stdout.buffer:</h2>
          <pre>${raw(Buffer.from(bad).toString("utf-8"))}</pre>
        </body>
      </html> `,
  );
});

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
});

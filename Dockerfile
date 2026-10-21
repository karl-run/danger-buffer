FROM debian:13-slim AS coreutils

FROM gcr.io/distroless/nodejs24-debian13@sha256:85482a8359e1524bd1278f5b418bb397bbebbf2b5ceeea7ec13a9e640e2c1911

COPY --from=coreutils /usr/bin/cat /usr/bin/cat

WORKDIR /app

# Next.js app
COPY node_modules /app/node_modules
COPY src /app
COPY example-file.txt /app

EXPOSE 3000

CMD ["server.ts"]

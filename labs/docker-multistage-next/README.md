# Lab: Multi-Stage Docker Build for a Node / Next.js-Style App

## What You Build

A minimal HTTP server packaged with a two-stage `Dockerfile`:

1. **`deps` stage** — copies `package.json` first to maximize layer cache hits during `npm install`.
2. **`runner` stage** — copies only the runtime files into a clean `node:22-alpine3.21` image and runs as a non-root user (`nextjs`, UID `1001`).

A `.dockerignore` file keeps local artifacts (`node_modules`, `.git`, `README.md`) out of the build context.

## Prerequisites

- Docker 24+ (or compatible OCI builder)
- `curl` (optional, for testing the endpoint)

## Steps

1. Build the image from this directory:

   ```bash
   docker build -t mt-multistage-next:lab labs/docker-multistage-next
   ```

2. Run the container on port `3000`:

   ```bash
   docker run --rm -d --name mt-next-lab -p 3000:3000 mt-multistage-next:lab
   ```

3. Verify the HTTP response and non-root UID:

   ```bash
   curl -i http://localhost:3000/
   curl -s http://localhost:3000/healthz
   docker exec mt-next-lab id
   ```

## Expected Output

- `curl -i http://localhost:3000/` returns `HTTP/1.1 200 OK` and HTML showing `Running as UID 1001 on Node v22.x`.
- `curl -s http://localhost:3000/healthz` returns `{"status":"ok"}`.
- `docker exec mt-next-lab id` prints `uid=1001(nextjs) gid=1001(nodejs)`.

## Cleanup

```bash
docker rm -f mt-next-lab
docker rmi mt-multistage-next:lab
```

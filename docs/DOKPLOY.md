# Deploy Meteora Launch on Dokploy

This repository is packaged as one static SPA container: Node builds Vite, then an unprivileged Nginx image serves the result on container port **8080**. There is no database, runtime environment variable, or application secret to configure.

Use a Dokploy **Application**, not a Docker Compose service. Applications run as Docker Swarm services, which support `start-first` replacements and automatic rollback.

## What a deployment does

1. Dokploy builds the new image while the existing container continues serving traffic.
2. Swarm starts the replacement and waits for Docker's `/healthz` check to pass.
3. Only then does it stop the old container. Nginx receives `SIGQUIT` and drains active responses.
4. If the replacement does not become healthy within the monitoring window, Swarm rolls back to the previous version.
5. The shared assets volume retains previous Vite fingerprints, so an already-open page never loses its older JavaScript or CSS after an update.

This provides zero-downtime **application deployments**. A single VPS can still fail independently; multi-node availability requires separate infrastructure.

## Dokploy setup

### 1. Create the application

- Choose **Create Service → Application** and name it `meteora-launch`.
- Connect this repository and select the branch you want to deploy.
- Set **Build Type** to **Dockerfile**.
- Set **Dockerfile Path** to `Dockerfile`.
- Set **Docker Context Path** to `.`.
- No build arguments or environment variables are required.

Do not choose Nixpacks or a static-site preset: the Dockerfile includes the health check, SPA fallback, cache policy, graceful shutdown, and asset publishing behavior.

### 2. Add the domain

In **Domains**, add your production hostname with:

- **Path:** `/`
- **Container port:** `8080`
- **HTTPS:** enabled with Let's Encrypt

Point the hostname's DNS record at the VPS before requesting the certificate.

### 3. Enable zero-downtime updates

In **Advanced → Cluster Settings**, leave **Replicas** at `1`. One replica is sufficient for rolling replacement; increasing it is optional for this stateless app but is not required for deployment continuity.

Under **Swarm Settings → Update Config**, paste the contents of [`deploy/dokploy.update-config.json`](../deploy/dokploy.update-config.json):

```json
{
  "Parallelism": 1,
  "Delay": 0,
  "FailureAction": "rollback",
  "Monitor": 60000000000,
  "MaxFailureRatio": 0,
  "Order": "start-first"
}
```

Under **Swarm Settings → Rollback Config**, paste [`deploy/dokploy.rollback-config.json`](../deploy/dokploy.rollback-config.json):

```json
{
  "Parallelism": 1,
  "Delay": 0,
  "FailureAction": "pause",
  "Monitor": 60000000000,
  "MaxFailureRatio": 0,
  "Order": "start-first"
}
```

Under **Health Check**, paste [`deploy/dokploy.healthcheck.json`](../deploy/dokploy.healthcheck.json):

```json
{
  "Test": ["CMD", "wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/healthz"],
  "Interval": 5000000000,
  "Timeout": 3000000000,
  "StartPeriod": 10000000000,
  "Retries": 3
}
```

Dokploy durations are nanoseconds: `5000000000` is 5 seconds and `60000000000` is 60 seconds. The same health check is also built into the image.

### 4. Retain old static assets

In **Advanced → Volumes**, add a named **Volume Mount**:

- **Volume name:** `meteora-launch-assets`
- **Mount path:** `/usr/share/nginx/html/assets`

At container startup, `deploy/start.sh` adds the new build's fingerprinted files without deleting previous versions. Do not mount this volume at the entire HTML directory: `index.html` must belong to each new container, not remain sticky from an older deployment. Do not share this volume with another application.

Without the volume, rolling HTTP updates still work, but a browser on an old deployment could request a lazy-loaded asset that the replacement no longer has. Keep the volume for complete asset continuity.

### 5. Deploy and verify

Click **Deploy**, wait for the health check, then verify:

```sh
curl -i https://YOUR_DOMAIN/healthz
curl -I https://YOUR_DOMAIN/token/6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx
```

Expected results:

- `/healthz` returns `200` with `ok` and `Cache-Control: no-store`.
- The token URL returns `200` HTML rather than an Nginx `404`; React resolves the CA client-side.
- The HTML is revalidated, while files below `/assets/` have a one-year immutable cache policy.

Enable **Autodeploy** only after the first manual deployment succeeds.

## Check an update for dropped requests

Run this against the production health endpoint while deploying a second time:

```sh
while true; do curl -s -o /dev/null -w '%{http_code} %{time_total}s\n' https://YOUR_DOMAIN/healthz; sleep 0.5; done
```

Every response should remain `200`. Also keep a normal page open during the update and verify that it still loads its existing assets afterward.

## Rollback

Use Dokploy's deployment history to redeploy the last known-good image. The same `start-first` and health-check process applies. The assets volume is additive, so the old image's fingerprints remain available.

## Local container check

With Docker installed:

```sh
docker build -t meteora-launch .
docker run --rm --name meteora-launch \
  -p 8080:8080 \
  -v meteora-launch-assets:/usr/share/nginx/html/assets \
  meteora-launch
```

Then open `http://localhost:8080`, check `/healthz`, and refresh a `/token/<CA>` URL directly.

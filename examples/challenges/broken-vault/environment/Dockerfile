# Reference only — not built, pulled, or executed by Sentry today.
#
# This file demonstrates where an interactive challenge's build
# instructions would live inside a package. The importer stores
# environment/ files as opaque bytes in the archive (if present at all)
# but never reads or acts on them — see docs/architecture/challenge-runtime.md
# for what's real today (the data model + API) versus what this is the
# landing point for (an actual LocalDockerRuntime/KubernetesRuntime that
# would build and run something like this).

FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci --omit=dev
EXPOSE 8080
CMD ["node", "server.js"]

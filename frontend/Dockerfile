# CampusPilot frontend — built once with Vite, served by nginx.
#
# The backend URL is injected at CONTAINER START, not baked in at build
# time — so this same image works unchanged whether it's run locally next
# to the backend container (API_BASE defaults to http://localhost:8000) or
# deployed live pointing at a real backend URL later (just set API_BASE).

# ---- Stage 1: build the static app -----------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Stage 2: serve it with nginx --------------------------------------
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Keep a pristine copy of index.html (with the <!--RUNTIME_CONFIG--> marker
# still in it) to regenerate from on every container start — not just the
# first one — so a `docker restart` (same container, no rebuild) still
# picks up whatever API_BASE it's given instead of silently keeping
# whatever got baked in on the previous start.
RUN cp /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html.tmpl
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.d/40-campuspilot-config.sh
RUN chmod +x /docker-entrypoint.d/40-campuspilot-config.sh

ENV API_BASE=http://localhost:8000
EXPOSE 80

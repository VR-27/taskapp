# Stage 1 — Build React app
FROM node:20-alpine AS builder
WORKDIR /app

# Cache npm install layer separately
COPY package*.json ./
RUN npm install

# Build production bundle
COPY . .
RUN npm run build

# Stage 2 — Serve with Nginx (tiny image, no Node)
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html

# Simple nginx config to serve SPA (handle React router)
RUN printf 'server {\n\
  listen 3000;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / { try_files $uri $uri/ /index.html; }\n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package.json package-lock.json ./

# Instalación limpia para entornos de CI
RUN npm ci

COPY . .

# Argumentos de Vite (vienen del cloudbuild.yaml)
ARG VITE_API_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_APP_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# Comando de build de npm
RUN npm run build

# ── Stage 2: serve con nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Verificamos que Vite use la carpeta 'dist' (es el estándar)
COPY --from=builder /app/dist /usr/share/nginx/html

# Tu archivo nginx.conf optimizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
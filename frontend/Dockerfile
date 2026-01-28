# ============================================
# STAGE 1: Builder (сборка проекта)
# ============================================
FROM node:25-alpine AS builder

WORKDIR /app

# Копируем только package.json и package-lock.json для кэширования
# Если зависимости не изменились, Docker возьмёт этот слой из кэша
COPY package.json package-lock.json ./

# npm ci - быстрая установка из lock файла (для CI/CD)
RUN npm ci --legacy-peer-deps

# Копируем весь исходный код
COPY . .

# Собираем production build
# Vite создаст папку dist/ с минифицированными файлами
RUN npm run build


# ============================================
# STAGE 2: Production (Nginx + статика)
# ============================================
FROM nginx:alpine

# Копируем собранные файлы из builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем наш production конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx работает на порту 80
EXPOSE 80

# CMD не нужна - nginx:alpine автоматически запускает nginx
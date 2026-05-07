FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx vite build

RUN find /app/dist -type f \
    \( -name "*.js" -o -name "*.css" -o -name "*.svg" -o -name "*.html" \) \
    -exec gzip -9 -k {} \;

FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -name "*.gz" -exec chown nginx:nginx {} \;

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
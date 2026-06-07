FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY shared ./shared
COPY frontend ./frontend
RUN npm install -w shared -w frontend
RUN npm run build -w shared
ARG VITE_API_URL=https://territorygridbackend.onrender.com/
ARG VITE_SOCKET_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL VITE_SOCKET_URL=$VITE_SOCKET_URL
RUN npm run build -w frontend

FROM nginx:alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80

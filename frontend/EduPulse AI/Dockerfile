# Stage 1: Build React Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build-time env vars for Vite
ARG VITE_GROQ_API_KEY=
ENV VITE_GROQ_API_KEY=$VITE_GROQ_API_KEY

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve built assets with Nginx
FROM nginx:alpine

# Copy built distribution files from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

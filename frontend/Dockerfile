# ---------- Build React ----------
FROM node:18 as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ⬅️ FIX: Allocate 8GB memory for node build
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build


# ---------- Serve with NGINX ----------
FROM nginx:stable
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

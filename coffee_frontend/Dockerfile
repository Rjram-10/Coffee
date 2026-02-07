# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# For Vite apps, we often need a custom nginx config to handle client-side routing
# but since this app is relatively simple, we'll start with the default.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

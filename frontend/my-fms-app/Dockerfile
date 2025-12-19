# Stage 1: Build the app
FROM node:22 AS build

ARG VITE_API_BACKEND_SERVER
ARG VITE_AZURE_CLIENT_ID

ENV VITE_API_BACKEND_SERVER=${VITE_API_BACKEND_SERVER}
ENV VITE_AZURE_CLIENT_ID=${VITE_AZURE_CLIENT_ID}

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine



WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]

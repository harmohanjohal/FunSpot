FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG REACT_APP_API_URL
ARG REACT_APP_IMAGE_SERVICE_URL
ARG REACT_APP_WEB_SERVICES_URL

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_IMAGE_SERVICE_URL=$REACT_APP_IMAGE_SERVICE_URL
ENV REACT_APP_WEB_SERVICES_URL=$REACT_APP_WEB_SERVICES_URL

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
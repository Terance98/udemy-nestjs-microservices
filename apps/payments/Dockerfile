FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./

COPY tsconfig.json tsconfig.json

RUN npm install -g pnpm

RUN pnpm install

COPY apps/payments apps/payments
COPY libs libs

RUN cd apps/payments && pnpm install

RUN pnpm run build

FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --prod

# We are copying the build we made from the development build command above and using it with the production dependencies
COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/payments/main"]

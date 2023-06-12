### Stage 1: Build
FROM node:19-alpine AS base
RUN npm --location=global install  pnpm

### Stage 2: download dependencies
FROM base as dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml tsconfig.build.json tsconfig.josn ./
RUN pnpm install --frozen-lockfile

### Stage 3: build + delete dev dependencies
FROM base as build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --prod


### Stage 4: Final
FROM base as deploy
WORKDIR /app
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/tsconfig.build.json ./tsconfig.build.json
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["pnpm", "start:prod"]

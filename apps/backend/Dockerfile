# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and prisma schema
COPY . .

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built files and prisma schema from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/ecosystem.config.js ./

# Install PM2 globally for process management
RUN npm install pm2 -g
RUN npx prisma generate

EXPOSE 3000

# Start via PM2
CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]

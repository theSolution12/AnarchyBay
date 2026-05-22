# Stage 1: Build dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only to keep the image small
RUN npm install --omit=dev

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy dependencies from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and package files
COPY package.json ./
COPY src ./src

# Expose the port your backend uses
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

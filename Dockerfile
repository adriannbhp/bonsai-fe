# Gunakan image Node.js resmi
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh source code
COPY . .

# Build Next.js (output .next)
RUN npm run build

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start Next.js dengan port 8080
ENV PORT 8080
CMD ["npm", "start"]
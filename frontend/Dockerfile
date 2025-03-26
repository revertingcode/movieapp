# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite application for production
RUN npm run build

# Install serve to run the built application
RUN npm install -g serve

# Expose the port the app will run on
EXPOSE 3001

# Command to run the application
CMD ["serve", "-s", "dist", "-l", "3001"]
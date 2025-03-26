# Use an official Node runtime as a parent image
FROM node:14-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Build the React app
RUN npm run build

# Use an Nginx image to serve the built app
FROM nginx:alpine

# Copy the built app files to the Nginx server
COPY --from=0 /usr/src/app/build /usr/share/nginx/html

# Expose the port Nginx runs on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
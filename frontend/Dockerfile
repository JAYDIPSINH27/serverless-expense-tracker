# Stage 1: Build the React app
FROM node:14-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
ENV REACT_APP_BASE_URL=https://nsziq2w394.execute-api.us-east-1.amazonaws.com/prod
ENV REACT_APP_USER_POOL_ID=us-east-1_qHroeVVYU
ENV REACT_APP_CLIENT_ID=5stunil7s5rutjjl8v8ft1je5o
RUN npm run build

# Stage 2: Serve the React app
FROM nginx:alpine

# Copy the built React app from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

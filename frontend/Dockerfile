# Stage 1: Build the React app
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .


# Set environment variables
ENV REACT_APP_BASE_URL=${REACT_APP_BASE_URL}
ENV REACT_APP_USER_POOL_ID=${REACT_APP_USER_POOL_ID}
ENV REACT_APP_CLIENT_ID=${REACT_APP_CLIENT_ID}

# RUN npm start
CMD ["npm", "start"]

# # Stage 2: Serve the React app
# FROM nginx:alpine

# # Copy the built React app from the build stage
# COPY --from=build /app/build /usr/share/nginx/html

# COPY nginx.conf /etc/nginx/nginx.conf

# # Expose port 80
# EXPOSE 80

# # Start nginx
# CMD ["nginx", "-g", "daemon off;"]

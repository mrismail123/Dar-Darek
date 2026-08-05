# Use an official lightweight Node runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose backend port and start the server
EXPOSE 5000
CMD ["npm", "start"]
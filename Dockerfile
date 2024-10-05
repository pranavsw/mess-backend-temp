# Use Node.js official image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the app files and .env file
COPY . .
COPY env/.env .env

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "app.js"]

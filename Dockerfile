# Use an official Node.js runtime as a parent image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD [ "node", "index.js" ]

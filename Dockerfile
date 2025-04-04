FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 
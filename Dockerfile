# Use Node.js version 18.18.0 as the base image
FROM node:18.18.0

# Set the working directory inside the container to /usr/src/app
WORKDIR /usr/src/app

# Install essential build tools
RUN apt-get update && apt-get install -y build-essential

# Copy the package.json and package-lock.json (if available) files
COPY package*.json ./

# Install the dependencies specified in package.json
RUN npm install

# Copy the rest of your application's source code
COPY . .

# Expose the port that your application will run on
EXPOSE 3000

# Define the command to run your application
CMD ["node", "app.js"]

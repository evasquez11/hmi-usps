# Use Node.js version 18.18.0 as the base image
FROM node:18.18.0

# Set the working directory inside the container to /usr/src/app
WORKDIR /usr/src/app

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

# Create a new stage for Python
FROM python:3.8 AS python

# Set the working directory inside the container to /usr/src/app
WORKDIR /usr/src/app

# Install the necessary Python libraries
RUN pip install adafruit-blinka
RUN pip install adafruit-circuitpython-tlv493

# Copy only the necessary files from the node stage
COPY --from=node /usr/src/app /usr/src/app

# Define the command to run your application
CMD ["node", "app.js"]

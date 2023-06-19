# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

RUN mkdir /.npm
RUN chown -R 10140:0 "/.npm"

USER 10140

# Expose the port that the application will listen on
EXPOSE 3000

# Set the command to run your application
CMD ["npm", "start"]
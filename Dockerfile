FROM node:16

WORKDIR /app

# Copy and download dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the source files into the image
COPY . .
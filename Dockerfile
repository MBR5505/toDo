# use a slim Node image
FROM node:18-alpine

# set our working directory
WORKDIR /app

# copy manifest and install deps
COPY package*.json ./
RUN npm install

# copy all source (including your views/ and public/ folders)
COPY . .

# document which port your Express app listens on
EXPOSE 3000

# run the server (make sure your package.json has a "start" script, e.g. "node server.js")
CMD ["npm", "start"]

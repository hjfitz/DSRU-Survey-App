FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY yarn.lock ./
 
RUN npm set strict-ssl false
RUN npm install
# If you are building your code for production

# Bundle app source
COPY . .

RUN npm run build
EXPOSE 5000
CMD [ "npm", "start" ]

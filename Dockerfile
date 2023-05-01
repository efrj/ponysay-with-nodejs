FROM node:latest

# Dependencies
RUN apt-get update && \
    apt-get install -y texinfo git python3 asciinema && \
    apt-get clean

# Ponysay
RUN git clone https://github.com/erkin/ponysay.git && \
    cd ponysay && \
    ./setup.py --freedom=partial install && \
    cd .. && \
    rm -rf ponysay

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
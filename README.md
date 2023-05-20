# CYBOT - A Cybersecurity CHATBOT

## Requirements

- Python Python 3.10.8
- Node version 14.21.2

## Server Setup

1. Install Python libraries by running the following command in the `/server` directory:
pip install -r requirements.txt

## Client Setup

1. Install node modules by running the following command in the `/client` directory:
npm install


## Starting the Server

1. Open three separate terminals.
2. In each terminal, navigate to the `/server` directory.
3. Start the server by running the following command for each Python file:
python emailSpamDetection.py
python flask_demo.py
python index_server.py



## Starting the Client

1. In a new terminal, navigate to the `/client` directory.
2. Start the client application using the following command:
npm start

## Postman curls 

1. curl --location 'http://localhost:8080/emailScanner' \
--header 'Content-Type: application/json' \
--data '
 {"text": "Are you an experienced Python developer seeking a high-high-paying role with the flexibility to work remotely? Your dream remote role awaits you! Take a step towards it with Python Jump Start on Wednesday November 23rd at 8am PT . With this 3-hour virtual event, you get thoroughly vetted for quality opportunities and stand a chance to make it to client interviews. Come prepared to pass the Python tests during the event as a high score will qualify you for the client interviews!"}
'
2. curl --location 'localhost:5601/filter-text' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data-raw '{
  "text": "Hello, my email is john@example.com and my phone number is 123-456-7890."
}
'
3. curl --location 'localhost:5601/uploadFile' \
--form 'filename.pdf"'
4. curl --location --request POST 'localhost:5601/removeFile'



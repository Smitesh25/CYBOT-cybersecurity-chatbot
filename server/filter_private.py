import re
import cleantext
import ssl
from flask_cors import CORS
ssl._create_default_https_context = ssl._create_unverified_context
import spacy


import nltk
from flask import Flask, request, jsonify
from nameparser.parser import HumanName

nltk.download('maxent_ne_chunker')
nltk.download('words')

class FilterPvtInfo:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

    
    def removeNumber(self, text):
        return cleantext.replace_numbers(text, replace_with="<NUMBER>")
    
    def removeEmail(self, text):
        return cleantext.replace_emails(text, replace_with="<EMAIL>")
    
    def removeURL(self, text):
        return cleantext.replace_urls(text, replace_with="<URL>")
    
    def removePhone(self, text):
        return cleantext.replace_phone_numbers(text, replace_with="<PHONE>")
    
    def removeID(self, text):
        return re.sub(r'\w+\d\w*', "<ID>", text)
    
    def removeName(self, text):
        doc = self.nlp(text)
        filtered_text = []
        for token in doc:
            if token.ent_type_ == "PERSON":
                filtered_text.append("<NAME>")
            else:
                filtered_text.append(token.text)
        return " ".join(filtered_text)
    
    def filter(self, text):
        text = self.removeNumber(text)
        text = self.removeEmail(text)
        text = self.removeURL(text)
        text = self.removePhone(text)
        text = self.removeID(text)
        text = self.removeName(text)
        return text
    

app = Flask(__name__)
CORS(app) 
pvt = FilterPvtInfo()

@app.route('/filter', methods=['POST'])
def filter_text():
    data = request.get_json()
    input_text = data['text']
    
    filtered_text = pvt.filter(input_text)
    
    response = {
        'filtered_text': filtered_text
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=8080)


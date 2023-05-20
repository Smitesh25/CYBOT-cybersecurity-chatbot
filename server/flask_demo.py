import os
from multiprocessing.managers import BaseManager
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename
import cleantext
import re
import nltk
import ssl

app = Flask(__name__)
CORS(app)

manager = BaseManager(('', 5602), b'password')
manager.register('query_index')
manager.register('insert_into_index')
manager.register('get_documents_list')
manager.register('remove_from_index')
manager.connect()


@app.route("/query", methods=["GET"])
def query_index():
    global manager
    query_text = request.args.get("text", None)
    print(query_text)
    if query_text is None:
        return "No text found, please include a ?text=blah parameter in the URL", 400
    print(query_text)
    
    response = manager.query_index(query_text)._getvalue()
    print(response)
    response_json = {
        "text": str(response),
        "sources": [{"text": str(x.source_text), 
                     "similarity": round(x.similarity, 2),
                     "doc_id": str(x.doc_id),
                     "start": x.node_info['start'],
                     "end": x.node_info['end']
                    } for x in response.source_nodes]
    }
    return make_response(jsonify(response_json)), 200


@app.route("/uploadFile", methods=["POST"])
def upload_file():
    print(get_documents())
    global manager
    if 'file' not in request.files:
        return "Please send a POST request with a file", 400
    
    filepath = None
    try:
        uploaded_file = request.files["file"]
        filename = secure_filename(uploaded_file.filename)
        filepath = os.path.join('documents', os.path.basename(filename))
        uploaded_file.save(filepath)

        if request.form.get("filename_as_doc_id", None) is not None:
            manager.insert_into_index(filepath, doc_id=filename)
        else:
            manager.insert_into_index(filepath)
    except Exception as e:
        if filepath is not None and os.path.exists(filepath):
            os.remove(filepath)
        return "Error: {}".format(str(e)), 500

    if filepath is not None and os.path.exists(filepath):
        os.remove(filepath)

    return "File inserted!", 200


@app.route("/getDocuments", methods=["GET"])
def get_documents():
    document_list = manager.get_documents_list()._getvalue()

    return make_response(jsonify(document_list)), 200
    

@app.route("/")
def home():
    return "Hello, World! Welcome to the llama_index docker image!"

@app.route("/removeFile", methods=["POST"])
def remove_file():
    global manager
    manager.remove_from_index()._getvalue()

    return "File removed successfully!", 200

class FilterPvtInfo:
    def __init__(self):
        pass

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
        tokens = nltk.tokenize.word_tokenize(text)
        pos = nltk.pos_tag(tokens)
        sentt = nltk.ne_chunk(pos, binary=False)
        person_list = []
        person = []
        name = ""
        for subtree in sentt.subtrees(filter=lambda t: t.label() == 'PERSON'):
            for leaf in subtree.leaves():
                person.append(leaf[0])
            if len(person) > 1:  
                for part in person:
                    name += part + ' '
                if name[:-1] not in person_list:
                    person_list.append(name[:-1])
                name = ''
            person = []

        p_list = []

        for word in person_list:
            for w in word.split(' '):
                p_list.append(w)

        for word in text.split(' '):
            if word in p_list:
                text = text.replace(word, '<NAME>')

        return text

    def filter(self, text):
        # text = self.removeNumber(text)
        text = self.removeEmail(text)
        text = self.removeURL(text)
        text = self.removePhone(text)
        # text = self.removeID(text)
        text = self.removeName(text)
        return text


pvt = FilterPvtInfo()
@app.route('/filter-text', methods=['POST'])
def filter_text():
    data = request.get_json()
    text = data['text']
    filtered_text = pvt.filter(text)
    return jsonify({'filtered_text': filtered_text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5601)

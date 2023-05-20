import pickle
import ssl
from flask_cors import CORS
ssl._create_default_https_context = ssl._create_unverified_context
from flask import Flask, request, jsonify

app = Flask(__name__)
CORS(app)


@app.route('/emailScanner', methods=['POST'])
def filter_text():
    data = request.get_json()
    input_text = data['text']
    print(input_text)
    loaded_vec = pickle.load(open("Vectorizer.pkl", "rb"))
    loaded_model = pickle.load(open("model.pkl", "rb"))
    Email1 = [input_text]

    result = "Spam"
    if loaded_model.predict(loaded_vec.transform(Email1))[0] == 0:
        result = "Non-Spam"

    response = {
        'result': result
    }

    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True, port=9009)

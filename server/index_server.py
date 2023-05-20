from llama_index import SimpleDirectoryReader, GPTSimpleVectorIndex, Document, ServiceContext
from multiprocessing.managers import BaseManager
from multiprocessing import Lock
import os
import pickle
from dotenv import load_dotenv


load_dotenv()


import os

api_key = os.getenv("OPENAI_API_KEY")
os.environ['OPENAI_API_KEY'] = api_key


index = None
stored_docs = {}
lock = Lock()

index_name = "./index.json"
pkl_name = "stored_documents.pkl"


def initialize_index():
    global index, stored_docs

    service_context = ServiceContext.from_defaults(chunk_size_limit=512)
    with lock:
        if os.path.exists(index_name):
            index = GPTSimpleVectorIndex.load_from_disk(
                index_name, service_context=service_context)
        else:
            index = GPTSimpleVectorIndex([], service_context=service_context)
            index.save_to_disk(index_name)
        if os.path.exists(pkl_name):
            with open(pkl_name, "rb") as f:
                stored_docs = pickle.load(f)


def query_index(query_text):
    global index
    response = index.query(query_text)
    return response


def insert_into_index(doc_file_path, doc_id=None):
    global index, stored_docs
    document = SimpleDirectoryReader(
        input_files=[doc_file_path]).load_data()[0]
    if doc_id is not None:
        document.doc_id = doc_id

    with lock:
        stored_docs[document.doc_id] = document.text[0:200]

        index.insert(document)
        index.save_to_disk(index_name)

        with open(pkl_name, "wb") as f:
            pickle.dump(stored_docs, f)

    return


def get_documents_list():
    global stored_doc
    documents_list = []
    for doc_id, doc_text in stored_docs.items():
        documents_list.append({"id": doc_id, "text": doc_text})

    return documents_list


def remove_from_index():
    global index, stored_docs
    with lock:
        if os.path.exists(pkl_name):
            os.remove(pkl_name)
        if os.path.exists(index_name):
            os.remove(index_name)

        stored_docs.clear()
        index = GPTSimpleVectorIndex([]) 


if __name__ == "__main__":
    print("initializing index...")
    initialize_index()

    manager = BaseManager(('', 5602), b'password')
    manager.register('query_index', query_index)
    manager.register('insert_into_index', insert_into_index)
    manager.register('get_documents_list', get_documents_list)
    manager.register('remove_from_index', remove_from_index)
    server = manager.get_server()

    print("server started...")
    server.serve_forever()

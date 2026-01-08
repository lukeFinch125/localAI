import ollama
import chromadb
import psycopg
import ast
from tqdm import tqdm
from psycopg.rows import dict_row
from colorama import Fore
from chromadb.config import Settings

client = chromadb.PersistentClient(path="./chroma")

vector_db_name = "messages"
existing_collections = [c.name for c in client.list_collections()]
if vector_db_name in existing_collections:
    vector_db = client.get_collection(name=vector_db_name)
    print("loaded existing vector db")
else:
    vector_db = client.create_collection(name=vector_db_name)
    print("created new vector db")

print(f"Vector DB currently contains {vector_db.count()} items.")

chatModel = "llama3.1"
encodingModel = "nomic-embed-text:latest"
recallMode = False
searchMode = False
current_conversation_id = None

def toggle_recall_mode():
    global recallMode
    if recallMode == True:
        recallMode = False
    else:
        recallMode = True
    print("Toggled Recall Mode: ")
    print(recallMode)
    return recallMode

def toggle_search_mode():
    global searchMode
    if searchMode == True:
        searchMode = False
    else:
        searchMode = True
    print("Toggled Search Mode: ")
    print(searchMode)
    return searchMode

def set_chat_model(model: str):
    global chatModel
    chatModel = model
    print("New Chat Model: " + model)
    return chatModel

def set_encoding_model(model: str):
    global encodingModel
    encodingModel = model
    print("New encoding Model: " + model)
    return encodingModel


system_prompt = (
'You are an AI assistant that has memory of every conversation you have ever had with the user.'
'On every prompt from the user, the system has checked for any relevant messages you have had with the user.'
'If any embedded previous conversations are attached, use them for context to responding to the user,'
'if the context is relevant and useful to responding. If the realled conversation is irrelevant,'
'disregard speaking about them and respond normally as an AI assistant. Do not talk about recalling conversations.'
'Just use any useful data from the previous conversations and respond normally as an intelligent AI assistant.'
)

convo = [{'role': 'system', 'content': system_prompt}]


DB_PARAMS = {
    'dbname': 'memory_agent',
    'user': 'lfinch',
    'host': '/run/postgresql',
}

def list_models():
    result = ollama.list()
    return [model["model"] for model in result["models"]]


def connect_db():
    conn = psycopg.connect(**DB_PARAMS)
    return conn

def fetch_all_messages():
    conn = connect_db()
    with conn.cursor(row_factory=dict_row) as cursor:
        cursor.execute('SELECT * FROM messages')
        messages = cursor.fetchall()
    conn.close()
    return messages

def store_message(prompt, response):
    message = {'prompt': prompt, 'response': response, 'id': 'some_unique_id_here'}
    add_message_to_vector_db(message)  # pass a dict
    conn = connect_db()
    with conn.cursor() as cursor:
        cursor.execute(
            'INSERT INTO messages (timestamp, prompt, response, conversation_id) VALUES (CURRENT_TIMESTAMP, %s, %s, %s)',
            (prompt, response, current_conversation_id)
        )
        conn.commit()
    conn.close()


def remove_last_conversation():#this is broken
    if True:
        print("Need to fix remove last conversation")
        return
    conn = connect_db()
    with conn.cursor() as cursor:
        cursor.execute('DELETE FROM conversations WHERE id = (SELECT MAX(id) FROM conversations)')
        cursor.commit()
    conn.close()

def start_new_conversation(title):
    conn = connect_db()
    with conn.cursor() as cursor:
        cursor.execute(
            'INSERT INTO conversations (title) VALUES (%s) RETURNING conversation_id',
            (title,)
        )
        conversation_id = cursor.fetchone()[0]
        conn.commit()
    conn.close()

    global convo
    convo = [{'role': 'system', 'content': system_prompt}]

    global current_conversation_id
    current_conversation_id = conversation_id
    return conversation_id

def create_summary(prompt):
    summarize_conversation_msg = (
        'You are a AI agent whos job it is to summarize user prompts into 3 or 4 words maximum.' +
        'All you do is return a summary for the prompt you are given. Do not explain why you ' +
        'Summarized it a certain way or say anything else besides a short summary'
    )
    summarize_conversation_convo = [
        {'role': 'system', 'content': summarize_conversation_msg},
        {'role': 'user', 'content': 'Write an email to my car insurance company.'},
        {'role': 'assistant', 'content': 'email to insurance'},
        {'role': 'user', 'content': 'how can I convert the speak function in my llama3 python voice assistant to use pyttsx3 instead of OpanAI TTS?'},
        {'role': 'assistant', 'content': 'voice assistant help'},
        {'role': 'user', 'content': prompt}
    ]

    response = ollama.chat(model='llama3.1', messages=summarize_conversation_convo)

    return response['message']['content']





def summarize_conversation_list():
    conn = connect_db()
    with conn.cursor() as cursor:
        cursor.execute(
            'WITH first_messages AS ( '
            '   SELECT DISTINCT ON (conversation_id) '
            '       conversation_id, '
            '       prompt, '
            '       timestamp '
            '   FROM messages '
            '   ORDER BY conversation_id DESC, timestamp ASC '
            ') '
            'SELECT conversation_id, prompt '
            'FROM first_messages '
            'ORDER BY conversation_id DESC '
            'LIMIT 20;'
        )
        prompts = cursor.fetchall()
        conn.close()
    
    summary_list = []
    for conversation_id, prompt_text in prompts:
        summary = create_summary(prompt_text)
        summary_list.append({'summary': summary, 'conversation_id': conversation_id})
    return summary_list

def get_conversation(conversation_id: int):
    conn = connect_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT prompt, response
                FROM messages
                WHERE conversation_id = %s
                ORDER BY timestamp;
                """,
                (conversation_id,)
            )
            messages = cursor.fetchall()
    finally:
        conn.close()

    return messages

def stream_response(prompt):
    response = ''
    stream = ollama.chat(model=chatModel, messages=convo, stream=True)
    print(Fore.LIGHTGREEN_EX + '\nASSISTANT:')

    for chunk in stream:
        content = chunk['message']['content']
        response += content
        print(content, end='', flush=True)

    print('\n')
    store_message(prompt=prompt, response=response)
    convo.append({'role': 'assistant', 'content': response})

def standard_response(prompt):
    response = ollama.chat(model=chatModel, messages=convo)
    responseString = response["message"]["content"]
    print(Fore.LIGHTGREEN_EX + '\nASSISTANT: \n ' + responseString)
    store_message(prompt=prompt, response=responseString)
    convo.append({'role': 'assistant', 'content': responseString})
    return responseString

def add_message_to_vector_db(message):
    """
    Adds a message to the Chroma collection.
    Only adds new messages; avoids duplicating existing ones.
    """
    # Get existing data for this ID
    existing = vector_db.get(ids=[str(message['id'])])
    existing_ids_list = existing.get('ids', [])

    # Check if any IDs were returned
    if existing_ids_list and existing_ids_list[0]:
        print(f"Message {message['id']} already in vector DB. Skipping.")
        return

    # Create embedding
    serialized_convo = f"prompt: {message['prompt']} response: {message['response']}"
    embedding = ollama.embeddings(model=encodingModel, prompt=serialized_convo)['embedding']

    vector_db.add(
        ids=[str(message['id'])],
        embeddings=[embedding],
        documents=[serialized_convo],
        metadatas=[{"conversation_id": str(message.get('conversation_id', ''))}]
    )
    print(f"Added message {message['id']} to vector DB.")



def load_messages_from_db(messages):
    """
    Load messages from PostgreSQL into Chroma if they aren't already in the vector DB.
    """
    for m in messages:
        msg = {
            'prompt': m['prompt'],
            'response': m['response'],
            'id': m['id'],
            'conversation_id': m.get('conversation_id')
        }
        add_message_to_vector_db(msg)
    print(f"Finished loading messages into vector DB.")

def retrieve_embeddings(queries, results_per_query=2):
    embeddings = set()

    for query in tqdm(queries, desc='Processing queries to vector database'):
        response = ollama.embeddings(model=encodingModel, prompt=query)
        query_embedding = response['embedding']

        vector_db = client.get_collection(name='messages')
        results = vector_db.query(query_embeddings=[query_embedding], n_results=results_per_query)
        best_embeddings = results['documents'][0]

        for best in best_embeddings:
            if best not in embeddings:
                if 'yes' in classify_embedding(query=query, context=best):
                    embeddings.add(best)

    return embeddings


def create_queries(prompt):
    query_msg = (
        'You are a first principal reasoning search query AI agent. '
        'Your list of search queries will be ran on an embedding database of all your conversations '
        'you have ever had with the user. With first principals create a python list of queries to '
        'search the embeddings database for any data that would be necessary to have access to in '
        'order to correctly respond to the prompt. Your response must be a Python list with no syntax errors. '
        'Do not explain anything and do not ever generate anything but a perfect syntax Python list'
    )
    query_convo = [
        {'role': 'system', 'content': query_msg},
        {'role': 'user', 'content': 'Write an email to my car insurance company and create a pursuasive request for them to lower my monthly rate.'},
        {'role': 'assistant', 'content': '["What is the users name?", "What is the users current auto insurance provider?", "What is the monthly rate the user currently pays for auto insurance?"]'},
        {'role': 'user', 'content': 'how can I convert the speak function in my llama3 python voice assistant to use pyttsx3 instead of OpanAI TTS?'},
        {'role': 'assistant', 'content': '["Llama3 voice assistant", "Python voice assistant", "OpanAI TTS", "openai speak"]'},
        {'role': 'user', 'content': prompt}
    ]

    response = ollama.chat(model=chatModel, messages=query_convo)
    print(Fore.YELLOW + f'\nVector database queries: {response["message"]["content"]}\n')

    try:
        return ast.literal_eval(response['message']['content'])
    except:
        return [prompt]
    
def classify_embedding(query, context):
    classify_msg = (
        'You are an embedding classification AI agent. Your input will be a prompt and one embedded chunk of text. '
        'You will not respond as an AI assistant. You only respond "yes" or "no". '
        'Determine whether the context contains data that directly is related to the search query. '
        'If the context is seemingly exactly what the search query needs, respond "yes" if it is anything but directly '
        'related respond "no". Do not respond "yes" unless the content is highly relevant to the search query.'
    )
    classify_convo = [
        {'role': 'system', 'content': classify_msg},
        {'role': 'user', 'content': f'SEARCH QUERY: What is the users name? \n\nEMBEDDED CONTENT: You are Luke Finch. How can I help today Luke?'},
        {'role': 'assistant', 'content': 'yes'},
        {'role': 'user', 'content': f'SEARCH QUERYL Llama 3 Python Voice Assistant \n\nEMBEDDED CONTENT: Siri is a voice assistant on Apple iOS and Mac OS.'},
        {'role': 'assistant', 'content': 'no'},
        {'role': 'user', 'content': f'SEARCH QUERY: {query} \n\nEMBEDDED CONTEXT: {context}'}
    ]

    response = ollama.chat(model=chatModel, messages=classify_convo)

    return response['message']['content'].strip().lower()

def recall(prompt):
    queries = create_queries(prompt=prompt)
    embeddings = retrieve_embeddings(queries=queries)
    convo.append({'role': 'user', 'content': f'MEMORIES: {embeddings} \n\n USER PROMPT: {prompt}'})
    print(f'\n{len(embeddings)} message: response embeddings added for context.')

def search(prompt):
    print("searching")

def initialize_vector_db():
    """
    Initializes the Chroma vector DB.
    Loads an existing collection if it exists, or creates a new one.
    Only adds messages that aren't already in the collection.
    """
    global vector_db

    existing_collections = [c.name for c in client.list_collections()]

    if vector_db_name in existing_collections:
        vector_db = client.get_collection(name=vector_db_name)
        print("Loaded existing vector DB")
    else:
        vector_db = client.create_collection(name=vector_db_name)
        print("Created new vector DB")

    # Only load messages from PostgreSQL if the collection is empty
    if vector_db.count() == 0:
        print("Vector DB is empty, loading messages from PostgreSQL...")
        messages = fetch_all_messages()
        for m in messages:
            # Ensure conversation_id exists
            if m['conversation_id'] is not None:
                msg = {
                    'prompt': m['prompt'],
                    'response': m['response'],
                    'id': m['id'],
                    'conversation_id': m['conversation_id']
                }
                add_message_to_vector_db(msg)
        print(f"Loaded {len(messages)} messages into vector DB")
    else:
        print(f"Vector DB already has {vector_db.count()} items. No messages loaded.")

initialize_vector_db()

def handle_prompt(prompt: str) -> str:
    global convo
    global recallMode
    global searchMode
    global current_conversation_id
    if current_conversation_id is None:
        current_conversation_id = start_new_conversation("test")
    clean_prompt = prompt.strip()

    if recallMode == True:
        recall(prompt=clean_prompt)
        response = standard_response(prompt=clean_prompt)
        return response, current_conversation_id

    elif searchMode == True:
        search(clean_prompt)
        response = standard_response(prompt=clean_prompt)
        return response, current_conversation_id

    elif clean_prompt.lower().startswith("/forget"):
        remove_last_conversation()
        convo = convo[:-2]
        return "Forgotten by Model"
        
    elif clean_prompt.lower().startswith("/memorize"):
        clean_prompt = clean_prompt[10:].strip()
        store_message(prompt=clean_prompt, response='Memory stored. ')
        return "Memory stored. "

    else:
        convo.append({'role': 'user', 'content': clean_prompt})
        response = standard_response(prompt=clean_prompt)
        return response, current_conversation_id
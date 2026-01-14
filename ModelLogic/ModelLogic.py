import ollama
import chromadb
import psycopg
import ast
from tqdm import tqdm
from psycopg.rows import dict_row
from colorama import Fore
from chromadb.config import Settings
import subprocess
import re

#chroma db client that persisets
client = chromadb.PersistentClient(path="./chroma")

#load vector db into memory from persistent storage
vector_db_name = "messages"
existing_collections = [c.name for c in client.list_collections()]
#if already used then the vector db will load from memory or create a new one
if vector_db_name in existing_collections:
    vector_db = client.get_collection(name=vector_db_name)
    print("loaded existing vector db")
else:
    vector_db = client.create_collection(name=vector_db_name)
    print("created new vector db")

print(f"Vector DB currently contains {vector_db.count()} items.")

#initial values 
chatModel = "llama3.1"
encodingModel = "nomic-embed-text:latest"
recallMode = False
searchMode = False
current_conversation_id = None

#toggle recall mode
def toggle_recall_mode():
    global recallMode
    if recallMode == True:
        recallMode = False
    else:
        recallMode = True
    print("Toggled Recall Mode: ")
    print(recallMode)
    return recallMode

#toggle search mode
def toggle_search_mode():
    global searchMode
    if searchMode == True:
        searchMode = False
    else:
        searchMode = True
    print("Toggled Search Mode: ")
    print(searchMode)
    return searchMode

# change chat model
def set_chat_model(model: str):
    global chatModel
    chatModel = model
    print("New Chat Model: " + model)
    return chatModel

#change vector encoding model
def set_encoding_model(model: str):
    global encodingModel
    encodingModel = model
    print("New encoding Model: " + model)
    return encodingModel

#overarching system prompt for ai assistant
normal_system_prompt = (
    'You are an AI assistant that is in a conversation with a user. You will have access to the entire '
    'conversation messages history to better assist you in answering their questions. If the recalled conversation is irrelevant'
    'disregard speaking about them and respond normally as a intelligent AI assistant. Do not talk about'
    'recalling past conversations, just use any useful data that is given to you from the system'
)

#base prompt used when recall mode is active, telling the model it has access to all previous conversations
recall_system_prompt = (
    'You are an AI assistant that has memory of every conversation you have ever had with the user.'
    'On every prompt from the user, the system has checked for any relevant messages you have had with the user.'
    'If any embedded previous conversations are attached, use them for context to responding to the user,'
    'if the context is relevant and useful to responding. If the realled conversation is irrelevant,'
    'disregard speaking about them and respond normally as an AI assistant. Do not talk about recalling conversations.'
    'Just use any useful data from the previous conversations and respond normally as an intelligent AI assistant.'
)

DB_PARAMS = {
    'dbname': 'memory_agent',
    'user': 'lfinch',
    'host': '/run/postgresql',
}

def list_models():
    result = ollama.list()
    models = [model["model"] for model in result["models"]]
    
    cleaned_models = []
    for m in models:
        if m.startswith("nomic-embed-text"):
            continue 
        if m.endswith(":latest"):
            m = m[:-7] 
        cleaned_models.append(m)
    
    return cleaned_models

def get_amd_gpu_usage():
    result = subprocess.run(
        ["radeontop", "-d", "-", "-l", "1"],
        capture_output=True,
        text=True
    )

    match = re.search(r"gpu\s+([\d.]+)%", result.stdout)
    if match:
        return float(match.group(1))
    return None



def connect_db():
    conn = psycopg.connect(**DB_PARAMS)
    return conn

#fetch all messages from sql database
def fetch_all_messages():
    conn = connect_db()
    with conn.cursor(row_factory=dict_row) as cursor:
        cursor.execute('SELECT * FROM messages')
        messages = cursor.fetchall()
    conn.close()
    return messages

def remove_last_message_in_conversation():
    print("Current conversation id")
    print(current_conversation_id)
    conn = connect_db()
    with conn.cursor() as cursor:
        cursor.execute(
            '''
            SELECT id, prompt, response 
            FROM messages 
            WHERE conversation_id = %s 
            ORDER by id DESC 
            LIMIT 1 
            ''',
            (current_conversation_id,)
        )

        row = cursor.fetchone()

        if row is None:
            conn.close()
            return {
                "result": "No message to delete"
            }
        
        message_id, prompt, response = row

        cursor.execute(
            '''
            DELETE FROM messages
            WHERE id = %s
            ''',
            (message_id,)
        )
        conn.commit()
    conn.close()

    delete_message_from_vector_db(str(message_id))

    return {
        "result": f"Deleted message id: {message_id}"
    }
    
def delete_message_from_vector_db(message_id:str):
    try:
        vector_db.delete(ids=[message_id])
        print(f"Deleted Vector entry id={message_id}")
    except Exception as e:
        print(f"Vector delete failed for id={message_id}: {e}")

#creates new conversation and returns conversation id increment from sql
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
    convo = []
    global current_conversation_id
    current_conversation_id = conversation_id
    return conversation_id

def branch_conversation(prompt: str, response: str):
    conn = connect_db()
    with conn.cursor() as cursor:
        cursor.execute(
            "INSERT INTO conversations (title) VALUES ('New conversation') RETURNING conversation_id"
        )
        conversation_id = cursor.fetchone()[0]
        conn.commit()
    conn.close()
    global convo
    convo = []
    convo.append({"role": "user", "content": prompt})
    convo.append({"role": "assistant", "content": response})
    global current_conversation_id
    current_conversation_id = conversation_id
    store_message(prompt, response)
    return {
        "result": current_conversation_id
    }

def change_conversation(id):
    global convo
    global current_conversation_id
    current_conversation_id = id
    convo = []
    rawMessages = get_conversation(current_conversation_id)
    ollamaMessages = convert_to_ollama_messages(rawMessages)
    convo.extend(ollamaMessages)
    return current_conversation_id

#creates a summary for conversation list gui
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

def enter_ai_conversation_summary_to_db(summary: str, conversation_id: int):
    conn = connect_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                '''
                UPDATE conversations
                SET title = %s
                WHERE conversation_id = %s
                ''',
                (summary, conversation_id)
            )
        conn.commit()
    finally:
        conn.close()



#returns a summarized list of the last 20 conversations based of the first prompt of that conversation
def summarize_conversation_list():
    conn = connect_db()
    with conn.cursor() as cursor:
        cursor.execute(
            'WITH first_messages AS ( '
            '   SELECT DISTINCT ON (m.conversation_id) '
            '       m.conversation_id, '
            '       m.prompt, '
            '       m.timestamp '
            '   FROM messages m '
            '   ORDER BY conversation_id DESC, m.timestamp ASC '
            ') '
            'SELECT fm.conversation_id, fm.prompt, c.title '
            'FROM first_messages fm ' \
            'JOIN conversations c ON fm.conversation_id = c.conversation_id '
            'ORDER BY fm.conversation_id DESC '
            'LIMIT 20;'
        )
        prompts = cursor.fetchall()
        conn.close()
    
    summary_list = []
    for conversation_id, prompt_text, title in prompts:
        if(title == "New Conversations" or title == "test"):
            summary = create_summary(prompt_text)
            enter_ai_conversation_summary_to_db(summary, conversation_id)
        else:
            summary = title
        summary_list.append({'summary': summary, 'conversation_id': conversation_id})
    return summary_list

#returns messages for a given conversations
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

def convert_to_ollama_messages(raw_messages):
    """
    Converts [(prompt, response), ...] into Ollama-compatible messages.
    """
    messages = []
    for prompt, response in raw_messages:
        messages.append({"role": "user", "content": prompt})
        messages.append({"role": "assistant", "content": response})
    return messages


#not being used right now but this creates the nice stream response as tokens come in need to use in the future
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

#response being used right now
def standard_response(prompt):
    response = ollama.chat(model=chatModel, messages=convo)
    responseString = response["message"]["content"]
    #print(Fore.LIGHTGREEN_EX + '\nASSISTANT: \n ' + responseString + '\n')
    if(recallMode == False):
        store_message(prompt=prompt, response=responseString)
    convo.append({'role': 'assistant', 'content': responseString})
    return responseString

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

#store messages add vector to vector db then stores the messages in the sql database
def store_message(prompt, response):
    conn = connect_db()

    with conn.cursor() as cursor:
        cursor.execute(
            'INSERT INTO messages (timestamp, prompt, response, conversation_id) VALUES (CURRENT_TIMESTAMP, %s, %s, %s) RETURNING id',
            (prompt, response, current_conversation_id)
        )
        message_id = cursor.fetchone()[0]
        conn.commit()
    conn.close()

    message = {'prompt': prompt, 'response': response, 'id': message_id}
    add_message_to_vector_db(message)
    print(f"Message stored in vector and sql: {prompt}\n : {response}\n : message-id: {message_id}\n conversation-id: {current_conversation_id}\n")

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
        metadatas=[{
            "prompt": message["prompt"],
            "response": message["response"],
        }]
    )

def load_messages_from_db(messages):
    """
    Load messages from PostgreSQL into Chroma if they aren't already in the vector DB.
    """
    for m in messages:
        msg = {
            'prompt': m['prompt'],
            'response': m['response'],
            'id': m['id'],
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

def build_convo(system_prompt):
    global convo
    convo = [{'role': 'system', 'content': system_prompt}] + convo

def handle_prompt(prompt: str) -> str:
    global convo
    global recallMode
    global searchMode
    global current_conversation_id
    if current_conversation_id is None:
        current_conversation_id = start_new_conversation("New Conversation")
    clean_prompt = prompt.strip()

    if recallMode == True:
        build_convo(recall_system_prompt)
        recall(prompt=clean_prompt)
        response = standard_response(prompt=clean_prompt)
        return response, current_conversation_id

    elif searchMode == True:
        build_convo(recall_system_prompt)
        search(clean_prompt)
        response = standard_response(prompt=clean_prompt)
        return response, current_conversation_id

    elif clean_prompt.lower().startswith("/forget"):
        convo = convo[:-2]
        return "Forgotten by Model"
        
    elif clean_prompt.lower().startswith("/memorize"):
        clean_prompt = clean_prompt[10:].strip()
        store_message(prompt=clean_prompt, response='Memory stored. ')
        return "Memory stored. "

    else:
        build_convo(normal_system_prompt)
        convo.append({'role': 'user', 'content': clean_prompt})
        response = standard_response(prompt=clean_prompt)
        return response, current_conversation_id
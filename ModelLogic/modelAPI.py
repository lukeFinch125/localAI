from fastapi import FastAPI
from pydantic import BaseModel
import psutil
from typing import List

# import your existing logic
from ModelLogic import (
    chatModel,
    encodingModel,
    handle_prompt,
    list_models,
    set_chat_model,
    toggle_recall_mode,
    toggle_search_mode,
    searchMode,
    recallMode,
    start_new_conversation,
    current_conversation_id,
    summarize_conversation_list,
    get_conversation,
    change_conversation,
    get_amd_gpu_usage,
    remove_last_message_in_conversation,
    branch_conversation
)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


origins = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#pc stats
@app.get("/stats")
def stats():

    return {
        "cpu": psutil.cpu_percent(),
        "memory": psutil.virtual_memory().percent,
        "gpu": get_amd_gpu_usage(),
    }

@app.get("/")
def read_root():
    return {"message": "Hello World"}


#get models
@app.get("/activeModel")
def read_activeModel():
    return {"activeModel" : chatModel}

@app.get("/encodingModel")
def read_encodingModel():
    return {"encodingModel" : encodingModel}

#prompt base api
class PromptRequest(BaseModel):
    prompt: str

@app.post("/prompt")
def run_prompt(request: PromptRequest):
    response, conversation_id = handle_prompt(request.prompt)

    return {
        "prompt": request.prompt,
        "response": response,
        "model": chatModel,
        "conversationID": conversation_id
    }

#return local ollama model list
@app.get("/modelList")
def get_list():
    return list_models()


#change chat model 
class SetChatModelRequest(BaseModel):
    chatModel: str

@app.post("/setChatModel")
def change_chat_model(request: SetChatModelRequest):
    response = set_chat_model(request.chatModel)
    global chatModel
    chatModel = response
    return {
        "response": response
    }


#Search Mode
@app.post("/ToggleSearchMode")
def flip_search_mode():
    response = toggle_search_mode()
    return response

@app.get("/getSearchMode")
def get_search_mode():
    global searchMode
    print("Search Mode:")
    print(searchMode)
    return searchMode

#Recall Mode
@app.post("/ToggleRecallMode")
def flip_recall_mode():
    response = toggle_recall_mode()
    return response

@app.get("/getRecallMode")
def get_recall_mode():
    global recallMode
    print("Recall Mode:")
    print(recallMode)
    return recallMode

#start new conversation
@app.get("/startNewConversation")
def new_conversation():
    conversation_id = start_new_conversation("test")
    return conversation_id

@app.get("/getConversationBacklog")
def get_conversation_list():
    return summarize_conversation_list()

#get current conversation ID
@app.get("/getCurrentConversationID")
def get_current_conversationID():
    global current_conversation_id
    return current_conversation_id

class conversationIDClass(BaseModel):
    conversationID: int

@app.post("/setCurrentConversationID", response_model=conversationIDClass)
def set_current_conversationID(request: conversationIDClass):
    current_conversation_id = change_conversation(request.conversationID)
    return {"conversationID": current_conversation_id}

class ConversationMessage(BaseModel):
    prompt: str
    response: str

class GetConversationResponse(BaseModel):
    messages: list[ConversationMessage]

@app.post("/getConversationByID", response_model=GetConversationResponse)
def get_conversation_by_id(request: conversationIDClass):
    raw = get_conversation(request.conversationID)
    # raw is List[List[str]]

    messages = [
        ConversationMessage(prompt=msg[0], response=msg[1])
        for msg in raw
    ]

    return {"messages": messages}

@app.post("/deleteLastMessageInConversation")
def deleteLastMessageInConversation():
    return remove_last_message_in_conversation()

@app.post("/branchConversation")
def branchConversation(request: ConversationMessage):
    return branch_conversation(request.prompt, request.response)
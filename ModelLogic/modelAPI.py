from fastapi import FastAPI
from pydantic import BaseModel
import psutil
import pyamdgpuinfo

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
    recallMode
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

    pyamdgpuinfo.detect_gpus()
    first_gpu = pyamdgpuinfo.get_gpu(0)
    vram_usage = first_gpu.query_vram_usage()

    percent_vram_usage = vram_usage / 16000000000

    return {
        "cpu": psutil.cpu_percent(),
        "memory": psutil.virtual_memory().percent,
        "gpu": round(percent_vram_usage),
    }

@app.get("/")
def read_root():
    return {"message": "Hello World"}


#get models
@app.get("/activeModel")
def read_activeModel():
    return {"activeModel" : chatModel}

@app.get("/encodingModel")
def read_activeModel():
    return {"encodingModel" : encodingModel}

#prompt base api
class PromptRequest(BaseModel):
    prompt: str

@app.post("/prompt")
def run_prompt(request: PromptRequest):
    user_prompt = request.prompt
    response = handle_prompt(user_prompt)

    return {
        "prompt": user_prompt,
        "response": response,
        "model": chatModel
    }

#return local ollama model list
@app.get("/modelList")
def get_list():
    return list_models()


#change chat model 
class SetChatModelRequest(BaseModel):
    chatModel: str

@app.post("/setChatModel")
def set_chat_model(request: SetChatModelRequest):
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

    
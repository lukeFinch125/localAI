from fastapi import FastAPI
from pydantic import BaseModel

# import your existing logic
from ModelLogic import (
    chatModel,
    encodingModel,
    handle_prompt,
    list_models,
    set_chat_model
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

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/activeModel")
def read_activeModel():
    return {"activeModel" : chatModel}

@app.get("/encodingModel")
def read_activeModel():
    return {"encodingModel" : encodingModel}

class PromptRequest(BaseModel):
    prompt: str

@app.post("/prompt")
def run_prompt(request: PromptRequest):
    user_prompt = request.prompt
    response = handle_prompt(user_prompt)

    return {
        "prompt": user_prompt,
        "response": response
    }

@app.get("/modelList")
def get_list():
    return list_models()

class SetChatModelRequest(BaseModel):
    newModel: str

@app.post("/setChatModel")
def setChatModel(request: SetChatModelRequest):
    response = set_chat_model(request.newModel)
    return {
        "response": response
    }
from fastapi import FastAPI
from pydantic import BaseModel

# import your existing logic
from ModelLogic import (
    chatModel,
    encodingModel,
    convo,
    stream_response,
    recall,
    handle_prompt,
    list_models
)

app = FastAPI()

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
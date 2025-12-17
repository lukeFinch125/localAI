from fastapi import FastAPI
from pydantic import BaseModel

# import your existing logic
from model import (
    chatModel,
    encodingModel,
    convo,
    stream_response,
    recall
)


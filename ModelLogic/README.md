Remmeber to also active virtual enviornment:
source ./.venv/bin/activate
before starting work on this project

POSTGRES

enter postgres:
sudo -iu postgres

exit postgres:
exit

enter database:
psql

exit database:
\q

start api:
uvicorn modelAPI:app --reload(no need to start ModelLogic now)

test website:
http://127.0.0.1:8000/docs



for recall mode todo list:
- fix prompt in none recall mode and tell the agent it does not recieve context
- only tell the agent it recieves context in recall mode
- fix context to always give the current conversation as context, no context if first message in conversation
- add toggle button and indicator if recall mode is on
- add button that when a response is recieved in recall mode it will show what
conversations where pulled from embeddings to generate that response
- add new conversation button

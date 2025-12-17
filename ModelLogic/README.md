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
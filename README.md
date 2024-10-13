# A Hitchhiker's Guide to X
Let Grok be your guide to the thriving universe of X! 

Built for the xAI Hackathon 10/12/2024 @ Pioneer Building SF.

## Instructions
In your shell environment, set the following environment variables:
```
export XAI_API_KEY={key}
export X_API_SECRET_KEY={key}
export X_BEARER_TOKEN={key}
export OPENAI_API_KEY={key}
```

In one terminal, install the required frontend packages:
```
cd src/frontend
rm -rf node_modules
rm package-lock.json
npm install
```
Then start the front end:
```
npm start
```
A browser window should open with the UI.

In another terminal, run the backend:
```
python -m uvicorn main:app --host 0.0.0.0 --port 5001 --reload
```

Finally enter an X username and press "Fetch Tweets", your graph will be built shortly and you can interact with it with Grok!

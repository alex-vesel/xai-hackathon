# A Hitchhiker's Guide to X
Let Grok be your guide to the thriving universe of X! 

Built for the xAI Hackathon 10/12/2024 @ Pioneer Building SF.

![Hitchhicker's Guide to X Demo](https://github.com/user-attachments/assets/fcbad57e-1ab2-4dd7-a1f1-f64a7f7a7a88)


<img width="512" alt="Screen Shot 2024-10-13 at 2 51 12 PM" src="https://github.com/user-attachments/assets/01de3917-a684-4b63-99fb-a849efaf6b10">


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

# main.py
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from orchestrator import Orchestrator

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (adjust for production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../secrets.env'))

# Global vars
orchestrator = Orchestrator()

# Helper function to format tweets as JSON
def jsonify_tweet_list(tweets):
    return [{"id": tweet.id, "text": tweet.text, "url": f"https://twitter.com/twitter/status/{tweet.id}"} for tweet in tweets]

# Endpoint: Get tweets from a specific category
@app.get('/tweets_from_category')
async def tweets_from_category(category: str):
    try:
        tweets = orchestrator.x_api.get_tweets_from_category(category)
        return jsonify_tweet_list(tweets)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint: Initialize user graph
@app.get('/init_user_graph')
async def init_user_graph(username: str):
    try:
        graph = orchestrator.init_user_graph(username)
        graph_json = graph.to_server_format()
        return JSONResponse(content=graph_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
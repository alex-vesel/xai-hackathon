# main.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from orchestrator import Orchestrator
import logging
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# Endpoint: Synthesize
@app.get('/synthesize')
async def synthesize():
    try:
        output = orchestrator.synthesize()
        return JSONResponse(content=output)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint: Add similar tweets
@app.get('/add_similar_tweets')
async def add_similar_tweets(tweet_id: str):
    try:
        tweets = orchestrator.get_similar_tweets_from_id(tweet_id)
        return jsonify_tweet_list(tweets)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint: Chat with graph
@app.get('/chat_with_graph')
async def chat_with_graph(input: str):
    try:
        output = orchestrator.chat_with_graph(input)
        return JSONResponse(content={"response": output})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.error(f"HTTP error occurred: {exc.detail}")
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(status_code=400, content={"detail": exc.errors()})

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"An error occurred: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)

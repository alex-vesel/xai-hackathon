from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from orchestrator import Orchestrator
import logging
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from cerberus import Validator  # Import Cerberus

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

# Cerberus schema for validating the input
init_user_graph_schema = {
    'username': {'type': 'string', 'minlength': 1, 'required': True}
}

add_similar_tweets_schema = {
    'tweet_id': {'type': 'string', 'minlength': 1, 'required': True}
}

# Helper function to format tweets as JSON
def

"""A simple example demonstrating chat functionality using x.ai API directly with streaming."""

import os
import json
from dotenv import load_dotenv
import requests

# Load environment variables from the correct path
load_dotenv()

def get_embedding(api_key, message):
    url = "https://api.x.ai/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    data = {
        "input": message,
        "model": "v2"
    }

    with requests.post(url, headers=headers, json=data) as response:
        response.raise_for_status()
        return response.json().get("data")[0].get("embedding").get("Float")


if __name__ == "__main__":
    # Use get() method to avoid KeyError if the key is not found
    api_key = os.getenv("XAI_API_KEY")
    if not api_key:
        print("API key not found in environment variables. Please check your .env file.")
        exit()

    print(get_embedding(api_key, "Hello world"))

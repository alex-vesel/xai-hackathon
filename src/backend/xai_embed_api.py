"""A simple example demonstrating chat functionality using x.ai API directly with streaming."""

import os
import json
import requests
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_embedding(message):
    message = message.replace("\n", " ")
    # url = "https://api.x.ai/v1/embeddings"
    # headers = {
    #     "Authorization": f"Bearer {api_key}",
    #     "Content-Type": "application/json",
    # }
    # data = {
    #     "input": message,
    #     "model": "v2",
    #     "dimensions": dimensions
    # }

    # with requests.post(url, headers=headers, json=data) as response:
    #     response.raise_for_status()
    #     return response.json().get("data")[0].get("embedding").get("Float")

    response = client.embeddings.create(input=[message], model="text-embedding-3-small")
    return response.data[0].embedding


if __name__ == "__main__":
    # Use get() method to avoid KeyError if the key is not found
    api_key = os.environ.get("XAI_API_KEY")
    if not api_key:
        print("API key not found in environment variables. Please check your .env file.")
        exit()

    print(get_embedding("Hello world"))
    

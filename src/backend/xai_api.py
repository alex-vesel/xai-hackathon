"""A simple example demonstrating chat functionality using x.ai API directly with streaming."""

import os
import json
from dotenv import load_dotenv
import requests

# Load environment variables from the correct path
load_dotenv()

class GrokInterface():
    def __init__(self):
        self.api_key = os.getenv("XAI_API_KEY")
        if not self.api_key:
            raise ValueError("API key not found in environment variables. Please check your secrets.env file.")
        self.conversation =  [{"role": "system", "content": "You are who you are."}]


    def clear_chat(self):
        self.conversation =  [{"role": "system", "content": "You are who you are."}]


    def create_chat_completion(self, input):
        self.conversation.append({"role": "user", "content": input})

        url = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        }
        data = {
            "messages": self.conversation,
            "model": "grok-2-public",
            "stream": True,
        }

        full_response = ""
        with requests.post(url, headers=headers, json=data, stream=True) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if line:
                    line = line.decode("utf-8")
                    if line.startswith("data: "):
                        line = line[6:]
                        if line.strip() == "[DONE]":
                            break
                        chunk = json.loads(line)
                        if "choices" in chunk and len(chunk["choices"]) > 0:
                            delta = chunk["choices"][0]["delta"]
                            if "content" in delta:
                                yield delta["content"]
                                full_response += delta["content"]
        self.conversation.append({"role": "system", "content": full_response})


if __name__ == "__main__":
    # Use get() method to avoid KeyError if the key is not found
    grok_interface = GrokInterface()

    print("Welcome to the x.ai Chat Quickstart with Grok-2!")
    print("Enter an empty message to quit.\n")

    while True:
        user_input = input("Human: ")
        print("")

        if not user_input:
            print("Empty input received. Exiting chat.")
            break

        print("Grok-2: ", end="", flush=True)
        full_response = ""
        for token in grok_interface.create_chat_completion(user_input):
            print(token, end="", flush=True)
            full_response += token
        print("\n")

    print("Thank you for using the x.ai Chat Quickstart with Grok-2!")

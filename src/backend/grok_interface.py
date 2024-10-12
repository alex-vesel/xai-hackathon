"""A simple example demonstrating chat functionality using x.ai API directly with streaming."""

import os
import json
import requests
from openai import OpenAI


GROK_SYSTEM_PROMPT = "You are an AI agent Grok that is a curious assistant who wants to help an X user discover new ideas using the X platform. You are fiercely curious and only want to find the newest ideas possible that no one else has come up with. You are also a super genius who can see things no one else can."


functions = {
    'get_user_summary':
        {
            "name": "get_user_summary",
            "description": "Call this function to return a user summary based on a list of tweets.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_summary": {
                        "type": "string",
                        "description": "A medium length summary of the user's interests and things that would get them excited on X",
                    },
                    "user_tags": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        },
                        "description": "A list of tags that describe the user's interests that will be used to help find X posts they are interested in. Very short, one or two words.",
                    }
                },
                "required": ["user_summary", "user_tags"],
                "optional": [],
            },
        },
}

def get_user_summary(user_summary, user_tags):
    return {
        "user_summary": user_summary,
        "user_tags": user_tags,
    }

class GrokInterface():
    def __init__(self):
        self.api_key = os.getenv("XAI_API_KEY")
        if not self.api_key:
            raise ValueError("API key not found in environment variables. Please check your secrets.env file.")
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://api.x.ai/v1",
        )
        self.model_name = "grok-2-public"
        self.conversation =  [{"role": "system", "content": GROK_SYSTEM_PROMPT}]


    def clear_chat(self):
        self.conversation =  [{"role": "system", "content": GROK_SYSTEM_PROMPT}]


    def add_user_message(self, input):
        self.conversation.append({"role": "user", "content": input})


    def add_system_message(self, input):
        self.conversation.append({"role": "system", "content": input})


    def create_chat_completion(self, input, tools=None):
        self.add_user_message(input)
        import IPython; IPython.embed(); exit(0)
        response = self.client.chat.completions.create(
            messages=self.conversation,
            model=self.model_name,
            tools=tools,
            stream=False,
        )
        response_text = response.choices[0].message.content
        self.add_system_message(response_text)
        return response_text


    def get_user_summary(self, tweets):
        input = "You are going to receive a giant list of X tweets from a user's timeline. Please call the function provided and return a user summary based on the list of tweets.\n"
        for tweet in tweets:
            input += f"Tweet: {tweet}\n\n"
        task_functions = [functions["get_user_summary"]]
        tools = [{"type": "function", "function": f} for f in task_functions]
        response = self.create_chat_completion(input, tools=tools)
        import IPython; IPython.embed(); exit(0)


    def explore(self, graph):
        # Given the entire graph of X, pick 5 ids to expand and add to the graph
        input = "You are going to receive a graph of X. Please explore the graph and pick 5 ids to expand and add to the graph.\n"
        graph_text = graph.to_grok_prompt()
        input += graph_text
        response = self.create_chat_completion(input)
        


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
        response = grok_interface.create_chat_completion(user_input)
        print(response)
        print("\n")

    print("Thank you for using the x.ai Chat Quickstart with Grok-2!")

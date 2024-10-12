"""A simple example demonstrating chat functionality using x.ai API directly with streaming."""

import os
import json
import re
import requests
from openai import OpenAI


GROK_SYSTEM_PROMPT = "You are an AI agent Grok that is a curious assistant who wants to help an X user discover new ideas using the X platform. You are fiercely curious and only want to find the newest ideas possible that no one else has come up with. You are also a super genius who can see things no one else can."

def get_user_summary(user_summary, user_tags):
    return {
        "user_summary": user_summary,
        "user_tags": user_tags,
    }

def explore(expand_ids):
    return {
        'expand_ids': expand_ids,
    }

def synthesize(user, new_ideas, source_ids):
    output =[]
    for idea, source_id in zip(new_ideas, source_ids):
        output.append({
            "idea": idea,
            "source_id": source_id,
        })
    return output


def extract_node_ids_from_text(text):
    # extract all 19 digit numbers from text
    return re.findall(r'\b\d{19}\b', text)

functions = {
    'get_user_summary': {
        "description": {
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
        "function": get_user_summary,
    },
    'explore': {
        "description": {
            "name": "explore",
            "description": "Call this function to explore the graph and pick 5 ids to expand and add to the graph.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expand_ids": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        },
                        "description": "A list of ids to expand and add to the graph.",
                    }
                },
                "required": ["expand_ids"],
                "optional": [],
            },
        },
        "function": explore,
    },
    'synthesize': {
        "description": {
            "name": "synthesize",
            "description": "Call this function to create new ideas based on the user and the graph.",
            "parameters": {
                "type": "object",
                "properties": {
                    "new_ideas": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        },
                        "description": "A list of new ideas based on the user and the graph.",
                    },
                    "source_ids": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        },
                        "description": "A list of source ids for the new ideas.",
                    }
                },
                "required": ["new_ideas", "source_ids"],
                "optional": [],
            },
        },
        "function": synthesize,
    },
}


class GrokInterface():
    def __init__(self):
        self.api_key = os.getenv("XAI_API_KEY")
        if not self.api_key:
            raise ValueError("API key not found in environment variables. Please check your secrets.env file.")
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://api.x.ai/v1",
            # base_url="https://api.openai.com/v1"
        )
        # self.model_name = "grok-2-public"
        self.model_name = "grok-preview"
        # self.model_name = "gpt-3.5-turbo"
        self.conversation =  [{"role": "system", "content": GROK_SYSTEM_PROMPT}]


    def clear_chat(self):
        self.conversation =  [{"role": "system", "content": GROK_SYSTEM_PROMPT}]


    def add_user_message(self, input):
        self.conversation.append({"role": "user", "content": input})

    def del_last_user_message(self):
        if self.conversation and self.conversation[-1]["role"] == "user":
            self.conversation.pop()


    def add_system_message(self, input):
        self.conversation.append({"role": "system", "content": input})


    def create_chat_completion(self, input, tools=None):
        self.add_user_message(input)

        response = self.client.chat.completions.create(
            messages=self.conversation,
            model=self.model_name,
            tools=tools,
            stream=False,
        )
        output = {'text': response.choices[0].message.content, 'tools': []}
        used_functions = []
        if response.choices[0].message.tool_calls is not None:
            for tool_call in response.choices[0].message.tool_calls:
                arguments = json.loads(tool_call.function.arguments)
                function_name = tool_call.function.name
                function_output = functions[function_name]["function"](**arguments)
                output['tools'].append({
                    'function': function_name,
                    'output': function_output,
                })
                used_functions.append(function_name)
        ## HACK because API often doesn't use this tool
        if "function': {'name': 'explore'" in str(tools) and "explore" not in used_functions:
            output['tools'].append({
                'function': "explore",
                'output': {"expand_ids": extract_node_ids_from_text(output['text'])},
            })
        self.add_system_message(output['text'])
        return output


    def get_user_summary(self, tweets):
        input = "You are going to receive a giant list of X tweets from a user's timeline. Please call the function provided and return a user summary based on the list of tweets.\n"
        for tweet in tweets:
            input += f"Tweet: {tweet}\n\n"
        task_functions = [functions["get_user_summary"]]
        tools = [{"type": "function", "function": f['description']} for f in task_functions]
        response = self.create_chat_completion(input, tools=tools)
        for tool in response['tools']:
            if tool['function'] == "get_user_summary":
                return tool['output']
        return None


    def explore(self, user, graph):
        # Given the entire graph of X, pick 5 ids to expand and add to the graph
        input = "You are going to receive a graph of X. Please explore the graph and pick 5 ids to expand and add to the graph. You must call the provided function.\n"
        input += str(user)
        input += graph.to_grok_prompt()
        task_functions = [functions["explore"]]
        tools = [{"type": "function", "function": f['description']} for f in task_functions]
        response = self.create_chat_completion(input, tools=tools)
        for tool in response['tools']:
            if tool['function'] == "explore":
                return tool['output']
        return None
    

    def synthesize(self, user, graph):
        input = "Now it is time to do your task of creating new ideas based on the user and the graph. Please call the provided function.\n"
        input += str(user)
        input += graph.to_grok_prompt()
        task_functions = [functions["synthesize"]]
        tools = [{"type": "function", "function": f['description']} for f in task_functions]
        response = self.create_chat_completion(input, tools=tools)
        import IPython; IPython.embed(); exit(0)
        for tool in response['tools']:
            if tool['function'] == "synthesize":
                return tool['output']
        return None
        


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

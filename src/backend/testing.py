import os
from graph import Graph
from grok_interface import GrokInterface
from orchestrator import Orchestrator

if __name__ == "__main__":
    myGraph = Graph()
    api_key = os.environ.get("XAI_API_KEY")
    o = Orchestrator()
    o.init_user_graph("elonmusk")
    

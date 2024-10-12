from graph import Graph
from grok_interface import GrokInterface
from x_api import XAPI


class Orchestrator():
    def __init__(self):
        self.graph = Graph()
        self.grok = GrokInterface()
        self.x_api = XAPI()

    def clear(self):
        self.graph = Graph()
        self.grok.clear_chat()

    def build_user_description(self, username):
        recent_tweets = self.x_api.get_user_timeline(username, max_results=100)
        user_summary = self.grok.get_user_summary(recent_tweets)
        
if __name__ == "__main__":
    orchestrator = Orchestrator()
    orchestrator.build_user_description("elonmusk")

    def explore(self):
        # allow grok to explore the graph
        self.grok.explore(self.graph)


if __name__ == "__main__":
    orchestrator = Orchestrator()
    orchestrator.build_user_description("elonmusk")
    orchestrator.explore()

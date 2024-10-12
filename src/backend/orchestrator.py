from graph import Graph
from grok_interface import GrokInterface
from x_api import XAPI

class User:
    def __init__(self, username=None, description=None, tags=None):
        self.username = username
        self.description = description
        self.tags = tags

class Orchestrator():
    def __init__(self):
        self.graph = Graph()
        self.grok = GrokInterface()
        self.x_api = XAPI()
        self.user = None

    def clear(self):
        self.graph = Graph()
        self.grok.clear_chat()
        self.user = None

    def init_user(self):
        # get user tweets
        tweets = self.x_api.get_user_timeline("elonmusk", max_results=100)
        self.graph.init_from_tweets(tweets)

    def build_user_description(self, username):
        recent_tweets = self.x_api.get_user_timeline(username, max_results=100)
        output = self.grok.get_user_summary(recent_tweets)
        self.user = User(username, output['user_summary'], output['user_tags'])

    def init_user_graph(self, username):
        if self.user is None:
            self.build_user_description(username)
        init_tweets = []
        for tag in self.user.tags:
            init_tweets += self.x_api.get_tweets_from_category(tag, max_results=10)
        self.graph.init_from_tweets(init_tweets)
        return self.graph

    def explore(self):
        # allow grok to explore the graph
        self.grok.explore(self.graph)


if __name__ == "__main__":
    orchestrator = Orchestrator()
    orchestrator.init_user_graph("elonmusk")

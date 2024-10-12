from graph import Graph
from grok_interface import GrokInterface
from x_api import XAPI

class User:
    def __init__(self, username=None, description=None, tags=None):
        self.username = username
        self.description = description
        self.tags = tags

    def __str__(self):
        return f"\nUser: {self.username} description: {self.description} {self.tags}\n"
    
    def __repr__(self):
        return f"\nUser: {self.username} description:  {self.description} {self.tags}\n"

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
        self.grok.clear_chat()
        if self.user is None:
            self.build_user_description(username)
        init_tweets = []
        print("user tags", self.user.tags)
        for tag in self.user.tags:
            init_tweets += self.x_api.get_tweets_from_category(tag, max_results=10)
        self.graph.init_from_tweets(init_tweets)
        return self.graph

    def explore(self):
        # allow grok to explore the graph
        self.grok.clear_chat()
        output = self.grok.explore(self.user, self.graph)
        expand_ids = output['expand_ids']

        for id in expand_ids:
            new_tweets = self.get_similar_tweets_from_id(id)

    def synthesize(self):
        self.grok.clear_chat()
        output = self.grok.synthesize(self.user, self.graph)


    def get_similar_tweets_from_id(self, tweet_id):
        pass

    def explore(self):
        # allow grok to explore the graph
        self.grok.explore(self.graph)


if __name__ == "__main__":
    orchestrator = Orchestrator()
    orchestrator.init_user_graph("elonmusk")
    orchestrator.synthesize()

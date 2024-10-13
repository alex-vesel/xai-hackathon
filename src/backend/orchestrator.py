from graph import Graph
from grok_interface import GrokInterface
from x_api import XAPI
import copy

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
        self.tweets = []
        self.grok = GrokInterface()
        self.similar_tweets_grok = GrokInterface()
        self.x_api = XAPI()
        self.user = None
        self.saved_chat = copy.deepcopy(self.grok.conversation)

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

    def init_user_graph(self, username, node_limit=30):
        self.saved_chat = []
        self.grok.clear_chat()
        if self.user is None:
            self.build_user_description(username)
        init_tweets = []
        print("user tags", self.user.tags)
        for tag in self.user.tags:
            init_tweets += self.x_api.get_tweets_from_category(tag, max_results=10)
        self.tweets = init_tweets
        self.graph.init_from_tweets(init_tweets, node_limit)
        return self.graph

    def get_self_tweets(self):
        return self.tweets

    def explore(self):
        # allow grok to explore the graph
        self.grok.clear_chat()
        output = self.grok.explore(self.user, self.graph)
        expand_ids = output['expand_ids']

        for id in expand_ids:
            new_tweets = self.get_similar_tweets_from_id(id, max_results=5)
            self.graph.add_tweets(new_tweets)

    def synthesize(self):
        self.grok.clear_chat()
        output = self.grok.synthesize(self.user, self.graph)
        self.saved_chat.append(self.grok.format_user_message("Please synthesize some new ideas for me!"))
        output_str = ""
        for idea in output:
            output_str += idea['idea'] + "\n\n"
        self.saved_chat.append(self.grok.format_system_message(output_str))
        return output
    
    def chat_with_graph(self, input):
        self.grok.clear_chat()
        self.grok.conversation = copy.deepcopy(self.saved_chat)
        output = self.grok.chat_with_graph(input, self.user, self.graph)
        self.saved_chat.append(self.grok.format_user_message(input))
        self.saved_chat.append(self.grok.format_system_message(output))
        print(output)
        print("\n\n")
        return output

    def get_similar_tweets_from_id(self, tweet_id, max_results=10):
        """
        Get tweets similar to a specific tweet.
        """
        # Reset the similar_tweets_grok chat history
        self.similar_tweets_grok.clear_chat()
        self.similar_tweets_grok.add_system_message("""
            Your job is to make a short-length, specific search prompt that will be inputted into Twitter/X's search bar. 
            Do not use special markers such as '-inurl' 'site:' or 'high-resolution' or special characters; simply make it a natural language query. 
            Do not begin the prompt with Here's a search prompt... Just answer with the text of the search prompt. 
            The prompt needs to be for similar posts to this post:""")

        # Get the original tweet
        original_tweet = self.x_api.get_tweet(tweet_id)
        if not original_tweet.data:
            return []  # Return empty list if tweet not found
        
        # Extract the text from the original tweet
        original_text = original_tweet.data.text
        print("Og text:", original_text)
        
        # ask grok for keyword search
        count_iters = 0
        tweets = None
        while count_iters < 10 and tweets is None:
            self.similar_tweets_grok.add_system_message("The previous query failed. Make the search prompt shorter and simpler. The new search prompt must be shorter than the previous query. Delete keywords as necessary.")
            response = self.similar_tweets_grok.create_chat_completion(original_text)['text']
            self.similar_tweets_grok.del_last_user_message()
            print("Query:", response)
            
            # Remove keywords like 'and', 'in', 'or' from the response
            keywords_to_remove = ['and', 'in', 'or']
            cleaned_response = ' '.join([word for word in response.split() if word.lower() not in keywords_to_remove])
            
            try:
                tweets = self.x_api.get_tweets_from_query(cleaned_response, max_results=max_results)
                if tweets is not None:
                    break
            except Exception as e:
                print(f"Error: {e}")
                tweets = None
            count_iters += 1

        if tweets is None:
            return []

        tweets_data = [tweet for tweet in tweets if tweet.id != tweet_id]
        return tweets_data[:10]

if __name__ == "__main__":
    orchestrator = Orchestrator()
    orchestrator.init_user_graph("elonmusk")
    # orchestrator.synthesize()
    print(orchestrator.get_similar_tweets_from_id("1845200940468416998"))
    # orchestrator.chat_with_graph("Tell me the most exciting things happening on X right now!")
    # orchestrator.chat_with_graph("What were we just talking about? Summarize in one word.")
    # orchestrator.synthesize()
    # print(orchestrator.get_similar_tweets_from_id("1845200940468416998"))

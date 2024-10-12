# File: XAPI.py

import os
import tweepy
from grok_interface import GrokInterface


class XAPI:
    def __init__(self, api_key=None, api_secret_key=None):
        self.similar_tweets_grok = GrokInterface()

        self.bearer_token = os.environ.get('X_BEARER_TOKEN')
        self.api_key = api_key or os.environ.get('X_API_KEY')
        self.api_secret_key = api_secret_key or os.environ.get('X_API_SECRET_KEY')

        if self.bearer_token:
            self.client = tweepy.Client(bearer_token=self.bearer_token)
            self.auth = tweepy.OAuth2BearerHandler(self.bearer_token)
        elif self.api_key and self.api_secret_key:
            self.client = tweepy.Client(consumer_key=self.api_key, consumer_secret=self.api_secret_key)
            self.auth = tweepy.OAuthHandler(self.api_key, self.api_secret_key)
        else:
            raise ValueError("Either X_BEARER_TOKEN or both X_API_KEY and X_API_SECRET_KEY must be set")

        self.api = tweepy.API(self.auth)

    def get_tweets_from_category(self, category, max_results=10):
        """
        Get tweets from a specific category (hashtag).
        """
        query = f"#{category} -is:retweet"
        tweets = self.client.search_recent_tweets(query=query, max_results=max_results)
        return tweets.data

    def start_stream(self, track_list):
        """
        Start a stream to track tweets containing specified keywords.
        """
        class MyStreamListener(tweepy.StreamingClient):
            def on_tweet(self, tweet):
                print(f"New tweet: {tweet.text}")

            def on_error(self, status):
                print(f"Error: {status}")
                if status == 420:
                    return False

        if self.bearer_token:
            stream = MyStreamListener(self.bearer_token)
        else:
            stream = tweepy.Stream(auth=self.auth, listener=MyStreamListener())
        
        for term in track_list:
            if isinstance(stream, tweepy.StreamingClient):
                stream.add_rules(tweepy.StreamRule(term))
            else:
                stream.filter(track=[term])

    def get_user_timeline(self, username, max_results=10):
        """
        Get recent tweets from a user's timeline.
        """
        user = self.client.get_user(username=username)
        if user.data:
            tweets = self.client.get_users_tweets(user.data.id, max_results=max_results)
            return tweets.data
        return []

    def get_replies(self, tweet_id, max_results=100):
        """
        Get replies to a specific tweet.
        """
        query = f"conversation_id:{tweet_id} is:reply"
        tweets = self.client.search_recent_tweets(query=query, max_results=max_results)
        return tweets.data
    
    def get_similar_tweets(self, tweet_id, max_results=100):
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
        original_tweet = self.client.get_tweet(tweet_id)
        if not original_tweet.data:
            return []  # Return empty list if tweet not found
        
        # Extract the text from the original tweet
        original_text = original_tweet.data.text
        print("Og text:", original_text)
        
        # ask grok for keyword search
        count_iters = 0
        tweets = "blank"
        while count_iters < 10 and tweets != None:
            self.similar_tweets_grok.add_system_message("The previous query failed. Make the search prompt shorter and simpler. The new search prompt must be shorter than the previous query. Delete keywords as necessary.")
            response = self.similar_tweets_grok.create_chat_completion(original_text, add_system_message=True)
            self.similar_tweets_grok.del_last_user_message()
            print("Query:", response)
            
            # Remove keywords like 'and', 'in', 'or' from the response
            keywords_to_remove = ['and', 'in', 'or']
            cleaned_response = ' '.join([word for word in response.split() if word.lower() not in keywords_to_remove])
            
            try:
                tweets = self.client.search_recent_tweets(query=cleaned_response, max_results=max_results)
                if tweets.data != None:
                    break
            except tweepy.errors.TweepyException as e:
                print(f"Tweepy Error: {e}")
            count_iters += 1

        tweets_data = [tweet for tweet in tweets.data if tweet["id"] != tweet_id]
        return tweets_data[:10]


# Example usage:
if __name__ == "__main__":
    try:
        xapi = XAPI()
        
        # Get tweets from a category
        cat_tweets = xapi.get_tweets_from_category("python", max_results=10)
        print("Tweets about Python:", cat_tweets)
        
        # Start a stream (uncomment to use)
        xapi.start_stream(["python", "programming"])
        
        # Get user timeline
        user_tweets = xapi.get_user_timeline("x", max_results=5)
        print("Recent tweets from Twitter:", user_tweets)
        
        # Get replies to a specific tweet
        tweet_id = "1234567890"  # Replace with an actual tweet ID
        replies = xapi.get_replies(tweet_id, max_results=50)
        print(f"Replies to tweet {tweet_id}:", replies)

        # Get tweets similar to a specific tweet
        tweet_id = "1845200940468416998" 
        similar = xapi.get_similar_tweets(tweet_id, max_results=50)
        print(f"\n\nSimilar tweets to tweet {tweet_id}:", similar)
        
    except ValueError as e:
        print(f"Error: {e}")
    except tweepy.errors.TweepyException as e:
        print(f"Tweepy Error: {e}")

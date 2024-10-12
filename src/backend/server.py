from flask import Flask, request
from flask_cors import CORS  # Import CORS
import requests
from flask import jsonify
import json
from dotenv import load_dotenv
import openai
import os
from x_api import XAPI
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

dir = os.path.dirname(__file__)
load_dotenv(dotenv_path=os.path.join(dir, '../secrets.env'))

tweet_id_to_url = lambda tweet_id: f"https://twitter.com/twitter/status/{tweet_id}"

# Global vars
x_api = XAPI()

def jsonify_tweet_list(tweets):
    if not tweets:
        tweets = []
    print(f"{tweets}")
    return jsonify([{"id": tweet.id, "text": tweet.text, "url": tweet_id_to_url(tweet.id)} for tweet in tweets])


@app.route('/tweets_from_category')
def tweets_from_category():
    tweets = x_api.get_tweets_from_category(request.args.get('category'))
    return jsonify_tweet_list(tweets)




if __name__ == '__main__':
    app.run(port=5000)
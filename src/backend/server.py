from flask import Flask, request
from flask_cors import CORS
import requests
from flask import jsonify
import json
from dotenv import load_dotenv
import openai
import os
from orchestrator import Orchestrator
app = Flask(__name__)
# pip install python-dotenv

CORS(app) 
dir = os.path.dirname(__file__)
load_dotenv(dotenv_path=os.path.join(dir, '../secrets.env'))

tweet_id_to_url = lambda tweet_id: f"https://twitter.com/twitter/status/{tweet_id}"

# Global vars
orchestrator = Orchestrator()

def jsonify_tweet_list(tweets):
    return jsonify([{"id": tweet.id, "text": tweet.text, "url": tweet_id_to_url(tweet.id)} for tweet in tweets])


@app.route('/tweets_from_category')
def tweets_from_category():
    tweets = orchestrator.x_api.get_tweets_from_category(request.args.get('category'))
    return jsonify_tweet_list(tweets)


@app.route('/init_user_graph')
def init_user_graph():
    graph = orchestrator.init_user_graph(request.args.get('username'))
    graph_json = graph.to_server_format()
    return jsonify(graph_json)


@app.route('/synthesize')
def synthesize():
    output = orchestrator.synthesize()
    return jsonify(output)


@app.route('/add_similar_tweets')
def add_similar_tweets():
    new_tweets = orchestrator.get_similar_tweets_from_id(request.args.get('tweet_id'))
    old_tweets = orchestrator.get_self_tweets()
    tweets = old_tweets + new_tweets
    return jsonify_tweet_list(tweets)

@app.route('/chat_with_graph')
def chat_with_graph():
    output = orchestrator.chat_with_graph(request.args.get('input'))
    output = {"response": output}
    return jsonify(output)




if __name__ == '__main__':
    app.run()

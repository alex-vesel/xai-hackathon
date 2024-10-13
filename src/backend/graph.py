import xai_embed_api
import os
import numpy as np

tweet_id_to_url = lambda tweet_id: f"https://twitter.com/twitter/status/{tweet_id}"

DEBUG = False

class Node():
    def __init__(self, id, text, url):
        self.id = id
        self.text = text
        self.url = url

    def __str__(self):
        return f"Node: {self.id} {self.text}"
    
    def __repr__(self):
        return f"Node: {self.id} {self.text}"

class Graph():
    def __init__(self):
        self.nodes = []
        self.links = []

    def add_link_manual(self, a, b, weight=0.5):
        self.links.append({
            'source': a,
            'target': b,
            'weight': weight
        })

    def add_node(self, node):
        # get node html first
        self.nodes.append(node)
    
    def generate_links(self, similarity_threshold = 0.75):
        api_key = os.environ.get("XAI_API_KEY")
        embeds = []
        for node in self.nodes:
            embeds.append(np.array(xai_embed_api.get_embedding(api_key, node.text)))

        for i in range(len(self.nodes)):
            for j in range(i+1, len(self.nodes)):
                print(i, j)
                # Generate embeddings for the two nodes
                if DEBUG:
                    embedding_i = np.random.rand(512)
                    embedding_j = np.random.rand(512)
                else:
                    embedding_i = embeds[i]
                    embedding_j = embeds[j]
                
                # Calculate similarity between embeddings
                similarity = np.dot(embedding_i, embedding_j) / (np.linalg.norm(embedding_i) * np.linalg.norm(embedding_j))
                
                # If similarity is above a threshold, create a link
                if similarity > similarity_threshold:  # Adjust threshold as needed
                    self.links.append({
                        'source': self.nodes[i].id,
                        'target': self.nodes[j].id,
                        'weight': similarity
                    })

    def init_from_tweets(self, tweets):
        for tweet in tweets:
            n = Node(tweet.id, tweet.text, tweet_id_to_url(tweet.id))
            self.add_node(n)
        
        self.generate_links()


    def add_tweets(self, tweets):
        for tweet in tweets:
            n = Node(tweet.id, tweet.text, tweet_id_to_url(tweet.id))
            self.add_node(n)
        
        self.generate_links()


    def to_grok_prompt(self):
        prompt = "\n Here is the X graph for the user.\n\n"
        for node in self.nodes:
            prompt += f"<Node>: <id>{node.id}> <text>{node.text}\n\n"
        return prompt
    

    def to_server_format(self):
        nodes = []
        for node in self.nodes:
            nodes.append({
                'id': node.id,
                'text': node.text,
                'url': node.url
            })
        return {
            'nodes': nodes,
            'links': self.links
        }

if __name__ == "__main__":
    myGraph = Graph()
    api_key = os.getenv("XAI_API_KEY")
    node1 = Node(id="1844811140943183900", text="I absolutely hate the color blue.", url="https://twitter.com/twitter/status/1844811140943183900")
    node2 = Node(id="1844811140943183901", text="Blue is a terrible color.", url="https://twitter.com/twitter/status/1844811140943183901")
    node3 = Node(id="1844811140943183902", text="I love blue color.", url="https://twitter.com/twitter/status/1844811140943183902")
    myGraph.add_node(node1)
    myGraph.add_node(node2)
    myGraph.add_node(node3)
    myGraph.generate_links()
    # print(myGraph.to_grok_prompt())

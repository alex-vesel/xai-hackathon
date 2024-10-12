import xai_embed_api
import os
import numpy as np

tweet_id_to_url = lambda tweet_id: f"https://twitter.com/twitter/status/{tweet_id}"

class Node():
    def __init__(self, id, text, url):
        self.id = id
        self.text = text
        self.url = url

class Graph():
    def __init__(self):
        self.nodes = []
        self.links = []

    def add_node(self, nodes):
        for node in nodes:
            self.nodes.append(node)

    def add_link_manual(self, a, b, weight=0.5):
        self.links.append({
            'a': a,
            'b': b,
            'weight': weight
        })
    
    def generate_links(self, similarity_threshold = 0.5):
        api_key = os.environ.get("XAI_API_KEY")
        for i in range(len(self.nodes)):
            for j in range(i+1, len(self.nodes)):
                # Generate embeddings for the two nodes
                embedding_i = xai_embed_api.get_embedding(api_key, self.nodes[i].text)
                embedding_j = xai_embed_api.get_embedding(api_key, self.nodes[j].text)
                
                # Calculate similarity between embeddings
                similarity = np.dot(embedding_i, embedding_j) / (np.linalg.norm(embedding_i) * np.linalg.norm(embedding_j))
                
                # If similarity is above a threshold, create a link
                if similarity > similarity_threshold:  # Adjust threshold as needed
                    self.links.append({
                        'a': self.nodes[i].id,
                        'b': self.nodes[j].id,
                        'weight': similarity
                    })

<<<<<<< Updated upstream
    def init_from_tweets(self, tweets):
        for tweet in tweets:
            n = Node(tweet.id, tweet.text, tweet_id_to_url(tweet.id))
            self.add_node(n)
        
        self.generate_links()
=======
    def to_grok_prompt(self):
        prompt = "\n Here is the X graph for the user.\n\n"
        for node in self.nodes:
            prompt += f"<Node>: <id>{node.id}> <text>{node.text}\n\n"
        return prompt
>>>>>>> Stashed changes

if __name__ == "__main__":
    myGraph = Graph()
    api_key = os.getenv("XAI_API_KEY")
    node1 = Node("1844811140943183900", "I absolutely hate the color blue.", "https://twitter.com/twitter/status/1844811140943183900")
    node2 = Node("1844811140943183901", "Blue is a terrible color.", "https://twitter.com/twitter/status/1844811140943183901")
    node3 = Node("1844811140943183902", "I love blue color.", "https://twitter.com/twitter/status/1844811140943183902")
    myGraph.add_node([node1, node2, node3])
    myGraph.generate_links(api_key)
    print(myGraph.to_grok_prompt())

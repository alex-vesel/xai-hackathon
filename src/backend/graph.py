import xai_embed_api
import os
import numpy as np
from dotenv import load_dotenv

load_dotenv()

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
    
    def generate_links(self, api_key):
        for i in range(len(self.nodes)):
            for j in range(i+1, len(self.nodes)):
                # Generate embeddings for the two nodes
                embedding_i = xai_embed_api.get_embedding(api_key, self.nodes[i].text)
                embedding_j = xai_embed_api.get_embedding(api_key, self.nodes[j].text)
                
                # Calculate similarity between embeddings
                similarity = np.dot(embedding_i, embedding_j) / (np.linalg.norm(embedding_i) * np.linalg.norm(embedding_j))
                
                # If similarity is above a threshold, create a link
                if similarity > 0.5:  # Adjust threshold as needed
                    self.links.append({
                        'source': self.nodes[i].id,
                        'target': self.nodes[j].id,
                        'weight': similarity
                    })

if __name__ == "__main__":
    myGraph = Graph()
    api_key = os.getenv("XAI_API_KEY")
    node1 = Node("1844811140943183900", "I absolutely hate the color blue.", "https://twitter.com/twitter/status/1844811140943183900")
    node2 = Node("1844811140943183901", "Blue is a terrible color.", "https://twitter.com/twitter/status/1844811140943183901")
    node3 = Node("1844811140943183902", "I love blue color.", "https://twitter.com/twitter/status/1844811140943183902")
    myGraph.add_node([node1, node2, node3])
    myGraph.generate_links(api_key)
    print(myGraph.links)

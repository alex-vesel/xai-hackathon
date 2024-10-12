import requests


BASE_URL = "http://127.0.0.1:5000"

def get_tweets_from_category(category):
    response = requests.get(f"{BASE_URL}/tweets_from_category?category={category}")
    return response.json()


def init_user_graph(username):
    response = requests.get(f"{BASE_URL}/init_user_graph?username={username}")
    return response.text

if __name__ == "__main__":
    print(init_user_graph("elonmusk"))
    # print(get_tweets_from_category('machinelearning'))
import requests


BASE_URL = "http://127.0.0.1:5000"

def get_tweets_from_category(category):
    response = requests.get(f"{BASE_URL}/tweets_from_category?category={category}")
    return response.json()

if __name__ == "__main__":
    print(get_tweets_from_category('machinelearning'))
import axios from 'axios';

const apiKey = "your_generated_api_token_here"

export const addSimilarNodes = async (tweetId) => {
  try {
    console.log(apiKey);  
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const response = await axios.get(`http://127.0.0.1:5000/add_similar_nodes?tweet_id=${tweetId}`, {
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding similar nodes:', error);
    throw error;
  }
};

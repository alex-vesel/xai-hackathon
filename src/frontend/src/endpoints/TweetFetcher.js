import axios from 'axios';

const apiKey = "your_generated_api_token_here"

export const fetchTweetsFromCategory = async (category) => {
  try {
    console.log(apiKey);  
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(`http://127.0.0.1:5000/tweets_from_category?category=${category}`, {
      headers : headers ,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error;
  }
};
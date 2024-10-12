import axios from 'axios';

export const fetchTweetsFromCategory = async (category) => {
  try {
    const response = await axios.get('http://localhost:5000/tweets_from_category', {
      params: { category }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error;
  }
};
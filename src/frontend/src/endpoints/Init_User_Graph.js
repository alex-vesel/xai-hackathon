import axios from 'axios';

const apiKey = "your_generated_api_token_here"

export const initUserGraph = async (username) => {
  try {
    console.log(apiKey);  
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(`http://127.0.0.1:5000/init_user_graph?username=${username}`, {
      headers : headers ,
    });
    return response.data;
  } catch (error) {
    console.error('Error initializing user graph:', error);
    throw error;
  }
};

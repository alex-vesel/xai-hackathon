import React, { useState } from 'react';
import axios from 'axios';

function TweetInput({ setTweetId }) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = async () => {
    const match = inputValue.match(/status\/(\d+)/);
    if (match) {
      setTweetId(match[1]);
    } else {
      setTweetId('');
    }
    try {
      const headers = {
        Authorization: `Bearer your_generated_api_token_here`,
        'Content-Type': 'application/json',
      };
      console.log("GETTING DATA");
      const response = await axios.get(`http://0.0.0.0:5001/tweets_from_category?category=${inputValue}`, {
        params: headers,
      });
      const graph = response.data;
      console.log(graph);
    } catch (error) {
      console.error('Error initializing user graph:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Twitter URL"
        value={inputValue}
        onChange={handleInputChange}
        style={{
          padding: '5px',
          borderRadius: '5px',
        }}
      />
      <button onClick={handleButtonClick}>Fetch Tweets</button>
    </div>
  );
}

export default TweetInput;
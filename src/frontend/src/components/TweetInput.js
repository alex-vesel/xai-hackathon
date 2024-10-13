import React, { useState } from 'react';
import axios from 'axios';
import './TweetInput.css'; // Create a CSS file for styling

function TweetInput({ setTweetId, setGraphData }) {
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
      const response = await axios.get(`http://0.0.0.0:5001/init_user_graph?username=${inputValue}`, {
        params: headers,
      });
      const graph = response.data;
      console.log(graph);
      setGraphData(graph);
    } catch (error) {
      console.error('Error initializing user graph:', error);
    }
  };

  return (
    <div className="tweet-input">
      <input
        type="text"
        placeholder="Enter X username"
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
import React, { useState } from 'react';
import { fetchTweetsFromCategory } from '../endpoints/TweetFetcher'; // Import from TweetFetcher.js

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
      const tweets = await fetchTweetsFromCategory(inputValue); // Replace 'someCategory' with actual category
      console.log(tweets);
    } catch (error) {
      console.error('Error fetching tweets:', error);
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
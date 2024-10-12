import './App.css';
import ForceGraph from './forcegraph';
import './index.css';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import ChatSidebar from './components/ChatSidebar';
import { useState } from 'react';
import TweetInput from './components/TweetInput'; // Import the new component

function App() {
  const [tweetId, setTweetId] = useState('');

  return (
    <div className="App">
      <TweetInput setTweetId={setTweetId} /> {/* Use the new component */}
      <h1 style={{ color: 'white' }}>A Hitchhiker's Guide to X</h1>
      <div style={{ display: 'flex'}}>
        <div style={{ flex: 3 , border: '2px solid white', padding: '10px'}}>
          <ForceGraph width={800} height={620} />
        </div>
        <div style={{ flex: 1 }}>
          <ChatSidebar />
        </div>
      </div>
      {/* <TwitterTweetEmbed tweetId="1845200940468416998" options={{ theme: 'dark' }} /> */}
    </div>
  );
}

export default App;
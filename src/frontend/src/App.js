import './App.css';
import ForceGraph from './forcegraph';
import './index.css';
import { useEffect } from 'react';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import ChatSidebar from './components/ChatSidebar';
import { useState } from 'react';
import TweetInput from './components/TweetInput'; // Import the new component

function App() {
  const [tweetId, setTweetId] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  // useEffect(() => {
  //   // Save graph data to localStorage whenever it changes
  //   localStorage.setItem('graphData', JSON.stringify(graphData));
  // }, [graphData]);

  return (
    <div className="App">
      <h1 style={{ color: 'white' }}>A Hitchhiker's Guide to 𝕏</h1>
      <TweetInput setTweetId={setTweetId} setGraphData={setGraphData} /> {/* Use the new component */}
      <div style={{ display: 'flex'}}>
        <div style={{ flex: 3 , border: '2px solid white', padding: '10px'}}>
          <ForceGraph width={800} height={620} graphData={graphData} />
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
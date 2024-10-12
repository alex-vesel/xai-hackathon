import './App.css';
import ForceGraph from './forcegraph';
import './index.css';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import ChatSidebar from './components/ChatSidebar';
// import TweetEmbed from './components/tweetembed';

// Axios Endpoint for machine learning
function App() {
  return (
    <div className="App">
      <h1>Simple D3 Force-Directed Graph</h1>
      <ForceGraph width={600} height={400} />
      {/* <TwitterTweetEmbed tweetId="1845200940468416998" options={{ theme: 'dark' }} /> */}
      <ChatSidebar />
      {/* <TweetEmbed tweetId="1845200940468416998" width={500} height={2} /> */}
    </div>

  );
}

export default App;

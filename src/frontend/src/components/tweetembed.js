import React, { useEffect, useRef } from 'react';

const TweetEmbed = ({ tweetId, width, height }) => {
  const tweetRef = useRef();

  useEffect(() => {
    if (window.twttr) {
      window.twttr.widgets.load(tweetRef.current);
    } else {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [tweetId]);

  return (
    <div className="tweet-container" ref={tweetRef} style={{ width: width, height: height }}>
      <blockquote className="twitter-tweet" data-theme="dark">
        <a href={`https://twitter.com/user/status/${tweetId}`}> </a>
      </blockquote>
    </div>
  );
};

export default TweetEmbed;
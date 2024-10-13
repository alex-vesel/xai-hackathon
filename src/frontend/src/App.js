import React from 'react';
import './App.css';
import ForceGraph from './forcegraph';
import './index.css';
import imagePath from './Screenshot 2024-10-12 193026.png'; // Import the image
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

  useEffect(() => {
    const particleCount = 100; // Number of particles
    const particles = Array.from({ length: particleCount }).map(() => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      document.body.appendChild(particle);
      return particle;
    });

    const animateParticles = () => {
      particles.forEach(particle => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const vx = (Math.random() - 0.5) * 2; // Random speed in x direction
        const vy = (Math.random() - 0.5) * 2; // Random speed in y direction

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const moveParticle = () => {
          const newX = parseFloat(particle.style.left) + vx;
          const newY = parseFloat(particle.style.top) + vy;

          // Bounce off the walls
          if (newX < 0 || newX > window.innerWidth) {
            particle.style.left = `${Math.random() * window.innerWidth}px`;
          } else {
            particle.style.left = `${newX}px`;
          }

          if (newY < 0 || newY > window.innerHeight) {
            particle.style.top = `${Math.random() * window.innerHeight}px`;
          } else {
            particle.style.top = `${newY}px`;
          }

          requestAnimationFrame(moveParticle);
        };

        moveParticle();
      });
    };

    animateParticles();

    return () => {
      particles.forEach(particle => {
        document.body.removeChild(particle);
      });
    };
  }, []);

  return (
    <div className="App" style={{ backgroundImage: `url(${imagePath})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'top left' }}>
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

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Set up axios to support CORS

const createParticles = (count) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * window.innerWidth}px`;
    particle.style.top = `${Math.random() * window.innerHeight}px`;
    particle.style.opacity = Math.random(); // Random opacity
    document.body.appendChild(particle);
    
    // Assign random speed and direction
    const speed = Math.random() * 2 + 1; // Speed between 1 and 3
    const angle = Math.random() * Math.PI * 2; // Random angle
    const vx = speed * Math.cos(angle);
    const vy = speed * Math.sin(angle);
    
    particles.push({ element: particle, vx, vy });
  }
  return particles;
};

const animateParticles = (particles) => {
  particles.forEach((particle, index) => {
    const { element, vx, vy } = particle;
    const moveParticle = () => {
      const x = parseFloat(element.style.left);
      const y = parseFloat(element.style.top);
      
      // Update position with curved motion
      const newX = x + vx;
      const newY = y + vy + Math.sin(Date.now() / 100 + Math.random() * 10) * 0.5; // Curved motion

      // Bounce off the walls
      if (newX < 0 || newX > window.innerWidth) {
        particle.vx = -vx; // Reverse direction
      }
      if (newY < 0 || newY > window.innerHeight) {
        particle.vy = -vy; // Reverse direction
      }

      // Update position
      element.style.left = `${Math.min(Math.max(newX, 0), window.innerWidth)}px`;
      element.style.top = `${Math.min(Math.max(newY, 0), window.innerHeight)}px`;

      // Check for collisions with other particles
      particles.forEach((otherParticle, otherIndex) => {
        if (otherIndex !== index) {
          const otherX = parseFloat(otherParticle.element.style.left);
          const otherY = parseFloat(otherParticle.element.style.top);
          const distance = Math.sqrt((newX - otherX) ** 2 + (newY - otherY) ** 2);

          // Check for collision (assuming particles are circles with a radius of 2)
          if (distance < 8) { // 4 + 4 (diameter of two particles)
            particle.vx = -vx; // Reverse direction
            particle.vy = -vy; // Reverse direction
            otherParticle.vx = -otherParticle.vx; // Reverse other particle's direction
            otherParticle.vy = -otherParticle.vy; // Reverse other particle's direction
          }
        }
      });

      requestAnimationFrame(moveParticle);
    };

    moveParticle();
  });
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Create and animate particles
const particles = createParticles(100); // Create 100 particles
animateParticles(particles);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

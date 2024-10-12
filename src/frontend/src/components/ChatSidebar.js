import React, { useState } from 'react';
import './ChatSidebar.css'; // Create a CSS file for styling

const ChatSidebar = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        { text: 'This is a simulated response from the LLM.', sender: 'llm' },
      ]);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Ask Grok to Guide you..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatSidebar;
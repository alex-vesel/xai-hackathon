import React, { useState } from 'react';
import './ChatSidebar.css'; // Create a CSS file for styling

const ChatSidebar = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
      setLoading(true);

      try {
        const response = await fetch(`http://0.0.0.0:5001/chat_with_graph?input=${input}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.response, sender: 'llm' },
        ]);
      } catch (error) {
        console.error('Error fetching LLM response:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'Error fetching response from the LLM.', sender: 'llm' },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSynthesize = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://0.0.0.0:5001/synthesize`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data, sender: 'llm' },
      ]);
    } catch (error) {
      console.error('Error fetching synthesis response:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Error fetching synthesis response from the LLM.', sender: 'llm' },
      ]);
    } finally {
      setLoading(false);
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
        {loading && <div className="loading-bar">Loading...</div>}
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
        <button onClick={handleSynthesize}>
          <img src="synthesize-icon.png" alt="Synthesize" />
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;

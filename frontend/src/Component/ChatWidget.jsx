// ChatWidget.js
import React, { useState } from 'react';
import axios from 'axios';

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    const res = await axios.post('http://localhost:3001/api/chat', {
      message: input,
    });

    setMessages([...newMessages, { sender: 'bot', text: res.data.reply }]);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '300px' }}>
      <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: '10px', padding: '10px', maxHeight: '400px', overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Ask something..."
        className="form-control mt-2"
      />
    </div>
  );
}

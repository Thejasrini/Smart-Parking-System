import { useState, useRef, useEffect } from 'react';
import API from '../../api/axios';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: '👋 Hi! I am your Smart Parking Assistant!\nTry asking:\n• Find cheap parking\n• Show available parking\n• Best time to park\n• Show prices'
    }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await API.post('/ai/chat', { message: input });
      const botMsg = { from: 'bot', text: res.data.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: '❌ Something went wrong. Try again!' }
      ]);
    }

    setLoading(false);
  };

  // Send on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={styles.page}>
      <div style={styles.chatBox}>

        {/* Header */}
        <div style={styles.header}>
          <span>🤖 Smart Parking Bot</span>
          <span style={styles.onlineDot}>● Online</span>
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.bubble,
                alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                background: msg.from === 'user' ? '#2196F3' : '#f1f1f1',
                color:      msg.from === 'user' ? '#fff'    : '#333',
              }}
            >
              {/* Render line breaks properly */}
              {msg.text.split('\n').map((line, j) => (
                <span key={j}>{line}<br /></span>
              ))}
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div style={{ ...styles.bubble, background: '#f1f1f1', alignSelf: 'flex-start' }}>
              <span style={styles.typing}>● ● ●</span>
            </div>
          )}

          {/* Invisible div to scroll to */}
          <div ref={bottomRef} />
        </div>

        {/* Quick Reply Buttons */}
        <div style={styles.quickReplies}>
          {['Find cheap parking', 'Show available', 'Best time to park', 'Show prices'].map((q) => (
            <button
              key={q}
              style={styles.quickBtn}
              onClick={() => { setInput(q); }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            value={input}
            placeholder="Type a message..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button style={styles.sendBtn} onClick={sendMessage}>
            ➤
          </button>
        </div>

      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', height: '90vh', background: '#f0f2f5'
  },
  chatBox: {
    width: '420px', height: '600px', background: '#fff',
    borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden'
  },
  header: {
    background: '#1a1a2e', color: '#fff',
    padding: '16px 20px', fontSize: '16px', fontWeight: 'bold',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  onlineDot: { color: '#4CAF50', fontSize: '13px' },
  messages: {
    flex: 1, padding: '16px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '10px'
  },
  bubble: {
    maxWidth: '75%', padding: '10px 14px',
    borderRadius: '16px', fontSize: '14px',
    lineHeight: '1.5', wordBreak: 'break-word'
  },
  typing: { letterSpacing: '4px', fontSize: '18px', color: '#999' },
  quickReplies: {
    display: 'flex', flexWrap: 'wrap', gap: '6px',
    padding: '8px 12px', borderTop: '1px solid #eee'
  },
  quickBtn: {
    background: '#e3f2fd', border: '1px solid #90caf9',
    borderRadius: '20px', padding: '4px 10px',
    fontSize: '12px', cursor: 'pointer', color: '#1565c0'
  },
  inputRow: {
    display: 'flex', padding: '12px',
    borderTop: '1px solid #eee', gap: '8px'
  },
  input: {
    flex: 1, padding: '10px 14px', borderRadius: '24px',
    border: '1px solid #ddd', fontSize: '14px', outline: 'none'
  },
  sendBtn: {
    background: '#2196F3', color: '#fff', border: 'none',
    borderRadius: '50%', width: '42px', height: '42px',
    fontSize: '18px', cursor: 'pointer'
  }
};

export default ChatBot;
import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setResponse(''); // Clear previous response
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setResponse((prev) => prev + chunkValue);
      }
    } catch (error) {
      setResponse('Error: Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>AI Basics with Groq</h1>
        <p>Ask anything and get a response from Llama 3!</p>
      </header>
      
      <main>
        <form onSubmit={handleSubmit} className="input-group">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your question here..."
            rows="3"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Thinking...' : 'Send Message'}
          </button>
        </form>

        {response && (
          <div className="response-card">
            <h3>AI Response:</h3>
            <div className="response-content">
              {response}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

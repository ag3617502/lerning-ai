import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';

const API_BASE = "http://localhost:3000/api";

function App() {
  const [inputs, setInputs] = useState(['']);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addInput = () => {
    if (inputs.length < 10) {
      setInputs([...inputs, '']);
    }
  };

  const removeInput = (index) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs.length ? newInputs : ['']);
  };

  const updateInput = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSearch = async () => {
    if (!question || inputs.every(i => !i.trim())) return;
    
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post(`${API_BASE}/match`, {
        inputs: inputs.filter(i => i.trim()),
        question
      });
      setResult(response.data);
    } catch (error) {
      console.error("Search error:", error);
      alert("Error finding match. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Semantic Match</h1>
        <p className="subtitle">Find which of your phrases best matches a query using AI embeddings.</p>

        <div className="input-group">
          <label>Your Phrases</label>
          <div className="dynamic-inputs">
            {inputs.map((input, index) => (
              <div key={index} className="input-row">
                <input
                  type="text"
                  placeholder={`Phrase #${index + 1}`}
                  value={input}
                  onChange={(e) => updateInput(index, e.target.value)}
                />
                <button 
                  className="btn btn-danger" 
                  onClick={() => removeInput(index)}
                  title="Remove"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          {inputs.length < 10 && (
            <button className="btn btn-secondary" onClick={addInput}>
              <Plus size={18} /> Add Phrase
            </button>
          )}
        </div>

        <div className="input-group">
          <label>Ask a Question</label>
          <input
            type="text"
            placeholder="e.g. Where does he live?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleSearch}
          disabled={loading || !question}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          {loading ? 'Finding Match...' : 'Search Top Match'}
        </button>

        {result && (
          <div className="result-card">
            <div className="result-label">Best Match Found</div>
            <div className="result-text">{result.bestMatch}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

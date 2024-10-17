import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(''); // Initialize to an empty string
  const [rate, setRate] = useState(1);
  const speechRef = useRef(null);

  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name); // Default to the first voice if available
      }
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }

    fetchVoices();
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleVoiceChange = (e) => {
    setSelectedVoice(e.target.value);
  };

  const handleRateChange = (e) => {
    setRate(e.target.value);
  };

  const toggleSpeaking = () => {
    if (!text) {
      alert("Please enter text to speak.");
      return;
    }

    if (!isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
      utterance.rate = rate;

      window.speechSynthesis.speak(utterance);
      speechRef.current = utterance;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      setIsSpeaking(true);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };


  return (
    <div style={containerStyle}>
      <h3>Text Speaking Assistant</h3>
      <br/>
      <br/>
      
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Enter text here"
        rows="4"
        cols="50"
        style={textareaStyle}
      />
      <div style={controlContainerStyle}>
        {/* Voice Selection */}
        <label style={labelStyle}>Voice: </label>
        <select value={selectedVoice} onChange={handleVoiceChange} style={selectStyle}>
          {voices.map((voice, index) => (
            <option key={index} value={voice.name}>{voice.name} ({voice.lang})</option>
          ))}
        </select>

        {/* Rate Selection */}
        <label style={labelStyle}>Speed: </label>
        <input 
          type="range" 
          min="0.5" 
          max="2" 
          step="0.1" 
          value={rate} 
          onChange={handleRateChange} 
          style={rangeStyle}
        />
        <span>{rate}x</span>
      </div>

      <button onClick={toggleSpeaking} style={buttonStyle}>
        {isSpeaking ? 'Stop' : 'Start Speaking'}
      </button>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  paddingLeft : "60vh"
};

const textareaStyle = {
  marginBottom: '20px',
  padding: '10px',
  width: '400px',
  height: '100px',
};

const controlContainerStyle = {
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
};

const labelStyle = {
  fontWeight: 'bold',
};

const selectStyle = {
  padding: '5px',
  fontSize: '16px',
};

const rangeStyle = {
  marginLeft: '10px',
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
  backgroundColor: '#007BFF',
  color: '#FFF',
  border: 'none',
  borderRadius: '5px',
};

export default App;

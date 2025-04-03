import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State management
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('');
  const [voices, setVoices] = useState([]);
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(null);
  const synth = window.speechSynthesis;

  // Load available voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      
      // Set default voice (prefer Microsoft David if available)
      if (availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(v => 
          v.name.includes('David') || 
          (v.lang.includes('en') && v.default)
        ) || availableVoices[0];
        
        setVoice(defaultVoice.name);
      }
    };

    // Handle voices loading which can be asynchronous
    if (synth.getVoices().length > 0) {
      loadVoices();
    }
    
    synth.onvoiceschanged = loadVoices;

    // Clean up on unmount
    return () => {
      synth.onvoiceschanged = null;
      if (synth.speaking) synth.cancel();
    };
  }, []);

  // Handle text-to-speech with word highlighting
  const handleSpeak = () => {
    if (text.trim() === '') return;
    
    // Cancel any ongoing speech
    if (synth.speaking) {
      synth.cancel();
      setIsPlaying(false);
      setCurrentWordIndex(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set selected voice
    const selectedVoice = voices.find(v => v.name === voice);
    if (selectedVoice) utterance.voice = selectedVoice;
    
    // Set speech rate
    utterance.rate = rate;
    
    // Word boundary detection for highlighting
    const words = text.split(/\s+/);
    let wordIndex = 0;
    
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentWordIndex(wordIndex);
        wordIndex = Math.min(wordIndex + 1, words.length - 1);
      }
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(null);
    };
    
    // Start speaking
    setIsPlaying(true);
    setCurrentWordIndex(0);
    synth.speak(utterance);
  };

  // Render text with current word highlighting
  const renderText = () => {
    if (currentWordIndex === null || !isPlaying) {
      return text;
    }
    
    const words = text.split(/\s+/);
    return (
      <div>
        {words.map((word, index) => (
          <span 
            key={index} 
            style={{ 
              backgroundColor: index === currentWordIndex ? 'rgba(0, 157, 255, 0.3)' : 'transparent',
              padding: '0 2px',
              borderRadius: '3px',
              transition: 'background-color 0.2s'
            }}
          >
            {word}{' '}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <h3>Text Speaking Assistant</h3>
      
      <div className="text-container">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here..."
        />
        <div className="char-count">{text.length} characters</div>
      </div>
      
      <div className="control-container">
        <div className="voice-control">
          <div className="control-label">
            <span>Voice:</span>
          </div>
          <select value={voice} onChange={(e) => setVoice(e.target.value)}>
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
        
        <div className="speed-control">
          <div className="control-label">
            <span>Speed:</span>
            <span>{rate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
          />
        </div>
      </div>
      
      <button 
        onClick={handleSpeak} 
        className={isPlaying ? 'speaking-btn' : ''}
      >
        {isPlaying ? 'Stop Speaking' : 'Start Speaking'}
      </button>
    </div>
  );
}

export default App;
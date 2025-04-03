import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
// import "./app2.css";
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('');
  const [voices, setVoices] = useState([]);
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [highlightedText, setHighlightedText] = useState('');
  const [currentWord, setCurrentWord] = useState(0);
  const synth = window.speechSynthesis;

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      const defaultVoice = availableVoices.find(v => 
        v.name.includes('David') || 
        (v.lang.includes('en') && v.default)
      ) || availableVoices[0];
      
      if (defaultVoice) setVoice(defaultVoice.name);
    };

    if (synth.getVoices().length > 0) {
      loadVoices();
    }

    synth.onvoiceschanged = loadVoices;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    document.body.className = prefersDark ? 'dark-mode' : 'light-mode';

    return () => {
      synth.onvoiceschanged = null;
      if (synth.speaking) synth.cancel();
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.className = !isDarkMode ? 'dark-mode' : 'light-mode';
  };

  // Handle text highlighting during speech
  const handleTextHighlighting = (utterance, words) => {
    setCurrentWord(0);
    
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentWord((prevWord) => {
          const nextWord = prevWord + 1;
          return nextWord < words.length ? nextWord : prevWord;
        });
      }
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setHighlightedText('');
      setCurrentWord(0);
    };
  };

  const speak = () => {
    if (text.trim() === '') return;
    
    if (synth.speaking) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    const selectedVoice = voices.find(v => v.name === voice);
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.rate = rate;
    
    const words = text.split(/\s+/);
    setHighlightedText(text);
    handleTextHighlighting(utterance, words);
    
    setIsPlaying(true);
    synth.speak(utterance);
  };

  return (
    <>
      <h3 className="page-title">Text Speaking Assistant</h3>
      
      <button 
        className="toggle-button" 
        onClick={toggleTheme}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
      
      <div className="container">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text here..."
          />
          <div style={{ textAlign: 'right', fontSize: '0.8em', opacity: 0.7, marginTop: '4px' }}>
            {text.length} characters
          </div>
        </div>
        
        <div className="control-container">
          <div>
            <div className="control-label">
              <span>Voice:</span>
            </div>
            <select 
              className="voice-select"
              value={voice} 
              onChange={(e) => setVoice(e.target.value)}
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
          
          <div>
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
              className="speed-bar"
            />
          </div>
        </div>
        
        <button 
          onClick={speak} 
          className={`speak-button ${isPlaying ? 'playing' : ''}`}
        >
          <i className={isPlaying ? 'fas fa-stop' : 'fas fa-play'}></i>
          {isPlaying ? 'Stop Speaking' : 'Start Speaking'}
        </button>
      </div>
    </>
  );
}

export default App;
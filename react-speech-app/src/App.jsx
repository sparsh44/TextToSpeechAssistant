

import { useState, useRef, useEffect } from "react";

function App() {
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [lastCharIndex, setLastCharIndex] = useState(0);
  const speechRef = useRef(null);

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }

    fetchVoices();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleTextChange = (e) => setText(e.target.value);
  const handleVoiceChange = (e) => setSelectedVoice(e.target.value);
  const handleRateChange = (e) => setRate(e.target.value);

  const toggleSpeaking = () => {
    if (!text) {
      alert("Please enter text to speak.");
      return;
    }

    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      startSpeech(lastCharIndex);
    }
  };

  const startSpeech = (startIndex) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.substring(startIndex));
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.onboundary = (event) => setLastCharIndex(startIndex + event.charIndex);

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setLastCharIndex(0);
    };

    window.speechSynthesis.speak(utterance);
    speechRef.current = utterance;
    setIsSpeaking(true);
    setIsPaused(false);
  };

  return (
    <div style={theme === "light" ? containerLightStyle : containerDarkStyle}>
      {/* Dark Mode Toggle Button */}
      <div onClick={toggleTheme} style={themeToggleButtonStyle}>
        <div style={{ ...themeToggleCircleStyle, transform: theme === "light" ? "translateX(0)" : "translateX(30px)" }}>
          {theme === "light" ? "☀️" : "🌙"}
        </div>
      </div>

      <h3>Text Speaking Assistant</h3>
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Enter text here"
        rows="4"
        cols="50"
        style={theme === "light" ? textareaLightStyle : textareaDarkStyle}
      />
      
      <div style={theme === "light" ? controlContainerLightStyle : controlContainerDarkStyle}>
        <div>
          <label style={labelStyle}>Voice: </label>
          <select value={selectedVoice} onChange={handleVoiceChange} style={selectStyle}>
            {voices.map((voice, index) => (
              <option key={index} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Speed: </label>
          <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={handleRateChange} style={rangeStyle} />
          <span>{rate}x</span>
        </div>
      </div>

      <button onClick={toggleSpeaking} style={buttonStyle}>
        {isSpeaking ? (isPaused ? "Resume" : "Pause") : "Start Speaking"}
      </button>
    </div>
  );
}

// Styles for Light & Dark Mode
const containerLightStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100vw",
  backgroundColor: "#ffffff",
  color: "#000",
};

const containerDarkStyle = {
  ...containerLightStyle,
  backgroundColor: "#121212",
  color: "#fff",
};

const textareaLightStyle = {
  marginBottom: "20px",
  padding: "10px",
  width: "50vw",
  height: "30vh",
  resize: "none",
  fontSize: "16px",
  backgroundColor: "#ffffff",
  color: "#000",
  border: "1px solid #ccc",
};

const textareaDarkStyle = {
  ...textareaLightStyle,
  backgroundColor: "#1e1e1e",
  color: "#fff",
  border: "1px solid #555",
};

const controlContainerLightStyle = {
  marginBottom: "20px",
  display: window.innerWidth <= 670 ? "block" : "flex",
  alignItems: "center",
  gap: "15px",
  backgroundColor: "#f5f5f5",
  padding: "10px",
  borderRadius: "8px",
};

const controlContainerDarkStyle = {
  ...controlContainerLightStyle,
  backgroundColor: "#333",
  color: "#fff",
};

const labelStyle = { fontWeight: "bold" };
const selectStyle = { padding: "5px", fontSize: "16px" };
const rangeStyle = { marginLeft: "10px" };

const buttonStyle = {
  padding: "12px 24px",
  fontSize: "18px",
  cursor: "pointer",
  backgroundColor: "#007BFF",
  color: "#FFF",
  border: "none",
  borderRadius: "10px",
  transition: "background 0.3s ease",
};

const themeToggleButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  width: "60px",
  height: "30px",
  backgroundColor: "#444",
  borderRadius: "50px",
  display: "flex",
  alignItems: "center",
  padding: "5px",
  cursor: "pointer",
  transition: "all 0.3s ease-in-out",
};

const themeToggleCircleStyle = {
  width: "22px",
  height: "22px",
  backgroundColor: "#FFF",
  borderRadius: "50%",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  transition: "all 0.3s ease-in-out",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default App;

import { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app2.css";

function App() {
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(() => {
    const savedRate = localStorage.getItem("ttsRate");
    return savedRate ? parseFloat(savedRate) : 1;
  });
  
  const [lastCharIndex, setLastCharIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const speechRef = useRef(null);

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
    document.body.className = isDarkMode ? "dark-mode" : "light-mode";
  }, [isDarkMode]);

  // Get the word of a string given the string and index
  const getWordAt = (str, pos) => {
    str = String(str);
    pos = Number(pos) >>> 0;

    let left = str.slice(0, pos + 1).search(/\S+$/),
      right = str.slice(pos).search(/\s/);

    if (right < 0) {
      return str.slice(left);
    }
    return str.slice(left, right + pos);
  };

  // Get the position of the beginning of the word
  const getWordStart = (str, pos) => {
    str = String(str);
    pos = Number(pos) >>> 0;
    let start = str.slice(0, pos + 1).search(/\S+$/);
    return start;
  };

  const wordHighlightAndAutoScroll = (event,text) => {
    let textarea = document.getElementById("textarea");
    let value = text;
    let index = event.charIndex;
    console.log(index);
    let word = getWordAt(value, index);
    console.log(word);
    let anchorPosition = (textarea.value.length-value.length) + getWordStart(value, index);
    let activePosition = anchorPosition + word.length;

    textarea.focus();

    const fullText = textarea.value;
    textarea.value = fullText.substring(0, activePosition+250);
    textarea.scrollTop = textarea.scrollHeight;
    textarea.value = fullText;

    if (textarea.setSelectionRange) {
      textarea.setSelectionRange(anchorPosition, activePosition);
    } else {
      let range = textarea.createTextRange();
      range.collapse(true);
      range.moveEnd("character", activePosition);
      range.moveStart("character", anchorPosition);
      range.select();
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const handleTextChange = (e) => setText(e.target.value);
  const handleVoiceChange = (e) => {
    setSelectedVoice(e.target.value);
    if (isSpeaking) restartSpeech(lastCharIndex);
  };

  const handleRateChange = async (e) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);
    localStorage.setItem("ttsRate", newRate);
    if (isSpeaking) {
      restartSpeech(lastCharIndex, newRate);
    }
  };

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
      startSpeech(lastCharIndex, rate);
    }
  };

  const startSpeech = (startIndex, speechRate) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.substring(startIndex));
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = speechRate;

    utterance.onboundary = async (event) => {
      await setLastCharIndex(startIndex + event.charIndex);
      await wordHighlightAndAutoScroll(event,utterance.text);
    };

    utterance.onpause = (event) => {
      setLastCharIndex(event.charIndex);
      setIsPaused(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setLastCharIndex(0);
    };

    speechRef.current = utterance;
    setIsSpeaking(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const restartSpeech = (startIndex, speechRate = rate) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      startSpeech(startIndex, speechRate);
    }
  };

  return (
    <div className={`app ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <button className="toggle-button" onClick={toggleDarkMode}>
        {isDarkMode ? "🌙" : "☀️"}
      </button>

      <h3 className="page-title">Text Speaking Assistant</h3>

      <div className="container">
        <textarea
          id="textarea"
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text here"
          rows="4"
        />

        <div className="control-container d-flex justify-content-around align-items-center mt-3">
          <div className="voice-select">
            <label>Voice:</label>
            <select
              value={selectedVoice}
              onChange={handleVoiceChange}
              className="form-select"
            >
              {voices.map((voice, index) => (
                <option key={index} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="speed-control">
            <label>Speed:</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
              className="form-range"
            />
            <div className="speed-indicator">{rate}x</div>
          </div>
        </div>

        <button
          onClick={toggleSpeaking}
          className="speak-button btn btn-primary"
        >
          {isSpeaking ? (isPaused ? "Resume" : "Pause") : "Start Speaking"}
        </button>
      </div>
    </div>
  );
}

export default App;


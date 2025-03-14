import "./Home.scss";
import Footer from "../../Components/Footer/Footer";
import Header from "../../Components/Header/Header";
import React, { useState, useRef } from "react";
import Logo from "../../assets/styles/Images/Icons/languages.png";

function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);
  const [fontSize, setFontSize] = useState(16);


  const handleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {

      socketRef.current = new WebSocket(`ws://localhost:8080`);

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "transcript" && data.data.text) {
          setTranscript((prev) => {
            // Prevent duplicate transcript updates
            if (prev.endsWith(data.data.text)) {
              return prev; // Ignore duplicate update
            }
            return prev + " " + data.data.text;
          });
        }
      };
      

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = convertFloat32ToInt16(inputData);
          const base64Audio = arrayBufferToBase64(pcmData.buffer);
          socketRef.current.send(
            JSON.stringify({ type: "audio", audio: base64Audio })
          );
        }
      };

      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (processorRef.current && sourceRef.current) {
      sourceRef.current.disconnect();
      processorRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (socketRef.current) {
      socketRef.current.close();
    }
    setIsRecording(false);
  };

  const clearTranscript = () => {
    setTranscript("");
  };

  const convertFloat32ToInt16 = (buffer) => {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      buf[i] = Math.min(1, Math.max(-1, buffer[i])) * 0x7fff;
    }
    return buf;
  };

  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleIncreaseFont = () => {
    setFontSize((prev) => prev + 2);
  };

  const handleDecreaseFont = () => {
    setFontSize((prev) => prev - 2);
  };

  const downloadTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "transcript.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <>
      <Header />
      <div className="body">
        <div className={"body__transcription"}>
          <span className="body__quotes">"</span>
          <p style={{ fontSize: `${fontSize}px` }}>{transcript || "Click Start Recording To See Transcripts..."}</p>
          <span className="body__quotes">"</span>
        </div>

        <div className={"body__container"}>
          <div className={`body__text${isRecording ? "--recording" : ""}`}>
            <img src={Logo} className="body__text-logo" alt="Globe language logo" />
            <p className={`body__text-description${isRecording ? "--recording" : ""}`}>
              No More Lost In Translation - AI That Speaks Your Accent!
            </p>
          </div>
          <div className="body__action">
            <button className={`body__action-record ${isRecording ? "recording" : ""}`} onClick={handleRecording}>
              {isRecording ? "END RECORDING" : "START RECORDING"}
            </button>
            <button className="body__action-increase" onClick={handleIncreaseFont}>Increase Font Size</button>
            <button className="body__action-decrease" onClick={handleDecreaseFont}>Decrease Font Size</button>
            <button className="body__action-download" onClick={downloadTranscript}>Download Transcript</button>
            <button className="body__action-clear" onClick={clearTranscript}>Clear</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;
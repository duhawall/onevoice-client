import "./AssemblyAi.scss";
import "./AssemblyAi.scss";
import React, { useState, useRef } from "react";

// websocket used instead of axios
// because of real time transcription
// websocket has a persistent connection (needed for a continuous stream of audio)
// axios would be 100's of requests per min (as people pause when speaking)
// app sends audio to server
// receives text from server
// does both in real time
// websocket also responds immediately (preventing additional states like loading)

// FINALLY it's just an AssemblyAi thing for streaming

export const TranscriptionComponent = ({ isRecording, setIsRecording }) => {
  // satte vars to track transcribed text and recording status
  const [transcript, setTranscript] = useState("");
  // const [isRecording, setIsRecording] = useState(false);
  // refs below  maintain reference to audio processing (objects)
  // these eneed to persist outside how React renders so it's a ref
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);
  const [fontSize, setFontSize] = useState(16);

  const startRecording = async () => {
    try {
      // Connect to backend WebSocket (using websocket, stays open)
      socketRef.current = new WebSocket(`ws://localhost:8080`);

      // this listens for any results from assemblyai (backend)
      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        // assembly ai has in progress + final (when user stops talking)
        if (data.type === "transcript" && data.data.text) {
          console.log("Transcript data:", data.data);

          // Show partial transcripts
          if (data.data.message_type === "PartialTranscript") {
            setTranscript(data.data.text);
          }

          // Append final transcripts
          if (
            data.data.message_type === "FinalTranscript" ||
            data.data.message_type === "final"
          ) {
            setTranscript((prev) => prev + " " + data.data.text);
          }
        }
      };

      // Get microphone stream
      // this requests mic access w/ mediadevices api (browser built)
      // returns the audio track and stores it in a ref (to clean up later)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio processing pipeline with web audio API
      // audioContext processes at a medium quality rate
      const audioContext = new AudioContext({
        sampleRate: 16000, // Match AssemblyAI's expected sample rate
      });
      audioContextRef.current = audioContext;

      // here we connect mic to audio processing system
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create script processor for raw audio access; what Assembly wants
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // this forms the chain
      source.connect(processor);
      processor.connect(audioContext.destination);

      // Process and send audio data
      // fires constantly on audio proceessing
      processor.onaudioprocess = (e) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          // Get raw audio data
          const inputData = e.inputBuffer.getChannelData(0);

          // Convert Float32Array to Int16Array (format AssemblyAI expects)
          const pcmData = convertFloat32ToInt16(inputData);

          // Convert to base64 for transmission to Websocket (for safeety)
          const base64Audio = arrayBufferToBase64(pcmData.buffer);

          // seend back to backend with json packets
          socketRef.current.send(
            JSON.stringify({
              type: "audio",
              audio: base64Audio,
            })
          );
        }
      };

      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // disconnect nodes, closes websocket, updates ui
  const stopRecording = () => {
    // Clean up audio processing
    if (processorRef.current && sourceRef.current) {
      sourceRef.current.disconnect();
      processorRef.current.disconnect();
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    // Stop microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close WebSocket
    if (socketRef.current) {
      socketRef.current.close();
    }

    setIsRecording(false);
  };

  // Helper function to convert Float32Array to Int16Array
  // these 2 convert binary data to text based format

  const handleIncreaseFont = () => {
    setFontSize((prevFontSize) => prevFontSize + 2);
  };

  const handleDecreaseFont = () => {
    setFontSize((prevFontSize) => prevFontSize - 2);
  };

  const convertFloat32ToInt16 = (buffer) => {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      // Convert float [-1.0, 1.0] to int [-32768, 32767]
      buf[i] = Math.min(1, Math.max(-1, buffer[i])) * 0x7fff;
    }
    return buf;
  };

  // Helper function to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }; // pure fnxn, I/O w. no side effects

  return (
    <>
      <h2>Real-time Transcription</h2>
      <button
        className={`body__action-record ${isRecording ? "recording" : ""}`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <div>
        <h3>Transcript:</h3>
        <p style={{ fontSize: `${fontSize}px` }}>{transcript}</p>
        <div className="button__container">
          <button className="button__font" onClick={handleIncreaseFont}>
            Increase Font Size
          </button>
          <button className="button__font" onClick={handleDecreaseFont}>
            Decrease Font Size
          </button>
        </div>
      </div>
    </>
  );
};

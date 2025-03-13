import React, { useState, useRef } from "react";

export const TranscriptionComponent = () => {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      // Connect to backend WebSocket
      socketRef.current = new WebSocket(`ws://localhost:8080`);

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio processing pipeline
      const audioContext = new AudioContext({
        sampleRate: 16000, // Match AssemblyAI's expected sample rate
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create script processor for raw audio access
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Process and send audio data
      processor.onaudioprocess = (e) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          // Get raw audio data
          const inputData = e.inputBuffer.getChannelData(0);

          // Convert Float32Array to Int16Array (format AssemblyAI expects)
          const pcmData = convertFloat32ToInt16(inputData);

          // Convert to base64 for transmission
          const base64Audio = arrayBufferToBase64(pcmData.buffer);

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
  };

  return (
    <div>
      <h2>Real-time Transcription</h2>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <div>
        <h3>Transcript:</h3>
        <p>{transcript}</p>
      </div>
    </div>
  );
};

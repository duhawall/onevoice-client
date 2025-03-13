import React, { useEffect, useState, useRef } from "react";

export const TranscriptionComponent: React.FC = () => {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = (useRef < WebSocket) | (null > null);
  const mediaRecorderRef = (useRef < MediaRecorder) | (null > null);

  const startRecording = async () => {
    try {
      // Connect to our backend WebSocket
      socketRef.current = new WebSocket("ws://localhost:3001/transcribe");

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "transcript" && data.data.text) {
          if (data.data.message_type === "FinalTranscript") {
            setTranscript((prev) => prev + " " + data.data.text);
          }
        }
      };

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      // Send audio data to backend
      recorder.ondataavailable = async (event) => {
        if (
          socketRef.current?.readyState === WebSocket.OPEN &&
          event.data.size > 0
        ) {
          // Convert to base64 for WebSocket transmission
          const arrayBuffer = await event.data.arrayBuffer();
          const base64Audio = btoa(
            String.fromCharCode(...new Uint8Array(arrayBuffer))
          );

          socketRef.current.send(
            JSON.stringify({
              type: "audio",
              audio: base64Audio,
            })
          );
        }
      };

      // Start recording in small chunks
      recorder.start(250);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    setIsRecording(false);
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

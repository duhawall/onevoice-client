import "./Home.scss";
import Footer from "../../Components/Footer/Footer";
import Header from "../../Components/Header/Header";
import React, { useState } from "react";

function Home() {
  const [isRecording, setIsRecording] = useState(false);

  const handleRecording = () => {
    setIsRecording(!isRecording);
  };
  return (
    <>
      <Header />
      <div className="body">
        <div className="body__text">
          <p className="body__text-description">
            No More Lost In Translation - AI That Speaks Your Accent!
          </p>
        </div>
        <div className="action">
          <button
            className={`action_record ${isRecording ? "recording" : ""}`}
            onClick={handleRecording}
          >
            {isRecording ? "End Recording" : "Start Recording"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;

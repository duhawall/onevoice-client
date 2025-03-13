import "./Home.scss";
import Footer from "../../Components/Footer/Footer";
import Header from "../../Components/Header/Header";
import React, { useState } from "react";
import Logo from "../../assets/styles/Images/Icons/languages.png";

function Home() {
  const [isRecording, setIsRecording] = useState(false);

  const handleRecording = () => {
    setIsRecording(!isRecording);
  };
  return (
    <>
      <Header />
      <div className="body">
        <div
          className={
            isRecording ? "body__transcription" : "body__transcription--off"
          }
        >
          <span className="body__quotes">"</span>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, cum
          blanditiis. Quo minima dignissimos sed culpa ullam tempora, impedit
          minus officia provident est, enim accusantium. Dignissimos nesciunt
          fugiat facere aut?<span className="body__quotes">"</span>
        </div>
        <div
          className={
            isRecording ? "body__container--sloganbutton" : "body__container"
          }
        >
          <div className={isRecording ? `body__text--recording` : `body__text`}>
            <img
              src={Logo}
              className="body__text-logo"
              alt="Globe language logo"
            />
            <p
              className={
                isRecording
                  ? "body__text-description--recording"
                  : "body__text-description"
              }
            >
              No More Lost In Translation - AI That Speaks Your Accent!
            </p>
          </div>
          <div className="body__action">
            <button
              className={`body__action-record ${
                isRecording ? "recording" : ""
              }`}
              onClick={handleRecording}
            >
              {isRecording ? "END RECORDING" : "START RECORDING"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;

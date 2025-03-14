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
      <Header isRecording={isRecording} />
      <div className="body">
        <div
          className={
            isRecording ? "body__transcription" : "body__transcription--off"
          }
        >
          <svg
            className="body__quote"
            xmlns="http://www.w3.org/2000/svg"
            height={16}
            viewBox="0 0 16 16"
          >
            <path
              fill="#00bf63"
              d="M7 7v7H0V6.9c0-4.8 4.5-5.4 4.5-5.4l.6 1.4s-2 .3-2.4 1.9C2.3 6 3.1 7 3.1 7zm9 0v7H9V6.9c0-4.8 4.5-5.4 4.5-5.4l.6 1.4s-2 .3-2.4 1.9c-.4 1.2.4 2.2.4 2.2z"
            ></path>
          </svg>
          <span>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, cum
            blanditiis. Quo minima dignissimos sed culpa ullam tempora, impedit
            minus officia provident est, enim accusantium. Dignissimos nesciunt
            fugiat facere aut?
          </span>
          <svg
            className="body__quote"
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 16 16"
          >
            <path
              fill="#00bf63"
              d="M9 9V2h7v7.1c0 4.8-4.5 5.4-4.5 5.4l-.6-1.4s2-.3 2.4-1.9c.4-1.2-.4-2.2-.4-2.2zM0 9V2h7v7.1c0 4.8-4.5 5.4-4.5 5.4l-.6-1.4s2-.3 2.4-1.9C4.7 10 3.9 9 3.9 9z"
            ></path>
          </svg>
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

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home.jsx";
import "./App.scss";
import { TranscriptionComponent } from "./components/AssemblyAi.jsx";

function App() {
  return (
    <>
      <Router>
        <Routes basename="/">
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
      {/* <TranscriptionComponent /> */}
    </>
  );
}

export default App;

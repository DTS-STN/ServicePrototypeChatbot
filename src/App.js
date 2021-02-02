import React, { useEffect } from "react";
import Header from "./Components/Header";
import Body from "./Components/Body";
import "./styles/main.scss";

function App() {
  const messageListener = (event) => {
    // if (event.data) {
    console.log(event);
    // }
  };
  useEffect(() => {
    window.postMessage("ready");
    window.addEventListener("message", messageListener);

    return window.removeEventListener("message", messageListener);
  }, []);
  return (
    <div className="app">
      <Header />
      <Body />
    </div>
  );
}

export default App;

import React, { useEffect } from "react";
import Header from "./Components/Header";
import Body from "./Components/Body";
import "./styles/main.scss";

function App() {
  return (
    <div className="app">
      <Header />
      <Body />
    </div>
  );
}

export default App;

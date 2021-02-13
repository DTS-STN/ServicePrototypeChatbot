import React from "react";
import Header from "./Components/Header";
import Body from "./Components/Body";
import { ReactComponent as Chat } from "./assets/images/chat.svg";
import "./styles/main.scss";

function App() {
  const [active, setActive] = React.useState(false);

  const buttonClick = () => {
    setActive(!active);
  };
  return (
    <div className={`app ${active ? "active" : "inactive"}`}>
      {active ? (
        <>
          <Header close={buttonClick}/>
          <Body />
        </>
      ) : (
        <button onClick={buttonClick}>
          <Chat />
        </button>
      )}
    </div>
  );
}

export default App;

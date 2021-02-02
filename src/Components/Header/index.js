import React from "react";
import { ReactComponent as Chat } from "../../assets/images/chat.svg";
import "./header.scss";

function Header() {
  return (
    <header className="header">
      <Chat />
      <h1>Live Chat</h1>
    </header>
  );
}

export default Header;

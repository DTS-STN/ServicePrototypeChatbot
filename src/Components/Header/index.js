import React from "react";
import { ReactComponent as Chat } from "../../assets/images/chat.svg";
import "./header.scss";

function Header({ close }) {
  return (
    <header className="header">
      <Chat />
      <h1>Live Chat</h1>
      <button className="header__close" onClick={close}>
        X
      </button>
    </header>
  );
}

export default Header;

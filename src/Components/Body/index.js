import React from "react";
import { ReactComponent as Arrow } from "../../assets/images/email.svg";
import "./body.scss";

function Body() {
  const [text, setText] = React.useState("");
  const onInput = (e) => {
    setText(e.target.value);
  };
  return (
    <main className="body">
      <div className="body__textContainer">
        <p>An agent will be with you in a moment.</p>
        <p>You are next in line</p>
      </div>
      <div className="body__inputContainer">
        <textarea
          type="textarea"
          placeholder="Type your message..."
          onInput={onInput}
          className="body_inputContainer__input"
          id="message"
          rows={4}
          value={text}
          maxLength={250}
        />
        <div className="body__inputContainer__arrow">
          <Arrow />
        </div>
      </div>
    </main>
  );
}

export default Body;

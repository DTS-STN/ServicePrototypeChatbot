import React from "react";
import { ReactComponent as Arrow } from "../../assets/images/email.svg";
import "./body.scss";

function Body() {
  const [text, setText] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [data, setData] = React.useState(undefined);
  const [cases, setCases] = React.useState(undefined);
  const onInput = (e) => {
    setText(e.target.value);
  };

  const onKeyDown = (e) => {
    if (e.code === "Enter" && !e.shiftKey) {
      e.preventDefault();

      send();
    }
  };

  const send = () => {
    if (text === "cases") {
      window.top.postMessage("ready", "*");
    }
    const currentMessages = messages;

    currentMessages.push(text);
    setText("");
    setMessages(currentMessages);
  };

  const addCasesToChat = (cases) => {
    if (cases.length > 0) {
      const currentMessages = messages;

      cases.forEach((c) => {
        currentMessages.push(`#${c.reference} ${c.status}`);
      });

      setMessages(currentMessages);
    }
  };

  const messageListener = (event) => {
    console.log("chatbot", event);

    if (event.data) {
      if (event.data.guid && event.data.jwt) {
        setData(event.data);
      }
    }
  };

  React.useEffect(() => {
    async function fetchData() {
      try {
        const casesData = await fetch(
          "https://api.us-east.apiconnect.appdomain.cloud/hmakhijadeloitteca-api/dev/hfp-client-apis/v1/casedetails",
          {
            method: "get",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: "Bearer " + data.jwt,
              guid: data.guid,
            },
          }
        );
        const casesJSON = await casesData.json();
        console.log(casesJSON);

        setCases(casesJSON.cases);
        addCasesToChat(casesJSON.cases);
      } catch (e) {
        console.log("http://localhost:4000/cases has no cases");
      }
    }
    window.addEventListener("message", messageListener);

    if (data) {
      fetchData();
    }

    return () => window.removeEventListener("message", messageListener);
  }, [data]);
  return (
    <main className="body">
      <div className="body__textContainer">
        {messages.length === 0 ? (
          <>
            <p>An agent will be with you in a moment.</p>
            <p>You are next in line</p>
          </>
        ) : (
          <>
            {messages.map((message, index) => (
              <p key={`${index}${index}`}>{message}</p>
            ))}
            {cases && (
              <>
                {/* {cases.length > 0 &&
                  cases.map((c, index) => (
                    <p style={{ textAlign: "right" }} key={`${index}${index}`}>
                      {`#${c.reference}`}{" "}
                      <span style={{ fontWeight: "bold" }}>{c.status}</span>
                    </p>
                  ))} */}
                {cases.length === 0 && (
                  <p style={{ textAlign: "right" }}>No Cases found</p>
                )}
              </>
            )}
          </>
        )}
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
          onKeyDown={onKeyDown}
        />
        <button className="body__inputContainer__arrow" onClick={send}>
          <Arrow />
        </button>
      </div>
    </main>
  );
}

export default Body;

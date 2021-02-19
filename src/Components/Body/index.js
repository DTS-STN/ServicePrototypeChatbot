import React from "react";
// import { ReactComponent as Arrow } from "../../assets/images/email.svg";
import "./body.scss";

function Body({ close }) {
  const [text, setText] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [data, setData] = React.useState(undefined);
  const [cases, setCases] = React.useState(false);
  const [benefits, setBenefits] = React.useState(false);
  const [questions, setQuestions] = React.useState([]);
  const [benefitsList, setBenefitsList] = React.useState([]);
  const [checkEligible, setCheckEligible] = React.useState(false);
  const [questionNumber, setQuestionNumber] = React.useState(0);
  const [questionTriggerText, setQuestionTriggerText] = React.useState([]);
  const [questionsActive, setQuestionsActive] = React.useState(false);
  const [answers, setAnswers] = React.useState({});
  const [topOrigin, setTopOrigin] = React.useState(undefined);

  // const onInput = (e) => {
  //   setText(e.target.value);
  // };

  // const onKeyDown = (e) => {
  //   if (e.code === "Enter" && !e.shiftKey) {
  //     e.preventDefault();

  //     send();
  //   }
  // };

  const checkExpectedAnswers = (givenAnswer) => {
    const hasAnswer = questionTriggerText.find(
      (triggerText) => givenAnswer === triggerText.value
    );
    if (hasAnswer) return hasAnswer;
    return false;
  };

  const send = () => {
    let currentMessages = [];
    const uniq = new Date().getTime();

    if (questionsActive) {
      setText("");
      const expectedAnswer = checkExpectedAnswers(text);

      if (expectedAnswer) {
        setAnswers({
          ...answers,
          [expectedAnswer.questionId]: expectedAnswer.value,
        });

        const messageText = (
          <p className="user message" key={uniq}>
            {expectedAnswer.text}
          </p>
        );
        currentMessages.push({ user: true, text: messageText });
        setMessages((prevMessages) => [...prevMessages, ...currentMessages]);

        addQuestionsToChat(questions, questionNumber);
      } else {
        currentMessages.push({
          user: false,
          text: <p className="message">"I didn't recognize that answer"</p>,
        });
        setMessages((prevMessages) => [...prevMessages, ...currentMessages]);
        addQuestionsToChat(questions, questionNumber - 1);
      }
    } else {
      if (text.includes("cases")) {
        const messageText = (
          <p className="user message" key={uniq}>
            I would like to see the status of my cases please.
          </p>
        );
        currentMessages.push({ user: true, text: messageText });
        window.top.postMessage("ready", "*");
        setCases(true);
        setMessages((prevMessages) => [...prevMessages, ...currentMessages]);
      } else if (text.includes("benefits") || text.includes("benefit")) {
        setBenefits(true);
        window.top.postMessage("ready", "*");
        setMessages((prevMessages) => [...prevMessages, ...currentMessages]);
      } else if (text === "clear") {
        currentMessages = [];
        setMessages([]);
      }
      setText("");
    }
  };

  const addCasesToChat = (chatCases) => {
    const currentMessages = [];

    if (chatCases.length > 0) {
      chatCases.forEach((c, index) => {
        currentMessages.push({
          user: false,
          text: (
            <p className="message">
              {`Your `}
              <span style={{ fontWeight: "bold" }}>{c.type}</span>
              {` application is still `}
              <span style={{ fontWeight: "bold" }}>{c.status}</span>
              {` by one of our processing agents. In case you are interested in following up, the `}
              <span
                style={{ fontWeight: "bold" }}
              >{`case reference number is ${c.reference}`}</span>
            </p>
          ),
        });
      });
      setMessages((prevMessages) => [...prevMessages, ...currentMessages]);
    } else {
      currentMessages.push({
        user: false,
        text: <p className="message">No Cases found</p>,
      });
      setMessages((prevMessages) => [...prevMessages, ...currentMessages]);
    }

    setCases(false);
    sendFollowUp();
  };

  const addQuestionsToChat = (chatQuestions, number = 0) => {
    const currentMessages = [];
    if (chatQuestions.length > number) {
      if (number === 0) {
        currentMessages.push({
          user: false,
          text: (
            <p className="message">
              Ok great! Let's start by getting to you know a bit.
            </p>
          ),
        });
      }
      currentMessages.push({
        user: false,
        text: <p className="message">{chatQuestions[number].text}</p>,
      });

      const answers = [];
      const triggerText = [];
      for (let j = 0; j < chatQuestions[number].answers.length; j++) {
        triggerText.push({
          answer: `${j}`,
          value: chatQuestions[number].answers[j].id,
          questionId: chatQuestions[number].value,
          text: chatQuestions[number].answers[j].text,
        });
        answers.push(
          <button
            onClick={() => {
              setText(chatQuestions[number].answers[j].id);
            }}
          >{`${chatQuestions[number].answers[j].text} `}</button>
        );
      }

      currentMessages.push({
        user: false,
        text: (
          <div className="body__textContainer__messages__answers">
            {answers.map((answer) => answer)}
          </div>
        ),
      });
      setQuestionTriggerText(triggerText);
      setQuestionNumber(number + 1);
      setMessages((prevMessages) => [...prevMessages, ...currentMessages]);

      if (number === 0) {
        setBenefits(false);
        setQuestions(chatQuestions);
      }
    } else if (chatQuestions.length === number) {
      currentMessages.push({
        user: false,
        text: <p className="message">Checking benefits</p>,
      });
      setMessages((prevMessages) => [...prevMessages, ...currentMessages]);
      setQuestionsActive(false);
      setCheckEligible(true);
    } else {
      currentMessages.push({
        user: false,
        text: <p className="message">No eligible benefits found</p>,
      });
      setMessages((prevMessages) => [...prevMessages, ...currentMessages]);
    }
  };

  const addBenefitsToChat = (chatBenefits) => {
    const currentMessages = [];

    if (chatBenefits && chatBenefits.length > 0) {
      currentMessages.push({
        user: false,
        text: <p className="message">You qualify for:</p>,
      });
      chatBenefits.forEach((c) => {
        const hasBenefit = benefitsList.find((benefit) => benefit.id === c);
        if (hasBenefit) {
          currentMessages.push({
            user: false,
            text: (
              <a
                target="_top"
                href={`${topOrigin}/benefit/${c}`}
                className="message"
              >
                {hasBenefit.title}
              </a>
            ),
          });
        }
      });

      setMessages((prevMessages) => [...prevMessages, ...currentMessages]);
      // setCases(cases);
    } else {
      currentMessages.push({
        user: false,
        text: <p className="message">No eligible benefits found</p>,
      });
      setMessages((prevMessages) => [...prevMessages, ...currentMessages]);
    }

    sendFollowUp();
  };

  const messageListener = (event) => {
    if (event.data) {
      if (event.data.guid && event.data.jwt) {
        setTopOrigin(event.origin);
        setData(event.data);
      }
    }
  };

  React.useEffect(() => {
    async function fetchData() {
      if (cases) {
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

          let cases = [];

          const dupe = (c2) => {
            for (let i = 0; i < cases.length; i++) {
              if (cases[i].reference === c2.reference) {
                return true;
              }
            }
            return false;
          };
          casesJSON.cases.forEach((c) => {
            if (!dupe(c)) {
              cases.push(c);
            }
          });
          // setCases(cases);
          addCasesToChat(casesJSON.cases);
        } catch (e) {
          console.log("Case error ", e);
          addCasesToChat([]);
        }
      } else if (benefits) {
        try {
          const questionsData = await fetch(
            "https://benefit-service-dev.dev.dts-stn.com/questions",
            {
              method: "get",
            }
          );
          const questionsJSON = await questionsData.json();

          const benefitsData = await fetch(
            "https://benefit-service-dev.dev.dts-stn.com/benefits",
            {
              method: "get",
            }
          );
          const benefitsJSON = await benefitsData.json();

          setBenefitsList(benefitsJSON);

          addQuestionsToChat(questionsJSON);
          setQuestionsActive(true);
        } catch (e) {
          console.log("benefit error", e);
        }
      } else if (checkEligible) {
        try {
          const response = await fetch(
            "https://benefit-service-dev.dev.dts-stn.com/benefits/eligible",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(answers),
            }
          );
          const json = await response.json();
          addBenefitsToChat(json);
        } catch (e) {
          console.log("eligible error", e);
        }
        setCheckEligible(false);
      }
    }

    window.addEventListener("message", messageListener);

    if (data) {
      fetchData();
    } else {
      window.top.postMessage("ready", "*");
    }

    if (text !== "") {
      send();
    }

    return () => window.removeEventListener("message", messageListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, benefits, checkEligible, text]);

  const AlwaysScrollToBottom = () => {
    const elementRef = React.useRef();
    React.useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  const sendFollowUp = () => {
    const currentMessages = [];

    const followUp = (
      <>
        <p className="message">Is there anything else I can help you with?</p>
        <p>
          <button
            onClick={() => {
              setText("clear");
            }}
          >
            Yes, please!
          </button>{" "}
          <button
            onClick={() => {
              close();
            }}
          >
            No, that's all for now
          </button>
        </p>
      </>
    );

    currentMessages.push({
      user: false,
      text: followUp,
    });

    setMessages((prevMessages) => [...prevMessages, ...currentMessages]);
  };

  return (
    <main className="body">
      <div className="body__textContainer">
        {messages.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <div>
              <p className="message">Hello! How can I help today?</p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <button
                style={{
                  margin: "auto",
                }}
                onClick={() => {
                  setText("Tell me about my cases");
                }}
              >
                Tell me about my cases
              </button>
              <button
                style={{
                  margin: "auto",
                  marginTop: "5px",
                }}
                onClick={() => {
                  setText("Help me learn what benefits I am eligible for");
                }}
              >
                Help me learn what benefits I am eligible for
              </button>
            </div>
          </div>
        )}
        {messages.length > 0 && (
          <div className="body__textContainer__messages">
            {messages.map((message, index) =>
              !message.user ? (
                <div key={`${index}${index}`}>{message.text}</div>
              ) : (
                <div
                  style={{ textAlign: "right", color: "#2b4380" }}
                  key={`${index}${index}`}
                >
                  {message.text}
                </div>
              )
            )}
            <AlwaysScrollToBottom />
          </div>
        )}
      </div>
      {/* <div className="body__inputContainer">
        <textarea
          type="textarea"
          placeholder="Type your message..."
          onInput={onInput}
          className="body_inputContainer__input"
          id="message"
          rows={2}
          value={text}
          maxLength={250}
          onKeyDown={onKeyDown}
        />
        <button className="body__inputContainer__arrow" onClick={send}>
          <Arrow />
        </button>
      </div> */}
    </main>
  );
}

export default Body;

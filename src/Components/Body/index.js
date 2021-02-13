import React from "react";
import { ReactComponent as Arrow } from "../../assets/images/email.svg";
import "./body.scss";

function Body() {
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

  const onInput = (e) => {
    setText(e.target.value);
  };

  const onKeyDown = (e) => {
    if (e.code === "Enter" && !e.shiftKey) {
      e.preventDefault();

      send();
    }
  };

  const checkExpectedAnswers = (givenAnswer) => {
    const hasAnswer = questionTriggerText.find(
      (triggerText) => givenAnswer === triggerText.answer
    );
    if (hasAnswer) return hasAnswer;
    return false;
  };

  const send = () => {
    let currentMessages = messages;

    const uniq = new Date().getTime();

    const messageText = <p key={uniq}>{text}</p>;

    currentMessages.push({ user: true, text: messageText });
    if (questionsActive) {
      setText("");
      setMessages([...currentMessages]);
      const expectedAnswer = checkExpectedAnswers(text);

      if (expectedAnswer) {
        setAnswers({
          ...answers,
          [expectedAnswer.questionId]: expectedAnswer.value,
        });
        addQuestionsToChat(questions, questionNumber);
      } else {
        currentMessages.push({
          user: false,
          text: "I didn't recognize that answer",
        });
        setMessages([...currentMessages]);
        addQuestionsToChat(questions, questionNumber - 1);
      }
    } else {
      if (text.includes("cases")) {
        window.top.postMessage("ready", "*");
        setCases(true);
      } else if (text.includes("benefits") || text.includes("benefit")) {
        setBenefits(true);
        window.top.postMessage("ready", "*");
      } else if (text === "clear") {
        currentMessages = [];
      }
      setText("");
      setMessages([...currentMessages]);
    }
  };

  const addCasesToChat = (chatCases) => {
    const currentMessages = [...messages];

    if (chatCases.length > 0) {
      chatCases.forEach((c, index) => {
        currentMessages.push({
          user: false,
          text: `#${c.reference} ${c.status}`,
        });
      });
      setMessages(currentMessages);
      // setCases(cases);
    } else {
      currentMessages.push({
        user: false,
        text: "No Cases found",
      });
      setMessages(currentMessages);
    }

    setCases(false);
  };

  const addQuestionsToChat = (chatQuestions, number = 0) => {
    const currentMessages = [...messages];
    if (chatQuestions.length > number) {
      currentMessages.push({
        user: false,
        text: chatQuestions[number].text,
      });
      currentMessages.push({
        user: false,
        text: <div />,
      });

      const answers = [];
      const triggerText = [];
      for (let j = 0; j < chatQuestions[number].answers.length; j++) {
        triggerText.push({
          answer: `${j}`,
          value: chatQuestions[number].answers[j].id,
          questionId: chatQuestions[number].value,
        });
        answers.push(
          <span>{` [ ${j} ] ${chatQuestions[number].answers[j].text} `}</span>
        );
      }

      currentMessages.push({
        user: false,
        text: (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {answers.map((answer) => answer)}
          </div>
        ),
      });
      setQuestionTriggerText(triggerText);
      setQuestionNumber(number + 1);
      setMessages(currentMessages);

      if (number === 0) {
        setBenefits(false);
        setQuestions(chatQuestions);
      }
    } else if (chatQuestions.length === number) {
      currentMessages.push({
        user: false,
        text: "Checking benefits",
      });
      setMessages(currentMessages);
      setQuestionsActive(false);
      setCheckEligible(true);
    } else {
      currentMessages.push({
        user: false,
        text: "No eligible benefits found",
      });
      setMessages(currentMessages);
    }
  };

  const addBenefitsToChat = (chatBenefits) => {
    const currentMessages = [...messages];

    if (chatBenefits.length > 0) {
      currentMessages.push({
        user: false,
        text: "You qualify for:",
      });
      chatBenefits.forEach((c) => {
        const hasBenefit = benefitsList.find((benefit) => benefit.id === c);
        if (hasBenefit) {
          currentMessages.push({
            user: false,
            text: hasBenefit.title,
          });
        }
      });

      setMessages(currentMessages);
      // setCases(cases);
    } else {
      currentMessages.push({
        user: false,
        text: "No Cases found",
      });
      setMessages(currentMessages);
    }
  };

  const messageListener = (event) => {
    if (event.data) {
      if (event.data.guid && event.data.jwt) {
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
          console.log("Case error", e);
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

    return () => window.removeEventListener("message", messageListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, benefits, checkEligible]);

  return (
    <main className="body">
      <div className="body__textContainer">
        {messages.length === 0 && (
          <>
            <p>Welcome to Self Service</p>
            <p>
              Ask about what{" "}
              <span style={{ fontStyle: "italic" }}>benefits</span> you're
              eligible for or information on your{" "}
              <span style={{ fontStyle: "italic" }}>cases</span>
            </p>
          </>
        )}
        <div className="body__textContainer__messages">
          {messages.length > 0 && (
            <>
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
            </>
          )}
        </div>
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

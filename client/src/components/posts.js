import { useState, useEffect } from "react";

//hold state for pagination here
function Posts({ questions, modelTags, handlers }) {
  const allQuestions = questions;
  const TotalPages = Math.ceil(questions.length / 5);
  const [visibleQuestions, setVisibleQuestions] = useState([]);
  const [questionPage, setQuestionPage] = useState(0);
  const questionsPerPage = 5;

  useEffect(() => {
    console.log('in use effect')
    let start = questionPage * 5;
    let end = start + 5;
    console.log("indices: " + start + " to " + end);

    // Calculate the starting and ending indices based on the current questionPage
    const startIndex = questionPage * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;

    // Update the visibleQuestions array based on the calculated indices
    const newVisibleQuestions = allQuestions.slice(startIndex, endIndex);

    // Update the state to re-render the component with the new visibleQuestions
    setVisibleQuestions(newVisibleQuestions);
  }, [questionPage, allQuestions]);

  // console.log("Visible questions: " + JSON.stringify(visibleQuestions))
  console.log("Page:" + questionPage);
  useEffect(() => {
    if (allQuestions.length > 0) {
      // Assuming you want the first 5 questions initially
      const firstQuestionSet = allQuestions.slice(0, 5);
      setVisibleQuestions(firstQuestionSet);
    }
  }, [allQuestions]);


  //change sets of questions
  const showNextSetOfQuestion = (questionPage) => {
    console.log("current page:" + questionPage);
    let currentPage = questionPage;
    clickedNext(questionPage);
    console.log("next page:" + questionPage);
    // let start = questionPage * 5;
    // let end = start + 5;
    // console.log("indices: " + start + " to " + end);
    // setVisibleQuestions(() => {
    //   const nextQuestionsSet = questions.slice(start, end);
    //   if (nextQuestionsSet.length === 0) {
    //     return allQuestions.slice(0, 5);
    //   } else {
    //     return nextQuestionsSet;
    //   }
    // });
  };

  const showPrevSetOfQuestion = (questionPage) => {
    console.log("current page:" + questionPage);
    let currentPage = questionPage;
    clickedPrev(currentPage);
    console.log("prev page:" + questionPage);
    // let start = questionPage * 5;
    // let end = start - 5;
    // console.log("indices: " + end + " to " + start);
    // setVisibleQuestions(() => {
    //   const nextQuestionsSet = questions.slice(end, start);
    //   if (nextQuestionsSet.length === 0) {
    //     return questions.slice(0, 5);
    //   } else {
    //     return nextQuestionsSet;
    //   }
    // });
  };


  const clickedNext = (questionPage) => {
    console.log("Before changing page state: " + questionPage);
    if (questionPage + 1 < TotalPages) {
      setQuestionPage(questionPage + 1);
      console.log("After setting state: " + questionPage);
    } else {
      setQuestionPage(0);
    }
  };

  const clickedPrev = (questionPage) => {
    if (questionPage - 1 >= 0) {
      setQuestionPage(questionPage- 1);
    } else {
      setQuestionPage(0);
    }
  };

  if (questions.length === 0) {
    const myStyle = {
      color: "gray",
      fontSize: 40,
      textAlign: "center",
      marginTop: "15%",
    };
    return <h2 style={myStyle}>No Questions Found </h2>;
  }
  if (visibleQuestions === undefined) {
    return null;
  }
  return (
    <>
      <div style={{ height: "65%", overflowY: "scroll" }}>
        {visibleQuestions.map((question) => {
          return (
            <Post
              key={question._id}
              question={question}
              {...question}
              // modelTags={modelTags}
              handlers={handlers}
            ></Post>
          );
        })}
      </div>
      <div style={{ textAlign: "center" }}>
        <span>
          {questionPage > 0 && (
            <button onClick={() => showPrevSetOfQuestion(questionPage)}>
              Prev
            </button>
          )}
          <button onClick={() => showNextSetOfQuestion(questionPage)}>
            Next
          </button>
        </span>
      </div>
    </>
  );
}

function Post({
  question,
  views,
  title,
  summary,
  asked_by,
  answers,
  ask_date_time,
  tags,
  _id,
  handlers,
}) {
  let ask_date_time_string = getLocaleString(ask_date_time);

  const handleTitleClick = () => {
    handlers[0]("answers", [_id]);
  };
  return (
    <div className="post-container">
      <div className="statsBox">
        <p>
          {answers.length} answer{answers.length !== 1 ? "s" : ""}
        </p>
        <p>
          {views} view{views !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="title-and-tags">
        <p className="post-title" onClick={handleTitleClick}>
          {title}
        </p>
        <p>{summary}</p>
        <div className="tag-container ">
          {tags.map((tag) => (
            <div key={tag._id} className="question-tag">{tag.name}</div>
          ))}
        </div>
      </div>
      <div className="date-user">
        <p>
          <span className="user">{asked_by.username} </span>
          {showDateMetadata(new Date(ask_date_time_string), "asked")}
        </p>
        <p></p>
      </div>
    </div>
  );
}

function showDateMetadata(msgDate, type) {
  let currDate = new Date();
  let currStr = type + " ";

  let currTime =
    currDate.getFullYear() +
    currDate.getMonth() / 10 +
    currDate.getDate() / 1000 +
    currDate.getHours() / 100000 +
    currDate.getMinutes() / 10000000 +
    currDate.getSeconds() / 1000000000;
  let msgTime =
    msgDate.getFullYear() +
    msgDate.getMonth() / 10 +
    msgDate.getDate() / 1000 +
    msgDate.getHours() / 100000 +
    msgDate.getMinutes() / 10000000 +
    msgDate.getSeconds() / 1000000000;

  let dateDifference = currTime - msgTime;
  let currVal;

  if (dateDifference < 1) {
    if (dateDifference < 0.001) {
      if (dateDifference < 0.00001) {
        if (dateDifference < 0.0000001) {
          if (dateDifference === 0) currVal = 0;
          else if (currDate.getSeconds() >= msgDate.getSeconds())
            currVal = currDate.getSeconds() - msgDate.getSeconds();
          else currVal = currDate.getSeconds() + (60 - msgDate.getSeconds());
          currStr += `${currVal} second${currVal !== 1 ? "s" : ""} ago`;
        } else {
          if (currDate.getMinutes() > msgDate.getMinutes())
            currVal = currDate.getMinutes() - msgDate.getMinutes();
          else currVal = currDate.getMinutes() + (60 - msgDate.getMinutes());
          if (currDate.getSeconds() < msgDate.getSeconds()) currVal -= 1;
          currStr += `${currVal} minute${currVal !== 1 ? "s" : ""} ago`;
        }
      } else {
        if (currDate.getHours() > msgDate.getHours())
          currVal = currDate.getHours() - msgDate.getHours();
        else currVal = currDate.getHours() + (24 - msgDate.getHours());
        if (
          currDate.getMinutes() < msgDate.getMinutes() ||
          (currDate.getMinutes() === msgDate.getMinutes() &&
            currDate.getSeconds() < msgDate.getSeconds())
        )
          currVal -= 1;
        currStr += `${currVal} hour${currVal !== 1 ? "s" : ""} ago`;
      }
    } else currStr += getDateString(msgDate, type);
  } else currStr += getDateString(msgDate, type, 1);

  return currStr;
}

function getDateString(msgDate, type, year = -1) {
  let dateStr = `${msgDate.toLocaleString("default", {
    month: "short",
  })} ${msgDate.getDate()}`;
  if (year !== -1) dateStr += `, ${msgDate.getFullYear()}`;

  if (type === "answered") dateStr += ", ";
  else dateStr += " at ";

  dateStr += `${msgDate.getHours() < 10 ? "0" : ""}${msgDate.getHours()}:`;

  dateStr += `${msgDate.getMinutes() < 10 ? "0" : ""}${msgDate.getMinutes()}`;

  return dateStr;
}

function getQuestionTagNames(modelTags, tagIds) {
  console.log(`Model tags: ${modelTags} \n tags: ${tagIds}`)

  const questionTags = [];
  const questionTagIds = tagIds;
  for (let tag of modelTags) {
    for (let questionTagId of questionTagIds) {
      if (questionTagId === tag._id) {
        questionTags.push(tag.name);
      }
    }
  }
  return questionTags;
}

function getLocaleString(isoDateString) {
  const dateObject = new Date(isoDateString);

  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  };

  const formattedDate = dateObject.toLocaleString("en-US", options);
  return formattedDate;
}

export default Posts;

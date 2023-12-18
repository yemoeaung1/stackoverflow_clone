import { AskQuestionButton, AnswerQuestionButton } from "./button_components";
import { constructTextWithHyperlink, sortResults } from "./search_sort";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AnswerPage({ pageData, handlers, user }) {
  // console.log(pageData);
  const [question, setQuestion] = useState(pageData);
  const [answers, setAnswers] = useState([]);
  const [visibleAnswers, setVisibleAnswers] = useState([]);
  const [answerPage, setAnswerPage] = useState(0);
  const [isUpdated, setIsUpdated] = useState(false);
    //questionVote
  const [votes, setVotes] = useState(question.votes);
  // console.log(question);

  const answersPerPage = 5;
  let TotalPages = Math.ceil(answers.length / answersPerPage);
  // console.log("Total Pages: " + TotalPages)

  useEffect(() => {
    const fetchQuestion = async () => {
      const fetchedQuestion = await axios.get(
        `http://localhost:8000/posts/question/${pageData._id}`
      );
      setQuestion(fetchedQuestion);
    };
    if (isUpdated === false) return;

    // setIsUpdated(false);
    fetchQuestion();
  }, []);


  useEffect(() => {
    console.log("in use effect");
    console.log(`Answers:${answers}`)
    let start = answerPage * answersPerPage;
    let end = start + answersPerPage;
    console.log("indices: " + start + " to " + end);

    // Calculate the starting and ending indices based on the current questionPage
    const startIndex = answerPage * answersPerPage;
    const endIndex = startIndex + answersPerPage;

    // Update the visibleQuestions array based on the calculated indices
    const newVisibleAnswers = answers.slice(startIndex, endIndex);

    // Update the state to re-render the component with the new visibleQuestions
    if(isUpdated) {
      setVisibleAnswers(newVisibleAnswers);
    }
    setIsUpdated(false);
  
  }, [isUpdated]);

  //gonna run everytime question object changes
  useEffect(() => {
    const fetchAnswer = async (answers) => {
      console.log("Fetching answers");
      const fetchedAnswers = []
      for (let answerID of answers) {
        try {
          const response = await axios.get(
            `http://localhost:8000/posts/answer/${answerID}`
          );
          fetchedAnswers.push(response.data);
        } catch (err) {
          console.log(err);
        }
      }
      return fetchedAnswers;
    };

    const fetchData = async () => {
      if (question && question.answers) {
        let allAnswers = await fetchAnswer(question.answers);
        allAnswers = sortResults("sortanswer", allAnswers);
        // Once all answers have been fetched, set the visibleAnswers state
        setAnswers(allAnswers);
        setVisibleAnswers(() => allAnswers.slice(0, answersPerPage)); // Assuming setvisibleAnswers is your state setter;
        console.log(visibleAnswers);
      }
    };
    fetchData();
  }, []);

  const clickedNext = (answerPage) => {
    console.log("All Answers: " + answers.length)
    console.log("Before changing page state: " + answerPage);
    if (answerPage + 1 < TotalPages) {
      setAnswerPage(answerPage + 1);
      console.log("After setting state: " + answerPage);
      // setVisibleAnswers(answers.slice(answerPage * 2, answerPage * 4))
    } else {
      setAnswerPage(0);
    }
    setIsUpdated(true);
  };

  const showNextSetOfQuestion = (answerPage) => {
    console.log("current page:" + answerPage);
    clickedNext(answerPage);
    console.log("next page:" + answerPage);
  };

  const showPrevSetOfQuestion = (answerPage) => {
    console.log("current page:" + answerPage);
    clickedPrev(answerPage);
    console.log("prev page:" + answerPage);
  };

  const clickedPrev = (questionPage) => {
    if (questionPage - 1 >= 0) {
      setAnswerPage(questionPage - 1);
    } else {
      setAnswerPage(0);
    }
    setIsUpdated(true);
  };

  const processVote = async (questionID, vote) => {
    try {
      console.log(questionID);
      const response = await axios.get(
        `http://localhost:8000/posts/question/${questionID}/${vote}`,
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.status === 200) {
        setVotes((prevVotes) => prevVotes + 1);
      } else if (response.status === 201) {
        setVotes((prevVotes) => prevVotes - 1);
      }
    } catch (err) {
      console.error(err);
      if (err.response.status === 403) {
        window.alert(err.response.data);
      }
    }
  };

  if (visibleAnswers===undefined || question === undefined) {
    return;
  } else {
  // console.log(JSON.stringify(answers));
  return (
    <>
      <div className="up-content upper-content">
        <div className="first-third-content">
          <VoteCount questionID={question._id} votes={votes} processVote={processVote}/>
          <AnswerCount answers={answers} />
          <ViewCount views={question.views} />
        </div>
        <div className="second-third-content">
          <QuestionTitle title={question.title} />
          <span>
            <div>
              <span className="ans-upper" id="ans-page-description">
                {question.text && constructTextWithHyperlink(question.text)}
              </span>
              <div className="tag-container ans-page-tag-container">
                <QuestionTags tags={question.tags} />
              </div>
            </div>
          </span>
        </div>
        <div className="third-third-content">
          <div className="btn-ctn">
              <AskQuestionButton handlers={handlers} user={user} />
          </div>
          <UserandDateBox question={question} showDateMetadata={showDateMetadata} getLocaleString={getLocaleString}/>   
        </div>
      </div>
      {visibleAnswers && <Answers sorted_answers={visibleAnswers}/>}
      <div style={{ textAlign: "center" }}>
        <span>
          {answerPage > 0 && (
            <button onClick={() => showPrevSetOfQuestion(answerPage)}>
              Prev
            </button>
          )}
          <button onClick={() => showNextSetOfQuestion(answerPage)}>
            Next
          </button>
        </span>
      </div>
      {/* <button
        id="answer-button"
        onClick={handleAskButtonClick}
        sid="answer-button"
      >
        Answer Question
      </button> */}
      <AnswerQuestionButton
        handlers={handlers}
        question={question}
        user={user}
      />
    </>
  )
      {/* <div className="upper-content">
        <div className="top-ans-content">
          <VoteCount questionID={question._id} votes={votes} processVote={processVote}/>
          <AnswerCount answers={answers} />
          <QuestionTitle title={question.title} />
          <span className="ans-upper" id="ans-button-container">
            <div className="btn-ctn">
              <AskQuestionButton handlers={handlers} user={user} />
            </div>
          </span>
        </div>
        <div id="bot-ans-content">
          <ViewCount views={question.views} />
          <span>
            <div>
              <span className="ans-upper" id="ans-page-description">
                {question.text && constructTextWithHyperlink(question.text)}
              </span>
              <div className="tag-container ans-page-tag-container">
                <QuestionTags tags={question.tags} />
              </div>
            </div>
          </span>
          <UserandDateBox question={question} showDateMetadata={showDateMetadata} getLocaleString={getLocaleString}/> 
        </div>
        {/* <Comments
          comments={question.comments}
          parentID={question._id}
          type={"question"}
          setIsUpdated={setIsUpdated}
        /> */}
      // </div>
      // {visibleAnswers && <Answers sorted_answers={visibleAnswers}/>}
      // <div style={{ textAlign: "center" }}>
      //   <span>
      //     {answerPage > 0 && (
      //       <button onClick={() => showPrevSetOfQuestion(answerPage)}>
      //         Prev
      //       </button>
      //     )}
      //     <button onClick={() => showNextSetOfQuestion(answerPage)}>
      //       Next
      //     </button>
      //   </span>
      // </div>
      {/* <button
        id="answer-button"
        onClick={handleAskButtonClick}
        sid="answer-button"
      >
        Answer Question
      </button> */}
      // <AnswerQuestionButton
      //   handlers={handlers}
      //   question={question}
      //   user={user}
      // />
    // </> */}
  // );
  }
}

function Answer({ answer }) {
  const [answerVotes, setAnswerVotes] = useState(answer.votes);

  const vote = async (answerID, vote) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/posts/answer/${answerID}/${vote}`,
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.status === 200) {
        setAnswerVotes((prevVotes) => prevVotes + 1);
        // updateAnswer(answerID, answerVotes + 1);
      } else if (response.status === 201) {
        setAnswerVotes((prevVotes) => prevVotes - 1);
        // updateAnswer(answerID, answerVotes - 1);
      }
    } catch (err) {
      console.error(err);
      if (err.response.status === 403) {
        window.alert(err.response.data);
      }
    }
  };
  // console.log(answer._id);

  let ans_date_time_string = getLocaleString(answer.ans_date_time);
  // console.log(ans_date_time_string);
  return (
    <>
      <div className="answer-container">
        <div className="vote-box">
          <div style={{ textAlign: "center" }}>{answerVotes} votes</div>
          <button onClick={() => vote(answer._id, "1")}>Up</button>
          <button onClick={() => vote(answer._id, "-1")}>Down</button>
        </div>
        <div className="answer-text">
          {" "}
          {answer.text && constructTextWithHyperlink(answer.text)}
        </div>
        <div className="ans-user-and-date">
          <p>
            <span className="user" id="ans-reply-user">
              {answer.ans_by.username}
            </span>
            {showDateMetadata(new Date(ans_date_time_string), " answered")}
          </p>
        </div>
      </div>
      <div>
        <div className="answer-container">Comments</div>
      </div>
    </>
  );
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

function Comments({ comments, parentID, type, setIsUpdated }) {
  const localcomments = comments;
  const [inputs, setInputs] = useState("");

  const validateComment = (inputs) => {
    let text = inputs;

    if (text.trim() === "" || text === undefined) {
      return "Comment can't be empty";
    } else if (text.length > 140) {
      return "Comment is longer than 140 characters";
    }
    return "";
  };

  const postComment = async (newComment, parentID, type) => {
    try {
      await axios.post(
        `http://localhost:8000/posts/question/${parentID}`,
        { comment: newComment },
        { withCredentials: true }
      );
      setIsUpdated(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputs);
    let validComment = validateComment(inputs);
    if (validComment !== "") {
      window.alert(validComment);
    }
    postComment(inputs, parentID);
  };

  // console.log(comments);
  return (
    <>
      {comments.map((comment) => {
        return <Comment key={comment._id} comment={comment} />;
      })}
      <span style={{ display: "flex" }}>
        <form
          id="postAnswer"
          className="postAnswer"
          method="POST"
          style={{ marginRight: "40%" }}
          onSubmit={handleSubmit}
        >
          <input
            onChange={(e) => setInputs(e.target.value)}
            name="comment"
            value={inputs || ""}
            style={{ margin: "2% 40% 2%" }}
            required
          ></input>
          <button type="submit">Comment</button>
        </form>
      </span>
    </>
  );
}

function Comment({ comment }) {
  const [commentVotes, setCommentVotes] = useState(comment.votes);

  const vote = async (commentID, vote) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/posts/comment/${commentID}/${vote}`,
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.status === 200) {
        setCommentVotes((prevVotes) => prevVotes + 1);
      } else if (response.status === 201) {
        setCommentVotes((prevVotes) => prevVotes - 1);
      }
    } catch (err) {
      console.error(err);
      if (err.response.status === 403) {
        window.alert(err.response.data);
      }
    }
  };
  let comment_date_time_string = getLocaleString(comment.comment_date_time);
  // console.log("Comment:" + comment);
  return (
    <>
      <div className="answer-container">
        <div className="vote-box">
          <div style={{ textAlign: "center" }}>{commentVotes} votes</div>
          <button onClick={() => vote(comment._id, "1")}>Up</button>
        </div>
        <div className="answer-text">
          {comment.text && constructTextWithHyperlink(comment.text)}
        </div>
        <div className="ans-user-and-date">
          <p>
            <span className="user" id="ans-reply-user">
              {comment.commented_by.username}
            </span>
            {showDateMetadata(new Date(comment_date_time_string), " commented")}
          </p>
        </div>
      </div>
    </>
  );
}


function VoteCount({questionID, votes, processVote}) {
  return (
    <span>
      <div id="vote-box" className="ans-upper">
        <button onClick={() => processVote(questionID, "1")}>Up</button>
        <div style={{ textAlign: "center" }}>{votes} votes</div>
        <button onClick={() => processVote(questionID, "-1")}>Down</button>
      </div>
    </span>
  )
}

function AnswerCount({answers}) {
  return (
    <span className="ans-stats ans-upper" id="ans-box">
      {answers.length} answer
      {answers.length !== 1 ? "s" : ""}
    </span>
  )
}

function QuestionTitle({title}) {
  return (
    <span className="ans-upper" id="ans-page-title">
      {title}
    </span>
  )
}

function ViewCount({views}) {
  return (
    <span className="ans-stats ans-upper" id="view-box">
      {views} view{views !== 1 ? "s" : ""}
    </span>
  )
}

function QuestionTags({tags}) {
  return (
    <>
      {tags.map((tag) => (
        <div key={tag._id} className="question-tag">{tag.name}</div>
      ))}
    </>
  )
}

function UserandDateBox({question, showDateMetadata,getLocaleString} ) {
  let ask_date_time_string = getLocaleString(question.ask_date_time);
  return (
    <span className="ans-upper" id="user-date-box">
      <p>
        <span className="user">{question.asked_by.username}</span>
        <br />
        {showDateMetadata(new Date(ask_date_time_string), " asked")}
      </p>
    </span>
  )
}

function Answers({sorted_answers}) {
  // console.log(`In answers: ${JSON.stringify(sorted_answers)}`)
  if (sorted_answers === undefined) {
    return <div>No answers found</div>;
  }
  return (
    <div className="answers-overflow">
      {sorted_answers.map((answer) => {
        return <Answer key={answer._id} answer={answer} />;
      })}
    </div>
  )
}
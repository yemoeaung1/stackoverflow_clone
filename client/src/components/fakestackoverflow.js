import { useState, useEffect } from "react";
import axios from "axios";
import Posts from "./posts.js";
import SideBar from "./sidebar.js";
import SiteHeader from "./header.js";
import QuestionHeader from "./questionheader.js";
import PostQuestionForm from "./postquestionform.js";
import AnswerPage from "./answerpage.js";
import { AnswerForm } from "./answerform.js";
import TagPage from "./tags_page.js";
import UserProfile from "./userprofile.js";
import { filterSearch, sortResults } from "./search_sort.js";
import LogOutButton from "./logout.js";

let baseURL = "http://localhost:8000/";

export default function FakeStackOverflow({ logOut, user, welcomePage }) {
  console.log("user state in fakeso:" + JSON.stringify(user))
  const [viewOption, setViewOpt] = useState("questions");
  const [pageData, setPageData] = useState([]);
  const [menuSelector, setMenuSelector] = useState([1, 0]);
  const [questionsArray, setQuestionsArray] = useState([]);
  const [tagsArr, setTagsArr] = useState([]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:8000/questions", {
        withCredentials: true,
      });
      setQuestionsArray(res.data);
      setPageData(["All Questions", ...res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get("http://localhost:8000/tags");
      setTagsArr(res.data);
      console.log("tags:" + tagsArr)
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    console.log("Starting useEffect()");
    fetchQuestions();
    fetchTags();
  }, []);

  // console.log(questionsArr);
  // console.log(pageData);
  // console.log(tagsArr);

  // return (
  //   <div id="main" className="main">
  //     <Sidebar menuSelector = {menuSelector} handlers={handlers} modelQuestions ={questionsArr}></Sidebar>
  //     <div className="content">
  //       <Posts questions={questionsArr}></Posts>
  //     </div>
  //   </div>
  // );

  // const updateQuestionsArr = async (newQuestion) => {
  //   setQuestionsArray((prevQuestionsArr) => [...prevQuestionsArr, newQuestion]);
  //   changePage("questions", ["All questions", ...questionsArray]);
  // };

  const changePage = (viewOption, pageData) => {
    // console.log("Call to changePage");
    // console.log(viewOption);
    // console.log(pageData);

    let urlPath = "";
    if (viewOption.toLowerCase() === "answers")
      urlPath = `/posts/question/${pageData[0]}`;
    else if (viewOption.toLowerCase() === "answerform")
      urlPath = `/posts/question/${pageData[0]}/answerform`;
    else if (viewOption.toLowerCase() === "answer")
      urlPath = `/posts/answers/${pageData[0]}`;
    else if(viewOption.toLowerCase() === "userprofile")
      urlPath = `/user`;
    else urlPath = `/${viewOption}`;

    // console.log(urlPath);
    if (
      viewOption.toLowerCase() !== "answerform" &&
      viewOption.toLowerCase() !== "questionform"
    ) {
      if (viewOption.toLowerCase() === "questions" || viewOption.toLowerCase() === 'tags') {
        fetchQuestions();
        fetchTags();
      }
      axios
        .get(`http://localhost:8000${urlPath}`, {withCredentials: true})
        .then((res) => {
          setViewOpt(viewOption);
          if (viewOption === "answers" || viewOption === "answer") {
            pageData = res.data;
            setPageData(pageData);
          } else if(viewOption === "userprofile") {
            if(pageData === undefined || pageData === null || pageData.length === 0){
              setPageData([0, res.data])
            }
            else{
              setPageData([1, pageData]);
            }
          } else {
            
            // console.log(`In axios:${pageData}`);
            setPageData(pageData);
            // console.log("AXIOS:" + pageData);
          }
          // pageData = res.data;
          // setPageData(pageData);
          // pageData = res.data;
          // setPageData(res.data);

          if (viewOption.toLowerCase() === "questions") {
            setMenuSelector([1, 0]);
          } else if (viewOption.toLowerCase() === "tags") {
            setMenuSelector([0, 1]);
          } else setMenuSelector([0, 0]);
        })
        .catch((err) => {
          console.log("[Error Changing Pages] " + err);
        });
    } else {
      setViewOpt(viewOption);
      setPageData(pageData);
      setMenuSelector([0, 0]);
      // console.log("after setting");
      // console.log(pageData);
      // console.log(viewOption);
    }
  };

  // old changePage

  // const changePage = async (viewOption, pageData) => {
  //   console.log("Call to changePage");

  //   setViewOpt(viewOption);
  //   setPageData(pageData);
  //   console.log(pageData);
  //   if (viewOption.toLowerCase() === "questions") setMenuSelector([1, 0]);
  //   else if (viewOption.toLowerCase() === "tags") setMenuSelector([0, 1]);
  //   else setMenuSelector([0, 0]);
  // };

  const handleSearching = (e) => {
    let searchEvent = filterSearch(e, tagsArr, questionsArray);

    if (searchEvent !== undefined) {
      searchEvent = sortResults("newest", searchEvent);
      changePage("questions", ["Search Results", ...searchEvent]);
      console.log(searchEvent);
    }
  };

  const handlers = [changePage, handleSearching, /*updateQuestionsArr*/];
  // const handlers = [changePage];

  // Change the option in ContentView to fit your testing needs
  // console.log("All Questions:" + questionsArray);
  // for (let question of questionsArray) {
  //   console.log(question);
  // }
  return (
    <>
      <SiteHeader welcomePage={welcomePage} handlers={handlers} user={user} allowSearch={true} />
      <div id="main" className="main">
        <SideBar
          menuSelector={menuSelector}
          handlers={handlers}
          modelQuestions={questionsArray}
          logOut = {logOut}
          user = {user}
        />
        <div className="content">
          <ContentView
            option={viewOption}
            pageData={pageData}
            modelQuestions={questionsArray}
            modelTags={tagsArr}
            handlers={handlers}
            user = {user}
          />
        </div>
      </div>
    </>
  );
}

function ContentView(props) {
  const [submissionError, setSubmissionError] = useState(null);
  // console.log("in content view");
  // console.log(props.option);
  // console.log(props.pageData);
  // console.log(props.modelQuestions);

  //NOTE TIED UP HERE //
  let option = props.option.toLowerCase();
  switch (option) {
    case "questions":
      let title = props.pageData[0];
      let questionsArr;
      if (
        title === "All Questions" ||
        (props.pageData.length === 2 &&
          (props.pageData[1] === "default" || props.pageData[1] === "newest"))
      ) {
        questionsArr = sortResults("newest", props.modelQuestions);
      } else if (
        props.pageData.length === 2 &&
        props.pageData[1] === "active"
      ) {
        questionsArr = sortResults("active", props.modelQuestions);
      } else if (
        props.pageData.length === 2 &&
        props.pageData[1] === "unanswered"
      ) {
        questionsArr = sortResults("unanswered", props.modelQuestions);
      } else {
        [title, ...questionsArr] = props.pageData;
      }
      console.log("Questions being passed into Posts:");
      
      return (
        <>
          <QuestionHeader
            title={title}
            questions={questionsArr}
            handlers={props.handlers}
            user = {props.user}
          />
          <Posts
            modelTags={props.modelTags}
            questions={questionsArr}
            handlers={props.handlers}
          />
        </>
      );
    case "questionform":
      console.log("In question form:" + props.pageData);
      const addQuestion = async (newQuestion) => {
        const newQuestionWithUser = {
          ...newQuestion,
          userEmail: props.user.email,
        };
        try {
          await axios.post(baseURL + "questionform", {
            question: newQuestionWithUser,
          });
          // await props.handlers[2](newQuestion);
          props.handlers[0]("questions", ["All questions", "default"]);
        } catch (err) {
          console.log("[Error adding question]: ", err);
          if(err.response.status === 404) {
            setSubmissionError(err.response.data.msg)
          }
        }
      };

      return (
        <PostQuestionForm
          pageData={props.pageData}
          handlers={props.handlers}
          onSubmit={addQuestion}
          submissionError={submissionError}
        />
      );
    case "answers": // only need clicked question and a way to addAnswer
      // console.log(`Before answer page: ${props.pageData}`);
      return (
        // <h1>Answer here</h1>
        <AnswerPage
          pageData={props.pageData}
          handlers={props.handlers}
          user = {props.user}
          
        ></AnswerPage>
      );
    case "answerform":
      // console.log("before form");
      // console.log(props.pageData);
      const addAnswer = async (newAnswer, question) => {
        // console.log(newAnswer);
        try {
          await axios.post(
            baseURL + `posts/question/${question._id}/answerform`,
            {answer: newAnswer},
            {withCredentials: true},
          );
          props.handlers[0]("answers", [question._id]);
        } catch (error) {
          console.log("Error adding answer: ", error);
        }
      };

      return (
        <AnswerForm
          pageData={props.pageData}
          model={props.modelData}
          onSubmit={addAnswer}
        />
      );
    case "tags":
      return (
        <TagPage
          user={props.user}
          userData={props.pageData}
          modelQuestions={props.modelQuestions}
          modelTags={props.modelTags}
          handlers={props.handlers}
        />
      );
    case "userprofile":
      return (
       <UserProfile pageData={props.pageData} handlers={props.handlers} />
      );

    default:
      console.log("Invalid option parameter passed to ContentView");
      return;
  }
}


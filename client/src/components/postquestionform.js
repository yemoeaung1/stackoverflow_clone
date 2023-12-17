import { useState, useEffect } from "react";
import { constructTextWithHyperlink } from "./search_sort";
import axios from "axios";
export default function PostQuestionForm({ onSubmit, submissionError, pageData }) {
  console.log(JSON.stringify(pageData));
  const localPageData = pageData[0];
  // console.log(localPageData.title);
    // console.log(model.getQuestions());
  const [inputs, setInputs] = useState("");
  const [errors, setErrors] = useState({
    title: "",
    summary:"",
    text: "",
    tags: "",
  });
  

  const changeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    const title = inputs.title;
    const summary = inputs.summary;
    const text = inputs.text;
    const tags = inputs.tags;
    let isValid = true;


    console.log(inputs);

    /* check title */
    let validTitle = checkTitle(title);
    if (validTitle !== title) {
      isValid = false;
      newErrors.title = validTitle;
    } else {
      newErrors.title = "";
    }
    /* check summary */
    let validSum = checkSummary(summary);
    if (validSum !== summary) {
      isValid = false;
      newErrors.summary = validSum;
    } else {
      newErrors.summary = "";
    }

    /*check text */
    if (text.trim() === "") {
      isValid = false;
      newErrors.text = "Text field is empty. Try again.";
    } else if (constructTextWithHyperlink(text) === undefined) {
      isValid = false;
      newErrors.text = "Hyperlink format is wrong. It is missing \"http://\" or \"https://\" inside ().  Try again.";
    } else {
      newErrors.text = "";
    }
    //check tags
    const validTags = checkTags(tags);
    if (!Array.isArray(validTags)) {
      isValid = false;
      newErrors.tags = validTags;
    } else {
      newErrors.tags = "";
    }

    setErrors(newErrors);
    //console.log(isValid);
    return isValid;
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("all good");
      console.log(
        `Title: ${inputs.title}\nText: ${inputs.text}\nTags:${inputs.tags}\nuser:${inputs.user}`
      );

      const validTags = checkTags(inputs.tags);
      // console.log(validTags);

      const newQuestion = makeNewQuestion(
        inputs.title,
        inputs.summary,
        inputs.text,
        validTags,
        // model
        // modelQuestions
      );
      console.log(newQuestion);
      onSubmit(newQuestion);
    }
  };
  return (
    <div className="question-form-container">
    <form id="postQuestion" className="postQuestion" onSubmit={handleSubmit} method="POST">
      <p style={{ fontSize: 20 }}>Question Title*</p>
      <p className="hint">Limit title to 50 characters or less</p>
      <input
        id="title"
        name="title"
        value={inputs.title || ""}
        onChange={changeHandler}
        required
      />
      <p id="titleError" className="errorMsg">
        {errors.title}
      </p>

      <p style={{ fontSize: 20 }}>Question Summary*</p>
      <p className="hint">Limit title to 140 characters or less</p>
      <input
        id="summary"
        name="summary"
        value={inputs.summary || ""}
        onChange={changeHandler}
        required
      />
      <p id="summaryError" className="errorMsg">
        {errors.summary}
      </p>

      <p style={{ fontSize: 20 }}>Question Text *</p>
      <p className="hint">Add details</p>
      <textarea
        id="text"
        name="text"
        value={inputs.text || ""}
        onChange={changeHandler}
        required
      ></textarea>
      <p id="textError" className="errorMsg">
        {" "}
        {errors.text}
      </p>

      <p style={{ fontSize: 20 }}>Tags *</p>
      <p className="hint">Add keywords separated by whitespace</p>
      <input
        id="tags"
        name="tags"
        value={inputs.tags || ""}  // need to only get tag names and gotta have it a string instead of array
        onChange={changeHandler}
        required
      />
      <p id="tagError" className="errorMsg">
        {" "}
        {errors.tags}
      </p>

      <div className="bottom-post">
        <button type="submit">Post Question</button>
        <span>* indicates mandatory fields</span>
      </div>
    </form>
    <div style={{ color: "red", textAlign: "center" }}>
              {submissionError}
    </div>
    </div>
  );
}

//make prefilled tags
async function getPrefilledTags(tagsarr,qID) {
  try {
    const tagPromises = tagsarr.map(async (tagID) => {
      const response = await axios.get(`http://localhost:8000/posts/question/${qID}/tags/${tagID}`, {withCredentials:true});
      return response.data; // Assuming the tag information is in the response data
    });

    const tags = await Promise.all(tagPromises);

    const tagsString = tags.join(", "); // Adjust as needed

    console.log(tagsString);
    return tagsString;
  } catch (error) {
    console.error(error);
    // Handle error
  }
}
//check valid title
function checkTitle(title) {
  //console.log(title.value);

  //check for whitespace and blank inputs
  if (title.replace(/\s+/g, "").length === 0) {
    return "Title is empty. Try again";
  }
  if (title.length > 50) {
    return "Title is longer than 100 characters. Try again.";
  }
  return title;
}

function checkSummary(summary) {
  if (summary.replace(/\s+/g, "").length === 0) {
    return "Title is empty. Try again";
  }
  if (summary.length > 140) {
    return "Title is longer than 140 characters. Try again.";
  }
  return summary;
}

//check valid tag
function checkTags(tags) {
  // console.log(tags.value);

  //remove whitespaces and gets rid of empty strings
  let tagsArray = tags.split(/\s+/).filter(Boolean);


  tagsArray.forEach(function (value, index) {
    tagsArray[index] = value.toLowerCase();
  });


  tagsArray = tagsArray.filter(function (value, index) {
    if (tagsArray.indexOf(value) === index) return true;
    return false;
  });

  //check for whitespace and blank inputs
  if (tags.replace(/\s+/g, "").length === 0) {
    return "Tags field is empty. Try again";

    //check how many tags there are
  } else if (tagsArray.length > 5) {
    return "Limit of 5 tags reached";
  }
  //check each tag's length
  for (let i = 0; i < tagsArray.length; i++) {
    if (tagsArray[i].length > 10) {
      return "Tag too long";
    }
  }
  console.log(tagsArray);
  return tagsArray;
}

function makeNewQuestion(title, summary, text, tags, qID) {
  const newQuestion = {
    title: title,
    summary: summary,
    text: text,
    askDate: new Date(),
    views: 0,
    tags: tags,
    ansIds: [],
    questionID: qID ? qID : undefined
  };
  return newQuestion;
}

// //might be able to be done better
// function addTags(model, tags) {
//   console.log("adding tags now");

//   console.log(tags);
//   tags.forEach(function (value, index) {
//     tags[index] = value.toLowerCase();
//   });

//   tags = tags.filter(function (value, index) {
//     console.log(value + ": " + index + " | " + tags.indexOf(value));
//     if (tags.indexOf(value) === index) return true;
//     return false;
//   });

//   const modelTags = model.getTags();
//   const tagIds = [];

//   for (let modelTag of modelTags) {
//     for (let index in tags) {
//       if (tags[index].toLowerCase() === modelTag.name.toLowerCase()) {
//         tagIds.push(modelTag.tid);
//         tags.splice(index, 1);
//       }
//     }
//   }
//   let remainingNewTags = tags;
//   for (let tag of remainingNewTags) {
//     let newTag = model.addTag(tag);
//     tagIds.push(newTag.tid);
//   }
//   // console.log(tagIds);
//   return tagIds;
// }

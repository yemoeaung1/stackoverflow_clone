import { useState } from "react";
import { constructTextWithHyperlink } from "./search_sort";
export function AnswerForm({ pageData, model, onSubmit, submissionError }) {
  console.log("In answer form: " + JSON.stringify(pageData[0]));
  const [inputs, setInputs] = useState("");
  const [errors, setErrors] = useState({
    text: "",
  });

  const changeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    const text = inputs.text;
    let isValid = true;

    if (text.trim() === "") {
      isValid = false;
      newErrors.text = "Text field is empty. Try again.";
    } else if (constructTextWithHyperlink(text) === undefined) {
      isValid = false;
      newErrors.text =
        'Hyperlink format is wrong. It is missing "http://" or "https://" inside ().  Try again.';
    } else {
      newErrors.text = "";
    }

    setErrors(newErrors);
    //console.log(isValid);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("all good");
      console.log(`Text: ${inputs.text}\n User:${inputs.user}`);
      const newAnswer = makeNewAnswer(inputs.text);
      console.log(newAnswer);
      console.log(pageData[0]);
      onSubmit(newAnswer, pageData[0]);
    }
  };

  return (
    <div className="answer-form-container">
      <form
        id="postAnswer"
        className="postAnswer"
        method="POST"
        onSubmit={handleSubmit}
      >

        <p style={{ fontSize: 20 }}>Answer Text *</p>
        <p style={{ fontStyle: "italic" }}></p>
        <textarea
          id="text"
          name="text"
          value={inputs.text || ""}
          onChange={changeHandler}
          required=""
        ></textarea>
        <p id="textError" className="errorMsg">
          {errors.text}
        </p>

        <div className="bottom-post">
          <button type="submit">Post Answer</button>
          <span>* indicates mandatory fields</span>
        </div>
      </form>
      <div style={{ color: "red", textAlign: "center" }}>
              {submissionError}
    </div>
    </div>
  );
}

function makeNewAnswer(text) {
  const newAnswer = {
    text: text,
    ans_date_time: new Date()
  };
  return newAnswer;
}

/*The user enters an unregistered email or an
incorrect password then the application should
report back appropriate feedback to the user on the
same page.
*/
import { useState } from "react";
import SiteHeader from "./header";

export default function LogInPage({ onSubmit, submissionError, welcomePage }) {
  const [inputs, setInputs] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const currentUser = {
      email: inputs.email,
      password: inputs.password,
    };
    // console.log(newQuestion);
    onSubmit(currentUser);
  };

  return (
    <>
      <SiteHeader welcomePage={welcomePage}></SiteHeader>
      <div style={{"height": "100px"}}></div>
      <div className="Title" style={{ textAlign: "center" }}>
        <h2> Log In </h2>
      </div>
      <div className="question-form-container">
        <form
          id="postQuestion"
          className="postQuestion"
          onSubmit={handleSubmit}
          method="POST"
        >
          <p style={{ fontSize: 20 }}>Email *</p>
          {/* <p className="hint">Limit title to 100 characters or less</p> */}
          <input
            id="email"
            name="email"
            value={inputs.email || ""}
            onChange={changeHandler}
            required
          />
          <p id="emailError" className="errorMsg">
            {errors.email}
          </p>

          <p style={{ fontSize: 20 }}>Password *</p>
          {/* <p className="hint">Add keywords separated by whitespace</p> */}
          <input
            id="password"
            name="password"
            value={inputs.password || ""}
            onChange={changeHandler}
            required
          />
          <p id="pwError" className="errorMsg">
            {" "}
            {errors.password}
          </p>

          <div className="bottom-post">
            <button type="submit">Log In</button>
            <span>* indicates mandatory fields</span>
          </div>
        </form>
      </div>
      <div style={{ color: "red", textAlign: "center" }}>
        {" "}
        {submissionError}{" "}
      </div>
    </>
  );
}

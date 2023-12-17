import { useState } from "react";
import SiteHeader from "./header";

export default function RegisterForm({ onSubmit, submissionError, welcomePage }) {
  const [inputs, setInputs] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    retypedpassword: "",
  });

  const changeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    const email = inputs.email;
    const username = inputs.username;
    const password = inputs.password;
    const retypedpassword = inputs.retypedpassword;
    let isValid = true;

    /* check email validity
     - check format
     - no two users can't have same email(check serverside)

    */
    if (!isValidEmail(email)) {
      isValid = false;
      newErrors.email = "Incorrect email format";
    } else {
      newErrors.email = "";
    }

    /* check username 
        - just whitespace
    */
    if (username.trim() === "") {
      isValid = false;
      newErrors.username = "Username can't be empty";
    } else {
      newErrors.username = "";
    }

    /* check password
        - can't contain username
        - can't contain email id(part of email before the @)
        - check if retyped is the same 
    */
    let verdict = isValidPassword(password, retypedpassword, username, email);
    console.log(verdict);
    console.log(`Password:${password} Retyped:${retypedpassword}`);
    // bad password
    if (verdict === -1) {
      isValid = false;
      newErrors.password = "Bad password";
      newErrors.retypedpassword = "";
      // passwords don't match
    } else if (verdict === 0) {
      isValid = false;
      newErrors.retypedpassword = "Passwords don't match";
      newErrors.password = "Passwords don't match";
      // good
    } else {
      newErrors.password = "";
      newErrors.retypedpassword = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log(
        `Submitted Form\nEmail: ${inputs.email}\nUsername: ${inputs.username}\nPassword:${inputs.password}\n`
      );

      const newUser = makeNewUser(
        inputs.email,
        inputs.username,
        inputs.password
      );
      // console.log(newQuestion);
      onSubmit(newUser);
    }
  };
  return (
    <>
      <SiteHeader welcomePage={welcomePage}></SiteHeader>
      <div style={{"height": "100px"}}></div>
      <div className="question-form-container">
        <form
          id="postQuestion"
          className="postQuestion"
          onSubmit={handleSubmit}
          method="POST"
        >
          <p style={{ fontSize: 20 }}>Email</p>
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

          <p style={{ fontSize: 20 }}>Username</p>
          {/* <p className="hint">Add details</p> */}
          <input
            id="username"
            name="username"
            value={inputs.username || ""}
            onChange={changeHandler}
            required
          ></input>
          <p id="userError" className="errorMsg">
            {" "}
            {errors.username}
          </p>

          <p style={{ fontSize: 20 }}>Password</p>
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

          <p style={{ fontSize: 20 }}>Retype password</p>
          {/* <p className="hint"></p> */}
          <input
            id="retypepw"
            name="retypedpassword"
            value={inputs.retypedpassword || ""}
            onChange={changeHandler}
            required
          />
          <p id="retypedpwError" className="errorMsg">
            {" "}
            {errors.retypedpassword}
          </p>

          <div className="bottom-post">
            <button type="submit">Register</button>
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

// check for before @ and dot
function isValidEmail(email) {
  // Regular expression for a simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Test the email against the regex pattern
  return emailRegex.test(email);
}

/* check password
        - can't contain username
        - can't contain email id(part of email before the @)
        - check if retyped is the same 
*/
function isValidPassword(password, retypedpassword, username, email) {
  let emailID = email.substring(0, email.indexOf("@"));
  if (password.includes(username) || password.includes(emailID)) {
    return -1;
  }
  if (password !== retypedpassword) {
    return 0;
  }
  return 1;
}

function makeNewUser(email, username, password) {
  const newUser = {
    email: email,
    username: username,
    password: password,
  };
  return newUser;
}

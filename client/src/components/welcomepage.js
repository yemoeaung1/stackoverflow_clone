/*
Welcome page has
  - register as new user
  - log in as exisiting user
  - continuse as guest user 
*/

//components
import SiteHeader from "./header";

//packages

export default function WelcomePage(props) {
  return (
    <>
      <SiteHeader></SiteHeader>{" "}
      <div className="welcome">
        <RegisterUser changePage={props.changePage}></RegisterUser>
        <LogInUser changePage={props.changePage}></LogInUser>
        <AsGuestUser getUser={props.getUser}></AsGuestUser>{" "}
      </div>{" "}
    </>
  );
  // const [viewPage, setViewPage] = useState("register");
  // const [showHomePage, setShowHomePage] = useState(false);
  // const [accessLevel, setAccessLevel] = useState("");
  // const [submissionError, setSubmissionError] = useState("");
  // //make a user state maybe

  // const verifyuser = () => {
  //   goToHomepage();
  // };

  // // this will be where we decide who the user is and what access they have
  // const goToHomepage = () => {
  //   console.log("clicked on guest button");
  //   switch (accessLevel) {
  //     case "admin":
  //       setAccessLevel("admin");
  //       break;
  //     case "authenticated":
  //       setAccessLevel("authenticated");
  //       break;
  //     default:
  //       setAccessLevel("guest");
  //       break;
  //   }
  //   console.log("access-level:" + accessLevel);
  //   setViewPage("guest");
  // };
}

function AsGuestUser({ getUser }) {
  return (
    <div>
      <button
        onClick={() => getUser({ email: "guest", cansignOut: false })}
        id="welcome-button"
      >
        Continue as Guest
      </button>
    </div>
  );
}

function RegisterUser({ changePage }) {
  return (
    <div>
      <button onClick={() => changePage("register")} id="welcome-button">
        {" "}
        Register{" "}
      </button>
    </div>
  );
}

function LogInUser({ changePage }) {
  return (
    <div>
      <button onClick={() => changePage("login")} id="welcome-button">
        Log In{" "}
      </button>
    </div>
  );
}

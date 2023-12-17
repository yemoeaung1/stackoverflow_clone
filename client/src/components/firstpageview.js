//react stuff
import { useEffect, useState } from "react";

//components
import FakeStackOverflow from "./fakestackoverflow";
import RegisterForm from "./registerform";
import LogInPage from "./loginpage";
import WelcomePage from "./welcomepage";

//libraries
import axios from "axios";

/* make a function similar to changePage and content view in fake stackoverflow */
export default function FirstPageView() {
  let baseURL = "http://localhost:8000/";

  //states
  const [viewPage, setViewPage] = useState("welcome");
  const [user, setUser] = useState({ email: "" }, { cansignOut: false });

  //state for form
  const [submissionError, setSubmissionError] = useState("");

  //changing views between register, login, and welcome page
  const changePage = (page) => {
    setViewPage(page);
  };

  //change user state
  const resetUserStateandLogOut = (user) => {
    setUser({});
    changePage("welcome")
  }

    //determine who's logging in and redirect to home
    const setUserStateandLogIn = (currentUser) => {
      setUser(prevUser =>({...prevUser, email: currentUser.email}));
      setUser(prevUser =>({...prevUser, cansignOut: currentUser.cansignOut}));
      changePage("home");
    };
  

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get(baseURL + "user", {
          withCredentials: true,
        });
        console.log("user is authenticated: ", response.data);
        setUserStateandLogIn({ email: response.data.AuthenticatedUser.email, cansignOut: true });
        // setViewPage("home");
      } catch (error) {
        console.log("user is not authenticated", error.response.data);
      }
    };

    checkAuthentication();
  }, []);


  //registering new user to database
  const addNewUser = async (newUser) => {
    console.log(JSON.stringify(newUser));
    console.log("added");
    try {
      const response = await axios.post(baseURL + "register", newUser, {
        withCredentials: true,
      });
      //   console.log(response.data);
      changePage("login");
    } catch (err) {
      console.log("[Error registering]: ", err);
      if (err.response.status === 403) {
        setSubmissionError(err.response.data.msg);
      } else {
        setSubmissionError("Registration failed. Try again later.");
      }
    }
  };

  /* log out */
  const logOut = async (user) => {
    if (user.cansignOut && user.username !== "guest") {
      try {
        const response = await axios.delete(baseURL + "logout", {
          withCredentials: true,
        });
        console.log("Logging out message: " + response.data);
        if(response.status === 200)
            resetUserStateandLogOut(user);
      } catch (err) {
        console.log("[Error logging out]: ", err);
      }
    } else {
      console.log("User is not signed in");
    }
  };

  //   const getUserProfile = async () => {
  //     try {
  //       const response = await axios.get(baseURL + "userprofile", {
  //         withCredentials: true,
  //       });
  //       return <div>{response.data}</div>;
  //       //   console.log(response.data);
  //     } catch (err) {
  //       console.log("[Error registering]: ", err);
  //       if (err.response.status === 403) {
  //         setSubmissionError(err.response.data.msg);
  //       } else {
  //         setSubmissionError("Registration failed. Try again later.");
  //       }
  //     }
  //   };

  //verify user
  const verifyUser = async (currentUser) => {
    console.log(JSON.stringify(currentUser));
    console.log("Verifying");

    try {
      await axios.post(baseURL + "login", currentUser, {
        withCredentials: true,
      });
      const signedUser = { email: currentUser.email, cansignOut: "true" };
      setUserStateandLogIn(signedUser);
    } catch (err) {
      const status = err.response.status;
      console.log("[Error loggin in]: ", err);
      if (status === 403) {
        setSubmissionError("Incorrect email or password. Try again.");
      } else {
        setSubmissionError(`Logging in failed. Try again later.`);
      }
    }
  };

  //can pass a prop like access along to fakestackoverflow
  console.log(viewPage);
  switch (viewPage) {
    case "welcome":
      return (
        // <>
        //   <SiteHeader></SiteHeader>
        //   <div className="welcome">
        //     <RegisterUser></RegisterUser>
        //     <LogInUser></LogInUser>
        //     <AsGuestUser></AsGuestUser>
        //   </div>
        // </>
        <WelcomePage
          changePage={changePage}
          getUser={setUserStateandLogIn}
          registerUser={addNewUser}
        />
      );
    case "register":
      return (
        <RegisterForm welcomePage={() => {changePage("welcome")}} onSubmit={addNewUser} submissionError={submissionError} />
      );
    case "home":
      return <FakeStackOverflow welcomePage={() => {changePage("welcome")}} logOut={logOut} user={user} />;
    case "login":
      return (
        <LogInPage welcomePage={() => {changePage("welcome")}} onSubmit={verifyUser} submissionError={submissionError} />
      );
    // case "profile":
    //   return <UserProfile getUserProfile={getUserProfile} />;
    default:
      return "Nothing to show";
  }
}

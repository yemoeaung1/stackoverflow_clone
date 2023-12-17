import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { sortResults } from "./search_sort";

function UserProfile(props) {
  const [retrievedUser, setRetrievedUser] = useState();

  let userEmail = undefined;

  if(props.pageData !== undefined && props.pageData.length === 2){
    if(props.pageData[0] !== undefined && props.pageData[1] !== undefined){
        if(props.pageData[0] === 1)
            userEmail = props.pageData[1];
        else if (props.pageData[0] === 0 && props.pageData[1].AuthenticatedUser !== undefined)
            userEmail = props.pageData[1].AuthenticatedUser.email;
    }
  }

  useEffect(() => {
    async function fetchUserData() {
      if (userEmail === undefined) return;

      try{
        const res = await axios.get(`http://localhost:8000/user/${userEmail}`);
        console.log("USER: " + JSON.stringify(res.data));

        setRetrievedUser(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchUserData();
  }, [userEmail]);

  useEffect(() => {}, [retrievedUser]);

  // RETURN A LOADING TEMPLATE
  if (retrievedUser === undefined) return;

  let mainContent = (<QuestionsAskedList userData={[retrievedUser.username, userEmail]} handlers={props.handlers} />);
  if(retrievedUser.isAdmin)
    mainContent = (<UserList user={retrievedUser} handlers={props.handlers} />);

  return (
    <>
      <UserProfileStats userData={retrievedUser} />
      <UserProfileMenu userData={[retrievedUser.username, userEmail]} handlers={props.handlers} />
      {mainContent}
    </>
  );
}

function UserProfileStats(props) {
  // REQUIRES A TIME FIELD FOR USER
    console.log("DATE NOW: " + new Date(Date.now()).toString());
    console.log("REG DATE: " + props.userData.registerDate);

  return (
    <div className="userpf-stats">
      <div className="userpf-name">{props.userData.username}'s Profile</div>
      <div className="userpf-time">
        ⏲ Member For: {convertTime(props.userData.registerDate)}
      </div>
      <div className="userpf-rep">
        🍀 Reputation: {props.userData.reputation}
      </div>
    </div>
  );
}

function UserProfileMenu(props) {
    const handleViewTags = () => {
        props.handlers[0]("tags", [props.userData[0], props.userData[1]])
    }

    const handleViewQuestions = () => {

    }

    return (
        <div className="btn-ctn">
            <div className="btn-ctn" style={{ width: "50%", float: "left" }}>
                <button className="userpf-btn" id="userpf-tags" onClick={handleViewTags}>
                    Tags Created
                </button>
            </div>
            <div className="btn-ctn" style={{ width: "50%", float: "right" }}>
                <button className="userpf-btn" id="userpf-questions" onClick={handleViewQuestions}>
                    Questions Answered
                </button>
            </div>
        </div>
    );
}

function QuestionsAskedList(props) {
    const [qArr, setQuestionsArray] = useState([]);
    const [updateStatus, setUpdateStatus] = useState(false);

    useEffect(() => {
        async function fetchUserQuestions(){
            if(updateStatus === true)
                setUpdateStatus(false);

            if(props.userData === undefined || props.userData.length !== 2)
                return;

            if(props.userData[0] !== "" && props.userData[1] !== ""){
                try{
                const res = await axios.get(`http://localhost:8000/user/${props.userData[1]}/questions`);
                setQuestionsArray(sortResults("newest", res.data));
                } catch (err) {
                    console.log(err);
                }
            }
        }
        fetchUserQuestions();
    }, [updateStatus]);

    useEffect(() => {
    }, [qArr]);

    if(qArr === undefined || qArr.length === 0){
        const myStyle = {
            color: "gray",
            fontSize: 40,
            textAlign: "center",
            marginTop: "15%",
        };
        return <h2 style={myStyle}>No Questions Asked</h2>;
    }
    
    const finalList = [];

    for (let i = 0; i < qArr.length; i++){
        let question = qArr[i];
        finalList.push( <QuestionAsked key={qArr[i]._id} question={question} update={setUpdateStatus} handlers={props.handlers} /> );
    }

    return (
        <>
            <div style={{ borderBottom: "3px dotted black", marginTop: "32px" }}></div>
            {finalList}
        </>
    );
}

function QuestionAsked(props){
    let askDate = new Date(props.question.ask_date_time);

    const handleEdit = () => {
        console.log("Edit Question Success");
        props.handlers[0]("questionform",[props.question])
    }

    const handleDelete = () => {
        let confirmDel = window.confirm(`Are you sure you want to delete this question?`);
        if(confirmDel){
            axios.post(`http://localhost:8000/delete/question/${props.question._id}`)
            .then(() => {
                props.update(true);
            })
            .catch((err) => {
                console.log(err);
            });
        }
    }

    return (
        <>
            <div className="userpf-content-ctn">
                <div className="userpf-edit-delete-btn-ctn">
                    <button className="userpf-edit-delete-btn userpf-edit-btn" onClick={handleEdit}>
                        Edit ✏️
                    </button>
                    <button className="userpf-edit-delete-btn  userpf-delete-btn" onClick={handleDelete}>
                        Delete ❌
                    </button>
                </div>
                <div className="userpf-content-title">
                    <div style={{cursor:'pointer', width:"fit-content"}} onClick={() => {props.handlers[0]("answers", [props.question._id])}}>
                        {props.question.title}
                    </div>
                </div>
                <div className="userpf-content-info">
                    Posted On:<br/>
                    {askDate.toLocaleString('default', { month: 'long' })} {askDate.getDate()}, {askDate.getFullYear()}
                </div>
            </div>
            
            <div style={{ borderBottom: "3px dotted black" }}></div>
        </>
    );
}

function UserList(props){
    /*
    FOR ADMIN CASE 
    Users = Link -> Brings them to the corresponding user profile -> Change the pageData for UserProfile (pageData.AuthenticatedUser.email)
    Next to User Link -> Delete Button

    ADMIN = email means can't delete
    Also cannot delete yourself
    */

    const [userArr, setUsersArray] = useState([]);
    const [updateStatus, setUpdateStatus] = useState(true);

    useEffect(() => {
        async function fetchUsers(){
            if(updateStatus === false)
                return;

            setUpdateStatus(false);
            try{
                const res = await axios.get(`http://localhost:8000/users`);
                setUsersArray(res.data);
            } catch (err) {
                console.log(err);
            }
        }
        fetchUsers();
    }, [updateStatus]);
    
    const finalList = [];

    for (let i = 0; i < userArr.length; i++){
        let user = userArr[i];
        finalList.push( <UserComponent key={userArr[i]._id} user={user} update={setUpdateStatus} handlers={props.handlers} /> );
    }

    return (
        <>
            <div style={{ borderBottom: "3px dotted black", marginTop: "32px" }}></div>
            {finalList}
        </>
    );
}

function UserComponent (props) {
    let regDate = new Date(props.user.registerDate);

    const handleDelete = () => {
        if(props.user.email === "ADMIN")
            return;

        let confirmDel = window.confirm(`Are you sure you want to delete this user?`);
        if(confirmDel){
            axios.post(`http://localhost:8000/delete/user/${props.user._id}`)
            .then(() => {
                props.update(true);
            })
            .catch((err) => {
                console.log(err);
            });
        }
    }

    let buttonClass = "userpf-delete-user";
    if(props.user.email === "ADMIN")
        buttonClass = "userpf-delete-user inactive-btn";

    return (
        <>
            <div className="userpf-content-ctn">
                <div className="userpf-delete-user-ctn">
                    <button className={buttonClass} onClick={handleDelete}>
                        Delete ❌
                    </button>
                </div>
                <div className="userpf-content-title">
                    <div style={{cursor:'pointer', width:"fit-content"}} onClick={() => {props.handlers[0]("userprofile", props.user.email)}}>
                        {props.user.username}
                    </div>
                </div>
                <div className="userpf-content-info">
                    Registered On:<br/>
                    {regDate.toLocaleString('default', { month: 'long' })} {regDate.getDate()}, {regDate.getFullYear()}
                </div>
            </div>
            
            <div style={{ borderBottom: "3px dotted black" }}></div>
        </>
    );
}

function convertTime(date){
    let currTime = Date.now();
    let dateObj = new Date(date);
    dateObj = new Date(dateObj.toLocaleString("en-US", {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone}));

    let time = Math.floor((currTime - dateObj) / 1000);
    let seconds = time % 60;
    let minutes = Math.floor(time / 60) % 60;
    let hours = Math.floor(time / 3600) % 24;
    let days = Math.floor(time / 86400);
    let years = Math.floor(days / 365.25);

    if(years > 0)
        return `${years} Year${years !== 1 ? 's' : ''}, ${days % 365} Day${(days % 365) !== 1 ? 's' : ''}`;
    else if(days > 0)
        return `${days} Day${days !== 1 ? 's' : ''}, ${hours} Hour${hours !== 1 ? 's' : ''}`;
    else if(hours > 0)
        return `${hours} Hour${hours !== 1 ? 's' : ''}, ${minutes} Minute${minutes !== 1 ? 's' : ''}, ${seconds} Second${seconds !== 1 ? 's' : ''}`;
    else if(minutes > 0)
        return `${minutes} Minute${minutes !== 1 ? 's' : ''}, ${seconds} Second${seconds !== 1 ? 's' : ''}`;
    else
        return `${seconds} Second${seconds !== 1 ? 's' : ''}`;
}

export default UserProfile;

export default function SideBar(props) {
    let qColor = props.menuSelector[0] === 0 ? {backgroundColor:""} : {backgroundColor:"lightgray"};
    let tColor = props.menuSelector[1] === 0 ? {backgroundColor:""} : {backgroundColor:"lightgray"};

    return (
        <>
            <div id="menu" className="menu">
                <div id="question-menu-div" className= "menu-div" style={qColor}>
                    <a id="question-pg" className="menu" onClick={() => {props.handlers[0]("questions", ["All Questions", "default"])}} href="#root">Questions</a>
                </div>
                <div id="tag-menu-div" className= "menu-div" style={tColor}>
                    <a id ="tag-pg" className="menu" onClick={() => {props.handlers[0]("tags", [])}} href="#root">Tags</a>
                </div>
                <div className= "bottom-menu-div">
                    <UserProfileButton user={props.user} handlers={props.handlers}/>
                    <LogOutButton logOut={props.logOut} user={props.user}></LogOutButton>
                </div>
            </div>
        </>
    );
}

function LogOutButton({ logOut, user }) {
    const handleClick = () => {
        if(user.email === "guest") {
            window.alert("You must be signed in to log out!")
        } else {
            let confirmLogOut = window.confirm("Are you sure you want to log out?");
            if(confirmLogOut)
                logOut(user);
        }
    }
    // if (user.email !== "guest") {
        return (
        <div className="btn-ctn">
                <button style={{backgroundColor:"Red"}}  onClick={handleClick} className="bottom-menu-btn" >Log Out ⛔</button>
        </div>
        );
    // }
}

function UserProfileButton({user, handlers}) {
    const handleClick = () => {
        if(user.email === "guest") {
            window.alert("You must be signed in to view this!")
        }
        else
            handlers[0]("userprofile", []);
    }
        
    // if (user.cansignOut !== false) {
        return (
            <div className="btn-ctn">
                <button style={{backgroundColor:"rgb(0,157,255)"}} className="bottom-menu-btn" onClick={handleClick}>User 🚹</button>
            </div>
        );
    // }
}
  
export default function SiteHeader(props) {
  const handleClick = () => {
    if(props.welcomePage === undefined)
      return;

    if(props.user === undefined || props.user.email === "guest") {
      props.welcomePage();
    } else {
      props.handlers[0]("questions", ["All Questions", "default"]);
    }
  }

  if(props.allowSearch !== undefined && props.allowSearch === true){
    return (
      <div id="header" className="header">
          <h1 id="site-name" onClick={handleClick} style={{"cursor": "pointer"}}> Fake Stack Overflow </h1>
          <div id="search-div">
            <div id="search-div-div">
              <input id="search-inp" type="text" placeholder="Search..." onKeyUp={(e) => props.handlers[1](e)}/>
              </div> 
          </div>
      </div>
    );
  }

  return (
    <div id="header" className="header">
        <h1 id="site-name" onClick={handleClick} style={{"cursor": "pointer"}}> Fake Stack Overflow </h1>
    </div>
  );
}
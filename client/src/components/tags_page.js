import { tagSearch, sortResults } from "./search_sort.js";
import { ElementNum, ElementTitle } from "./title_components.js";
import { AskQuestionButton } from "./button_components.js";
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

/*
User Profile Case - Boolean value

Include error case for no tags created

TagCells - Edit & Delete Button
Validate - No other user is currently using said tag

Modifying Tag
Deleting Tag

*/

function TagPage(props) {
    // console.log(props.modelTags)
    const [username, setUsername] = useState("");
    const [tagsList, setTags] = useState([]);
    
    const[updateStatus, setUpdateStatus] = useState(false);
    const[mergeReq, setMergeReq] = useState(false);

    const [modelQuestions, setModelQuestions] = useState(props.modelQuestions);

    useEffect(() => {
        async function fetchUserData(){
            if(updateStatus === true)
                setUpdateStatus(false);

            if(props.userData === undefined || props.userData.length !== 2){
                if(username !== "")
                    setUsername("");
                if(tagsList !== props.modelTags)
                    setTags(props.modelTags);
                return;
            }

            if(props.userData[0] !== "" && props.userData[1] !== ""){
                try{
                    const res = await axios.get(`http://localhost:8000/user/${props.userData[1]}/tags`);
                    setUsername(props.userData[0]);
                    setTags(res.data);
                } catch (err) {
                    console.log(err);
                }
            }
        }
        fetchUserData();
    }, [props.userData, updateStatus]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get("http://localhost:8000/questions", {
                    withCredentials: true,
                });
                setModelQuestions(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        if(mergeReq === false)
            return;

        setMergeReq(false);
        fetchQuestions();
    }, [mergeReq]);

    console.log("New Run of Tags Page: " + props.userData[0] +"|"+ props.userData.length + "|" + ((props.user === undefined) ? undefined : props.user.email));

    return (
        <>
            <TagUpperContent user={props.user} name={username} modelTags={tagsList} handlers={props.handlers} />
            <TagLowerContent name={username} modelQuestions={modelQuestions} modelTags={tagsList} update={setUpdateStatus} merge={setMergeReq} handlers={props.handlers}/>
        </>
    );
}

function TagUpperContent(props) {
    let pageTitle = "All Tags";
    if(props.name !== "")
        pageTitle = `Tags Created by ${props.name}`;

    return (
        <div id="upper-tag-content">
            <ElementNum elID="tag-num-box" elNum={props.modelTags.length} elName={`Tag${props.modelTags.length !== 1 ? 's' : ''}`}/>
            <ElementTitle elID="tag-page-title" elName={pageTitle}/>
            <TagAskQuestionButton user={props.user} handlers={props.handlers} />
        </div>
    );
}

function TagAskQuestionButton(props){
    return (
        <div id="tag-button-container">
            <AskQuestionButton user={props.user} handlers={props.handlers} />
        </div>
    );
}

function TagLowerContent (props) {
    let tagsArr = props.modelTags;
    const colArr1 = [];
    const colArr2 = [];
    const colArr3 = [];

    for (let i = 0; i < tagsArr.length; i++) {
        if (i % 3 === 0)
            colArr1.push(tagsArr[i]);
        else if (i % 3 === 1)
            colArr2.push(tagsArr[i]);
        else
            colArr3.push(tagsArr[i]);
    }

    if(tagsArr.length === 0){
        
        const myStyle = {
            color: "gray",
            fontSize: 40,
            textAlign: "center",
            marginTop: "15%",
        };
        return <h2 style={myStyle}>No Tags Found</h2>;
    }

    return (
        <div id="lower-tag-content">
            <TagPageCol tagsColID="tag-col1" name={props.name} tagsArr={colArr1} modelQuestions={props.modelQuestions} update={props.update} merge={props.merge} handlers={props.handlers} />
            <TagPageCol tagsColID="tag-col2" name={props.name} tagsArr={colArr2} modelQuestions={props.modelQuestions} update={props.update} merge={props.merge} handlers={props.handlers} />
            <TagPageCol tagsColID="tag-col3" name={props.name} tagsArr={colArr3} modelQuestions={props.modelQuestions} update={props.update} merge={props.merge} handlers={props.handlers} />
        </div>
    );
}

function TagPageCol(props) {
    const finalCol = [];
    
    for (let i = 0; i < props.tagsArr.length; i++){
        let tag = props.tagsArr[i];
        console.log("Tag:" + JSON.stringify(tag));
        finalCol.push( <TagPageCell name={props.name} key={tag.name} cellInfo={tag} modelTags = {props.tagsArr} modelQuestions={props.modelQuestions} update={props.update} merge={props.merge} handlers={props.handlers} /> );
        finalCol.push( <TagPagePartition key={tag._id}/> );
    }

    return (
        <div className="tag-col" id={props.tagsColID}>
            {finalCol}
        </div>
    );
}

function TagPageCell(props) {
    let qArr = tagSearch([props.cellInfo.name], props.modelTags, props.modelQuestions);
    // console.log(props.modelQuestions);

    qArr = sortResults("newest", qArr);

    const validateEdit = () => {
        for(let i = 0; i < qArr.length; i++){
            if(qArr[i].asked_by.username !== props.name)
                return false;
        }
        return true;
    }

    const handleEdit = () => {
        if(!validateEdit())
            window.alert("You may not modify this tag!\nAnother user is currently using this tag!");
        else{
            let newTag = window.prompt("Please enter the new name for your tag:");
            if(newTag !== undefined && newTag !== null){
                if(/\s/g.test(newTag.toLowerCase().trimEnd())){
                    window.alert("Tags must be a single word!");
                    return;
                }

                axios.post(`http://localhost:8000/edit/tag/${props.cellInfo._id}/${newTag.toLowerCase()}`)
                .then(res => {
                    props.update(true);
                    if(res.data === "MERGE"){
                        console.log("MERGE");
                        props.merge(true);
                    }
                })
                .catch(err => {
                    console.log(err);
                });
            }
        }
    }

    const handleDelete = () => {
        if(!validateEdit())
            window.alert("You may not delete this tag!\nAnother user is currently using this tag!");
        else{
            let confirmDel = window.confirm(`Are you sure you want to delete the tag: [${props.cellInfo.name}]`);
            if(confirmDel){
                axios.post(`http://localhost:8000/delete/tag/${props.cellInfo._id}`)
                .then(() => {
                    props.update(true);
                })
                .catch(err => {
                    console.log(err);
                });
            }
        }
    }

    let editComponents = (<></>);
    if(props.name !== undefined && props.name !== ""){
        editComponents = (
            <div className="tag-edit-delete-btn-ctn">
                <button className="tag-edit-delete-btn tag-edit-btn" onClick={handleEdit}>
                    Edit ✏️
                </button>
                <button className="tag-edit-delete-btn tag-delete-btn" onClick={handleDelete}>
                    Delete ❌
                </button>
            </div>
        );
    }


    return (
        <>
            <div className="tag-cell">
                <a className="tag-cell-info" id="tag-cell-link" onClick={() => {props.handlers[0]("questions", [`Tag Search for ${props.cellInfo.name}`, ...qArr])}} href="#root">{props.cellInfo.name}</a>
                <p className="tag-cell-info">{`${qArr.length} question${qArr.length > 1 ? 's' : ''}`}</p>
            </div>
            <div style={{width: "100%", height: "1px"}}/>
            {editComponents}
        </>
    );
}

function TagPagePartition() {
    return <div className="tag-partition"></div>
}

export default TagPage;

/*
TODO
Add Ask Question Button
EventListener Links
*/
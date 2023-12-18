function filterSearch(e, modelTags, modelQuestions) {
  if (e.key === "Enter" || e.keyCode === 13) {
    let searchStr = e.target.value;

    let tagNkeyword = parseSearch(searchStr);
    let qArr1 = tagSearch(tagNkeyword.tagArr, modelTags, modelQuestions);
    let qArr2 = keywordSearch(tagNkeyword.keywordArr, modelQuestions);

    const mergedArr = qArr1;
    qArr2.forEach((element) => {
      if (!qArr1.includes(element)) {
        mergedArr.push(element);
      }
    });

    return mergedArr;
  }
  return undefined;
}

function parseSearch(searchStr) {
  const tagArray = [];
  while (searchStr.includes("[") && searchStr.includes("]")) {
    if (searchStr.indexOf("[") > searchStr.lastIndexOf("]")) break;

    let strNtag = extractTag(searchStr);
    tagArray.push(strNtag.tag);
    searchStr = strNtag.str;
  }
  let keywordArray = searchStr.split(" ");
  return { tagArr: tagArray, keywordArr: keywordArray };
}

function extractTag(searchStr) {
  let startIndex = searchStr.indexOf("[");
  let endIndex = searchStr.indexOf("]", startIndex);

  if (startIndex === -1 || endIndex === -1) return undefined;

  while (endIndex + 1 < searchStr.length) {
    if (searchStr[endIndex + 1] === "]") endIndex++;
    else break;
  }

  let foundTag = searchStr.substring(startIndex, endIndex + 1);
  foundTag = foundTag.replace("[", "");
  foundTag = foundTag.replace("]", "");
  let remainingStr =
    searchStr.substring(0, startIndex) +
    " " +
    searchStr.substring(endIndex + 1);

  return { tag: foundTag, str: remainingStr };
}

function constructTextWithHyperlink(postText) {
  const arrHTMLElements = [];

  let index = 1;
  let extract = extractHyperlink(postText);

  while (extract !== undefined) {
    if (
      extract.link.indexOf("http://") !== 0 &&
      extract.link.indexOf("https://") !== 0
    ) {
      console.log("NO HTTP");
      return undefined;
    }
    arrHTMLElements.push(extract.str1);
    arrHTMLElements.push(
      <a target="_blank" rel="noreferrer" href={extract.link} key={index++}>
        {extract.linkedText}
      </a>
    );

    postText = extract.str2;
    extract = extractHyperlink(extract.str2);
  }

  return (
    <>
      {
        <p>
          {arrHTMLElements}
          {postText}
        </p>
      }
    </>
  );
}

function extractHyperlink(postText) {
  let startIndex = -1;
  do {
    startIndex = postText.indexOf("[", startIndex + 1);
    let endIndex = postText.indexOf("]", startIndex);

    if (startIndex === -1 || endIndex === -1) return undefined;

    if (endIndex + 1 >= postText.length) return undefined;

    if (postText[endIndex + 1] === "(") {
      let endParen = postText.indexOf(")", endIndex);
      if (endParen === -1) return undefined;

      return {
        str1: postText.substring(0, startIndex),
        linkedText: postText.substring(startIndex + 1, endIndex),
        link: postText.substring(endIndex + 2, endParen),
        str2: postText.substring(endParen + 1),
      };
    }
  } while (true);
}

function keywordSearch(keywordArr, modelQuestions) {
  const questionsArr = [];
  for (let question of modelQuestions) {
    for (let keyword of keywordArr) {
      if (keyword === undefined || keyword === "") continue;
      if (question.title.toLowerCase().includes(keyword.toLowerCase()) || question.text.toLowerCase().includes(keyword.toLowerCase())) {
        questionsArr.push(question);
        break;
      }
    }
  }

  const returnArr = questionsArr.filter(function (value, index) {
    if (questionsArr.indexOf(value) === index) return true;
    return false;
  });

  return returnArr;
}

function tagSearch(tagArray, modelTags, modelQuestions) {
  const tagIDs = [];
  const matchArr = [];
  // console.log("All tags:" + JSON.stringify(modelTags));
  // console.log("Tag:" + tagArray);
  // console.log(modelQuestions);

  for (let tag of tagArray) {
    if (tag === undefined || tag === "") continue;
    for (let tagData of modelTags) {
      // console.log(tagData);
      // console.log(tag);
      if (tag.toLowerCase() === tagData.name.toLowerCase()) {
        tagIDs.push(tagData._id);
        break;
      }
    }
  }
  // console.log(tagIDs);

  for (let tag of tagIDs) {
    for (let qData of modelQuestions) {
      console.log(qData);
      console.log(tag);
      // if (qData.tags.includes({_id: tag})) {
      //   matchArr.push(qData);
      // }
      if (qData.tags.some(tagObj => tagObj._id === tag)) {
        matchArr.push(qData);
      }
    }
  }
  console.log(JSON.stringify(matchArr));

  const returnArr = matchArr.filter(function (value, index) {
    if (matchArr.indexOf(value) === index) return true;
    return false;
  });

  return returnArr;
}

function sortResults(mode, questionArr) {
  questionArr = [...questionArr];
  if (mode.toLowerCase() === "sortanswer") {
    questionArr.sort(function (q1, q2) {
      return new Date(q2.ans_date_time).getTime() - new Date(q1.ans_date_time).getTime();
    });
  }
  if (mode.toLowerCase() === "unanswered") {
    let dupArr = [...questionArr];
    questionArr = [];
    for (let question of dupArr) {
      if (question.answers.length === 0) questionArr.push(question);
    }
  }

  if (mode.toLowerCase() === "active") {
    questionArr = questionArr.sort(function (q1, q2) {
      let latestAns1 = findLatestAns(q1);
      let latestAns2 = findLatestAns(q2);
      if (latestAns1 === undefined && latestAns2 !== undefined) return 1;
      else if (latestAns1 !== undefined && latestAns2 === undefined) return -1;
      else if (latestAns1 === undefined && latestAns2 === undefined)
        return new Date(q2.ask_date_time).getTime() - new Date(q1.ask_date_time).getTime();
      else {
        return new Date(latestAns2.ans_date_time).getTime() - new Date(latestAns1.ans_date_time).getTime();
      }
    });
  } else if (
    mode.toLowerCase() === "newest" ||
    mode.toLowerCase() === "unanswered"
  ) {
    questionArr.sort(function (q1, q2) {
      return new Date(q2.ask_date_time).getTime() - new Date(q1.ask_date_time).getTime();
    });
  }
  return questionArr;
}

function findLatestAns(question) {
  let latestAns = undefined;
  for (let ans of question.answers) {
    if (latestAns === undefined || new Date(ans.ans_date_time).getTime() - new Date(latestAns.ans_date_time).getTime() > 0)
      latestAns = ans;
  }
  return latestAns;
}

export {
  filterSearch,
  tagSearch,
  sortResults,
  constructTextWithHyperlink,
  extractHyperlink,
};

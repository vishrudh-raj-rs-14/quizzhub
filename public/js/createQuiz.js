import { showAlert, hideAlert } from "./alert.js";
const plus = document.querySelector(".plus");
const questions = [];
let tags = document.querySelector(".tags-edit");
const tagsContainer = document.querySelector(".tags-edit-c");
let tagList = [];
const formData = new FormData();
let active = 1;
let first = true;
// tags.addEventListener("click", (e) => {
//   if (tagList.length == 0) {
//     first = false;
//     tags.innerHTML = ``;
//     tags.classList.remove(first);
//   }
// });
const nextChange = function (e) {
  if (active < Array.from(document.querySelectorAll(".question-page")).length) {
    active++;
    setActive();
  }
};

const createQuiz = async () => {
  try {
    const message = validateInput();
    if ((typeof message).toLowerCase() === "object") {
      formData.append("name", message.name);
      formData.append("description", message.description);
      formData.append("difficulty", message.difficulty);
      let restrict = document.querySelector("#restrict").checked;
      formData.append("isPrivate", JSON.stringify(restrict));
      formData.append("tags", JSON.stringify(message.tags));
      formData.append("questions", JSON.stringify(message.questions));
      formData.append("imgPos", JSON.stringify(message.imgArr));
      // message.images.forEach((ele) => {
      //   formData.append("images", ele);
      // });
      const res = await axios.post("/api/quiz", formData);
      location.href = "/";
    } else {
      showAlert(message);
    }
  } catch (error) {
    console.log(error);
    if (error.response) showAlert(error.response.data);
    else showAlert("Something Went Wrong");
  }
};

const validateInput = function () {
  const imgArr = [];
  const name = document.querySelector("#quizname").value;
  if (!name) return "Please enter a name for your quiz";
  const description = document.querySelector("#quizdesc").value;
  if (!description) return "Please enter a description for your quiz";
  let difficulty;
  let ele = document.getElementsByName("selector");
  for (let i = 0; i < ele.length; i++) {
    if (ele[i].checked) {
      difficulty = ele[i].value;
    }
  }
  if (!difficulty) return "Please enter a difficultity for your quiz";
  if (tagList.length == 0) return "Please enter some tags";
  if (tagList.length >= 7) return "You cannot enter more than 7 tags";
  const questions = [];
  let questionEle = Array.from(document.querySelectorAll(".question-page"));
  console.log(questionEle);
  for (let i = 0; i < questionEle.length; i++) {
    const quesName = questionEle[i].querySelector("#questionName").value;
    if (!quesName) return `Question ${i + 1} does not have a name`;
    const quesDesc = questionEle[i].querySelector("#questionDesc").value;
    let img = questionEle[i].querySelector(".custom-file-upload input");
    console.log(img.files);
    if (img.files[0]) {
      imgArr.push(1);
      console.log(img.files[0]);
      formData.append("images", img.files[0]);
      for (const val of formData.entries()) {
        console.log(val);
      }
    } else {
      imgArr.push(0);
    }
    const options = [];
    const optionsEle = Array.from(questionEle[i].querySelectorAll(".option"));
    for (let j = 0; j < optionsEle.length; j++) {
      const val = optionsEle[j].querySelector(" input").value;
      if (!val) return `Option ${j + 1} is not defined in Question ${i + 1}`;
      options.push(val);
    }
    let correctAnswer;
    let ele = document.getElementsByName(`q${i + 1}`);
    for (let k = 0; k < ele.length; k++) {
      if (ele[k].checked) {
        correctAnswer = Number(ele[k].value);
      }
    }
    if (!correctAnswer)
      return `Correct answer is not provided for question ${i + 1}`;
    questions.push({
      questionName: quesName,
      questionDesc: quesDesc,
      options: options,
      correctAnswer: correctAnswer,
    });
  }
  const quiz = {
    name,
    description,
    difficulty,
    tags: tagList,
    questions,
    imgArr,
  };
  return quiz;
};

document.querySelector(".question").addEventListener("click", (event) => {
  active = 1;
  setActive();
});

document.querySelector(".quiz-details").addEventListener("click", (e) => {
  const qc = Array.from(document.querySelectorAll(".question-page"));
  qc.forEach((ele) => {
    ele.classList.add("hide");
  });
  document.querySelector(".details").classList.remove("hide");
});

const updateInp = (e) => {
  tagsContainer.innerHTML = "";
  tagList.forEach((e) => {
    let ele = document.createElement("span");
    ele.classList.add("inner");
    ele.dataset.text = e.trim();
    ele.innerHTML = `${e.trim().slice(0, 1).toUpperCase()}${e
      .trim()
      .slice(
        1
      )} <span class="cross"><i class="fa-sharp fa-regular fa-circle-xmark" style="color: #f5f5f5;"></i></span>`;
    let c = ele.querySelector(".cross");
    c.addEventListener("click", (e) => {
      for (let i = 0; i < tagList.length; i++) {
        if (
          tagList[i].trim() ===
          String(e.target.parentElement.parentElement.dataset.text.trim())
        ) {
          tagList.splice(i, 1);
          updateInp(e);
          break;
        }
      }
    });
    tagsContainer.append(ele);
  });
  let inp = document.createElement("input");
  if (tagList.length == 0) {
    inp.setAttribute("placeholder", "Create Tags Here...");
  }
  inp.classList.add("tags-edit");
  inp.addEventListener("input", tagsInp);
  tags = inp;
  tagsContainer.append(inp);
  inp.focus();
};

const tagsInp = (e) => {
  if (e.target.value[e.target.value.length - 1] == " ") {
    let tag = e.target.value;
    if (tagList.includes(tag.trim().toLowerCase())) tag = "";
    else tagList.push(tag.trim().toLowerCase());
    e.target.value = "";
    updateInp();
  }
};

tags.addEventListener("input", tagsInp);

plus.addEventListener("click", () => {
  let questionList = Array.from(document.querySelectorAll(".question"));
  questionList.pop();
  if (questionList.length <= 14) {
    let ele = document.createElement("div");
    ele.classList.add("question");
    ele.innerHTML = questionList.length + 1;
    ele.dataset.active = questionList.length + 1;
    let qc = document.querySelector(".questions");
    ele.addEventListener("click", (event) => {
      active = Number(event.target.dataset.active);
      setActive();
    });
    qc.removeChild(plus);
    qc.append(ele);
    qc.append(plus);

    let questionHolder = document.querySelector(".content");
    let e = document.createElement("div");
    e.setAttribute("id", `q${questionList.length + 1}-page`);
    e.classList.add("question-page");
    e.innerHTML = `
    <div class="details-head">Add Question ${questionList.length + 1} :</div>
    <div class="add-details">
      <div class="heading detail-item">
        <span> Title :</span
        ><span
          ><input type="text" placeholder="Enter Question Name" id="questionName"
        /></span>
      </div>
      <div class="description detail-item">
        <span> Description :</span
        ><span>
          <textarea
            type="text"
            class="desc desc-ques"
            placeholder="Enter a decription for your question"
            id="questionDesc"
          ></textarea>
        </span>
      </div>
      <div class="radio-settings detail-item file-holder">
        <span> Image :</span>
        <div class="file-inp">
          <div class="file-c">
            <div class="file-text">Add an image</div>
            <div class="file-inp-c">
              <label class="custom-file-upload">
                <input type="file" class="file" />
                Choose file
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="options detail-item">
        <div class="option">
          <span class="number">1)</span
          ><input
            type="text"
            class="option-inp"
            placeholder="Type an option"
          />
          <label for="${questionList.length + 1}_1" class="checkbox ">
            <input
              type="radio"
              name="q${questionList.length + 1}"
              id="${questionList.length + 1}_1"
              class="option-inp hide"
              value="1"
            />
          </label>
        </div>
        <div class="option">
          <span class="number">2)</span
          ><input
            type="text"
            class="option-inp"
            placeholder="Type an option"
          />
          <label for="${questionList.length + 1}_2" class="checkbox ">
            <input
              type="radio"
              name="q${questionList.length + 1}"
              id="${questionList.length + 1}_2"
              class="option-inp hide"
              value="2"
            />
          </label>
        </div>
        <div class="option">
          <span class="number">3)</span>
          <input
            type="text"
            class="option-inp"
            placeholder="Type an option"
          />
          <label for="${questionList.length + 1}_3" class="checkbox ">
            <input
              type="radio"
              name="q${questionList.length + 1}"
              id="${questionList.length + 1}_3"
              class="option-inp hide"
              value="3"
            />
          </label>
        </div>
        <div class="option">
          <span class="number">4)</span>
          <input
            type="text"
            class="option-inp"
            placeholder="Type an option"
          />
          <label for="${questionList.length + 1}_4" class="checkbox ">
            <input
              type="radio"
              name="q${questionList.length + 1}"
              id="${questionList.length + 1}_4"
              class="option-inp hide"
              value="4"
            />
          </label>
        </div>
      </div>
      <div class="quiz-btns">
        <div class="discard delete"><button>Delete Question</button></div>
        <div>
            <div class="next"><button>Next</button></div>
            <div class="save"><button>Create Quiz</button></div>
        </div>
      </div>
    </div>
  `;
    active = questionList.length + 1;
    e.querySelector(".next button").addEventListener("click", nextChange);
    e.querySelector(".delete").addEventListener("click", (e) => {
      let tot = Array.from(document.querySelectorAll(".question-page")).length;
      if (tot <= 1) {
        showAlert("There should be atleast 1 question");
        return;
      }
      document
        .querySelector(".content")
        .removeChild(document.querySelector(`#q${active}-page`));
      Array.from(document.querySelectorAll(".question-page")).forEach(
        (ele, i) => {
          ele.setAttribute("id", `q${i + 1}-page`);
          ele.querySelector(".details-head").textContent = `Add Question ${
            i + 1
          }:`;
          let labels = Array.from(ele.querySelectorAll(".option label"));
          labels.forEach((ele, j) => {
            ele.setAttribute("for", `${i + 1}_${j + 1}`);
            let input = ele.querySelector("input");
            input.setAttribute("name", `q${i + 1}`);
            input.setAttribute("id", `${i + 1}_${j + 1}`);
          });
        }
      );
      const sidebar = Array.from(document.querySelectorAll(".question"));
      sidebar.pop();
      const element = sidebar.pop();
      element.parentElement.removeChild(element);
      for (let k = 0; k < sidebar.length; k++) {
        sidebar[k].dataset.active = k + 1;
        sidebar[k].innerHTML = k + 1;
      }
      if (active == tot) active--;
      setActive();
    });
    e.querySelector(".save button").addEventListener("click", createQuiz);
    fileInp(e.querySelector(".file"));
    questionHolder.append(e);
    setActive();
  }
});

// document.querySelector(".next").addEventListener("click")=>{

// }
const fileInp = (ele) =>
  ele.addEventListener("input", (e) => {
    let text = e.target.value.slice(12);
    console.log(document.querySelectorAll(".file-text")[active - 1]);
    console.log(active);
    if (text.length <= 30) {
      document.querySelectorAll(".file-text")[active - 1].textContent =
        e.target.value.slice(12);
    } else {
      document.querySelectorAll(".file-text")[active - 1].textContent =
        text.slice(0, 30) + "...";
    }
  });
Array.from(document.querySelectorAll(".file")).forEach(fileInp);

const setActive = function () {
  const qc = Array.from(document.querySelectorAll(".question-page"));
  qc.forEach((ele) => {
    ele.classList.add("hide");
  });
  qc[active - 1].classList.remove("hide");
  document.querySelector(".details").classList.add("hide");
};

Array.from(document.querySelectorAll(".next button"))[1].addEventListener(
  "click",
  nextChange
);

Array.from(document.querySelectorAll(".next button"))[0].addEventListener(
  "click",
  (e) => {
    active = 1;
    setActive();
  }
);

document.querySelector(".discard").addEventListener("click", () => {
  location.href = "./quiz.html";
});

Array.from(document.querySelectorAll(".save")).forEach((ele) => {
  ele.addEventListener("click", createQuiz);
});

document.querySelector(".delete").addEventListener("click", (e) => {
  let tot = Array.from(document.querySelectorAll(".question-page")).length;
  if (tot <= 1) {
    showAlert("There should be atleast 1 question");
    return;
  }
  document
    .querySelector(".content")
    .removeChild(document.querySelector(`#q${active}-page`));
  Array.from(document.querySelectorAll(".question-page")).forEach((ele, i) => {
    ele.setAttribute("id", `q${i + 1}-page`);
    ele.querySelector(".details-head").textContent = `Add Question ${i + 1}:`;
    let labels = Array.from(ele.querySelectorAll(".option label"));
    labels.forEach((ele, j) => {
      ele.setAttribute("for", `${i + 1}_${j + 1}`);
      let input = ele.querySelector("input");
      input.setAttribute("name", `q${i + 1}`);
      input.setAttribute("id", `${i + 1}_${j + 1}`);
    });
  });
  const sidebar = Array.from(document.querySelectorAll(".question"));
  sidebar.pop();
  const element = sidebar.pop();
  element.parentElement.removeChild(element);
  for (let k = 0; k < sidebar.length; k++) {
    sidebar[k].dataset.active = k + 1;
    sidebar[k].innerHTML = k + 1;
  }
  if (active == tot) active--;
  setActive();
});

document.querySelector(".discard").addEventListener("click", () => {
  location.href = "/";
});

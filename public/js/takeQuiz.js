import { showAlert, hideAlert } from "./alert.js";

const plus = document.querySelector(".plus");
const questions = [];
let tags = document.querySelector(".tags-edit");
const tagsContainer = document.querySelector(".tags-edit-c");
let answers = [];
let tagList = [];
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

const submitTest = async function (id) {
  try {
    const res = await axios.post(`/api/quiz/${id}`, {
      answers,
    });
    showAlert(
      "Test Submitted Successfully. View your result in your profile",
      true
    );
    location.href = `/?msg=Test Submitted Successfully. View your result in your profile&mark=${res.mark}&`;
  } catch (error) {
    showAlert("Something went wrong while Submitting");
    console.log(error);
  }
};

const validateInput = function () {
  const ans = [];
  let questionEle = Array.from(document.querySelectorAll(".question-page"));
  for (let i = 0; i < questionEle.length; i++) {
    let val = 0;
    let ele = document.getElementsByName(`q${i + 1}`);
    for (let j = 0; j < ele.length; j++) {
      if (ele[j].checked) {
        val = Number(ele[j].value);
      }
    }
    ans.push(val);
  }
  return ans;
};

document.querySelectorAll(".question").forEach((ele, i) =>
  ele.addEventListener("click", (event) => {
    active = i + 1;
    setActive();
  })
);

// document.querySelector(".quiz-details").addEventListener("click", (e) => {
//   const qc = Array.from(document.querySelectorAll(".question-page"));
//   qc.forEach((ele) => {
//     ele.classList.add("hide");
//   });
//   document.querySelector(".details").classList.remove("hide");
// });

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
};

Array.from(document.querySelectorAll(".next button")).forEach((ele) =>
  ele.addEventListener("click", nextChange)
);

Array.from(document.querySelectorAll(".back button")).forEach((ele) =>
  ele.addEventListener("click", () => {
    if (active >= 2) {
      active--;
      setActive();
    }
  })
);

document.querySelector(".back").addEventListener("click", () => {
  if (active >= 2) {
    active--;
    setActive();
  }
});

Array.from(document.querySelectorAll(".submit")).forEach((ele) => {
  ele.addEventListener("click", (e) => {
    const message = validateInput();
    answers = message;
    let c = 0;
    message.forEach((ele) => {
      if (ele == 0) c++;
    });
    if (c != 0) {
      document.querySelector(
        ".confirm-err-val"
      ).textContent = ` You have not attempted ${c} questions`;
    } else {
      document.querySelector(
        ".confirm-err-val"
      ).textContent = ` You have attempted all questions`;
    }
    document.querySelector(".confirm-modal").classList.remove("modal-off");
  });
});

document.querySelector(".confirm").addEventListener("click", () => {
  const id =
    window.location.href.split("/")[window.location.href.split("/").length - 2];
  submitTest(id);
});

document.querySelector(".cancel").addEventListener("click", () => {
  document.querySelector(".confirm-modal").classList.add("modal-off");
});

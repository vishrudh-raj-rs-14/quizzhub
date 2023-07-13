import { showAlert, hideAlert } from "./alert.js";

const file = document.querySelector("#pro-pic");
const modal = document.querySelector(".modal");

const updateMe = async (data) => {
  try {
    const res = await axios.patch("/api/users/updateMe", data);
    if (res.data.status == "success") {
      location.reload();
    }
  } catch (error) {
    console.log(error);
    if (err.response) showAlert(err.response.data.message);
    else showAlert("Something went wrong");
  }
};

if (file)
  file.addEventListener("change", () => {
    const [fileIn] = file.files;
    if (fileIn) {
      let img = document.querySelector("#pro-sample");
      img.classList.remove("hidden");
      img.src = URL.createObjectURL(fileIn);
    }
  });

if (file)
  document.querySelector(".profile-pic").addEventListener("click", () => {
    modal.classList.remove("modal-off-state");
  });

if (document.querySelector(".modal-off"))
  document.querySelector(".modal-off").addEventListener("click", () => {
    modal.classList.add("modal-off-state");
  });

if (document.querySelector(".pro-btns-modal .next button"))
  document
    .querySelector(".pro-btns-modal .next button")
    .addEventListener("click", () => {
      if (!file.files[0]) {
        modal.classList.add("modal-off-state");
      } else {
        const formData = new FormData();
        formData.append("photo", file.files[0]);
        updateMe(formData);
      }
    });

document.querySelectorAll(".prof-quiz-op").forEach((ele) => {
  ele.addEventListener("click", (e) => {
    document
      .querySelectorAll(".prof-quiz-op")
      .forEach((ele) => ele.classList.remove("active"));
    e.target.classList.add("active");
    document
      .querySelectorAll(".quiz-container")
      .forEach((ele) => ele.classList.remove("open"));
    document
      .querySelectorAll(".quiz-container")
      [parseInt(e.target.dataset.val)].classList.add("open");
  });
});

document.querySelectorAll(".card").forEach((ele) =>
  ele.addEventListener("click", (e) => {
    const element = e.target.closest(".card");
    location.href = `/quiz/${element.dataset.link}/info`;
  })
);

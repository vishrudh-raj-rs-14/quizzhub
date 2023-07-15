import { showAlert, hideAlert } from "./alert.js";

const socket = io();
socket.emit("join");

const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get("msg");
if (msg) {
  showAlert(msg, true);
}

Array.from(document.querySelectorAll(".card-heart")).forEach((ele) =>
  ele.addEventListener("click", () => {
    if (ele.classList.contains("toggled")) {
      ele.innerHTML = `<img src="./img/heart2.png" />`;
      ele.classList.remove("toggled");
    } else {
      ele.innerHTML = `<img src="./img/heart.svg" />`;
      ele.classList.add("toggled");
    }
  })
);

document.querySelector(".search-btn").addEventListener("click", (ele) => {
  let val = document.querySelector(".search-inp input").value;
  if (val) location.href = `/?name=${val}`;
  else location.href = `/`;
});

Array.from(document.querySelectorAll(".card")).forEach((ele) => {
  ele.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    location.href = `/quiz/${card.dataset.link}/info`;
  });
});

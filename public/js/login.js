import { showAlert, hideAlert } from "./alert.js";

const socket = io();

const urlParams = new URLSearchParams(window.location.search);
const err = urlParams.get("e");
if (err) {
  showAlert(err);
}

const login = async (email, password) => {
  try {
    const res = await axios.post("/api/users/login", {
      email,
      password,
    });
    showAlert("Logged in Successfully", true);
    location.href = "/";
  } catch (err) {
    if (err.response) showAlert(err.response.data.message);
    else showAlert("Something went wrong");
  }
};

document.querySelector(".submit-normal").addEventListener("click", () => {
  const email = document.querySelector(".inp-email").value;
  const password = document.querySelector(".inp-password").value;
  login(email, password);
});

document.querySelector(".submit-google").addEventListener("click", () => {
  const url = document.querySelector(".submit-google").dataset.url;
  location.href = url;
});

document.querySelector(".submit-dauth").addEventListener("click", () => {
  const url = document.querySelector(".submit-dauth").dataset.url;
  location.href = url;
});

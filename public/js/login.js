import { showAlert, hideAlert } from "./alert.js";

const urlParams = new URLSearchParams(window.location.search);
const err = urlParams.get("e");
if (err) {
  showAlert("Log in to access this page");
}

const login = async (email, password) => {
  try {
    const res = await axios.post("http://localhost:5500/api/users/login", {
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

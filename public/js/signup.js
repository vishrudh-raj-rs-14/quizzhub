import { showAlert, hideAlert } from "./alert.js";

const signup = async (
  firstName,
  lastName,
  email,
  password,
  confirmPassword
) => {
  try {
    const res = await axios.post("/api/users/signUp", {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });
    showAlert("Signed Up Successfully", true);

    location.href = "/";
  } catch (err) {
    console.log(err);
    if (err.response.data.err.errors) {
      showAlert(
        err.response.data.err.errors[
          Object.keys(err.response.data.err.errors)[0]
        ].message
      );
    } else if (err.response.data.message) {
      if ((err.response.data.err.code = 11000)) {
        showAlert("User Already exists.  Type a new email");
      }
    } else showAlert("Something went wrong");
  }
};

document.querySelector(".submit-normal").addEventListener("click", () => {
  const firstName = document.querySelector(".inp-fname").value;
  const lastName = document.querySelector(".inp-lname").value;
  const email = document.querySelector(".inp-email").value;
  const password = document.querySelector(".inp-password").value;
  const confirmPassword = document.querySelector(".inp-cpassword").value;
  signup(firstName, lastName, email, password, confirmPassword);
});

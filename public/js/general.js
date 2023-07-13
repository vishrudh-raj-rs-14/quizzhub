import { showAlert, hideAlert } from "./alert.js";

document.querySelector(".search-btn").addEventListener("click", (ele) => {
  let val = document.querySelector(".search-inp input").value;
  if (val) location.href = `/?name=${val}`;
  else location.href = `/`;
});

document.querySelector(".logo").addEventListener("click", (e) => {
  location.href = "/";
});

document.querySelector(".noti-activate").addEventListener("click", (e) => {
  e.stopPropagation();
  document.querySelector(".notification-center").classList.toggle("noti-off");
});

window.addEventListener("click", () => {
  document.querySelector(".notification-center").classList.add("noti-off");
});

document
  .querySelector(".notification-center")
  .addEventListener("click", (e) => {
    e.stopPropagation();
  });

document.querySelectorAll(".noti-acc").forEach((ele) =>
  ele.addEventListener("click", async (e) => {
    const id = e.target.closest(".noti-card").dataset.id;
    const status = 2;
    try {
      const res = await axios.patch("http://localhost:5500/api/friend", {
        from: id,
        status,
      });
      location.reload();
    } catch (err) {
      showAlert("Something went wrong");
    }
  })
);

document.querySelectorAll(".noti-dec").forEach((ele) =>
  ele.addEventListener("click", async (e) => {
    const id = e.target.closest(".noti-card").dataset.id;
    const status = 3;
    try {
      const res = await axios.patch("http://localhost:5500/api/friend", {
        from: id,
        status,
      });
      location.reload();
    } catch (err) {
      showAlert("Something went wrong");
    }
  })
);

document.querySelectorAll(".noti-rem").forEach((ele) =>
  ele.addEventListener("click", async (e) => {
    const remId = e.target.closest(".noti-card").dataset.id;
    try {
      const res = await axios.post("http://localhost:5500/api/friend/delete", {
        id: remId,
      });
      location.reload();
    } catch (err) {
      showAlert("Something went wrong");
    }
  })
);

const logout = async () => {
  try {
    const res = await axios.get("http://localhost:5500/api/users/logout");
    showAlert("Logged Out Successfully", true);
    console.log(res);
    if (res.data.status == "success") location.href = "/login";
  } catch (err) {
    showAlert("Error logging out. Try again Later");
  }
};

if (document.querySelector("#logout"))
  document.querySelector("#logout").addEventListener("click", () => {
    console.log("here");
    logout();
  });

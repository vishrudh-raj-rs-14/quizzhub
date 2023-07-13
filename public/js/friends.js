import { showAlert, hideAlert } from "./alert.js";

const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get("name");
if (msg) {
  document.querySelector(".friend-search input").value = msg;
}

document.querySelectorAll(".frd-card").forEach((ele) =>
  ele.addEventListener("click", (e) => {
    let ele = e.target.closest(".frd-card");
    location.href = `/${ele.dataset.user}/profile`;
  })
);

document.querySelector(".frd-search-btn").addEventListener("click", (e) => {
  const inp = document.querySelector(".friend-search input").value;
  if (inp) {
    location.href = `/friends?name=${inp}`;
  } else {
    location.href = "/friends";
  }
});

document.querySelectorAll(".add").forEach((ele) =>
  ele.addEventListener("click", async (e) => {
    e.stopPropagation();
    const frdId = e.target.closest(".frd-card").dataset.user;
    console.log(frdId);
    try {
      const res = await axios.post("/api/friend", {
        to: frdId,
      });
      location.reload();
    } catch (err) {
      showAlert("Something went wrong");
      console.log(err);
    }
  })
);

document.querySelectorAll(".removeReq").forEach((ele) =>
  ele.addEventListener("click", async (e) => {
    e.stopPropagation();
    const to = e.target.closest(".frd-card").dataset.user;
    try {
      const res = await axios.post("http://localhost:5500/api/friend/delete", {
        to,
      });
      location.reload();
    } catch (err) {
      showAlert("Something went wrong");
    }
  })
);

document.querySelectorAll(".card-acc").forEach((ele) =>
  ele.addEventListener("click", async (e) => {
    e.stopPropagation();
    const id = e.target.closest(".frd-card").dataset.user;
    const status = 2;
    try {
      const res = await axios.patch("/api/friend", {
        from: id,
        status,
      });
      location.reload();
    } catch (err) {
      showAlert("Something went wrong");
    }
  })
);

document.querySelectorAll(".card-dec").forEach((ele) =>
  ele.addEventListener("click", async (e) => {
    e.stopPropagation();
    const id = e.target.closest(".frd-card").dataset.user;
    const status = 3;
    try {
      const res = await axios.patch("/api/friend", {
        from: id,
        status,
      });
      location.reload();
    } catch (err) {
      showAlert("Something went wrong");
    }
  })
);

document.querySelectorAll(".unFriend").forEach((ele) =>
  ele.addEventListener("click", async (e) => {
    e.stopPropagation();
    const friend = e.target.closest(".frd-card").dataset.user;
    console.log("here");
    try {
      const res = await axios.post("/api/friend/unfriend", {
        friend,
      });
      location.reload();
    } catch (err) {
      showAlert("Something went wrong");
    }
  })
);

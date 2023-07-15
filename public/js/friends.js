import { showAlert, hideAlert } from "./alert.js";

const socket = io();
socket.on("request", (fromUser, toUser, request) => {
  console.log("here");
  const container = document.querySelector(".frd-list");
  document.querySelectorAll(".frd-card").forEach((ele) => {
    const c = ele.querySelector(".request-icons");
    if (ele.dataset.user == String(toUser._id)) {
      c.innerHTML = `<a href="/64929dd39a66f92a1becc255/profile"><div class="icon"><i class="fas fa-user-friends fa-lg" style="color: #fafafa"></i></div></a><div class="card-acc icon"><i class="fa-solid fa-check fa-lg" style="color:#fafafa"></i></div><div class="card-dec icon"><i class="fa-solid fa-x" style="color:#fafafa"></i></div>`;
      ele
        .querySelector(".request-icons")
        .parentElement.removeChild(ele.querySelector(".request-icons"));
      ele.append(c);
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
    }
  });
});

socket.on("notification", (data, user) => {
  // const container = document.querySelector(".frd-list");
  // container.innerHTML = "";
  location.reload();
});

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

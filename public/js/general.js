import { showAlert, hideAlert } from "./alert.js";

function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ` year${Math.floor(interval) > 1 ? "s" : ""}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return (
      Math.floor(interval) + ` month${Math.floor(interval) > 1 ? "s" : ""}`
    );
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ` day${Math.floor(interval) > 1 ? "s" : ""}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ` hour${Math.floor(interval) > 1 ? "s" : ""}`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return (
      Math.floor(interval) + ` minute${Math.floor(interval) > 1 ? "s" : ""}`
    );
  }
  return Math.floor(seconds) + ` second${Math.floor(seconds) > 1 ? "s" : ""}`;
}

const socket = io();

socket.on("notification", (data, user) => {
  console.log(data, user);
  const container = document.querySelector(".notification-center");
  container.innerHTML = "";
  let x = 0;
  data.forEach((req) => {
    const c = document.createElement("div");
    let timeText =
      timeSince(new Date(req.time).getTime()) == "0 second"
        ? "Just Now"
        : timeSince(new Date(req.time).getTime());
    c.classList.add("noti-card");
    if (req.status == 1) {
      x += 1;
      c.dataset.id = req.from._id;

      c.innerHTML = `<div class="noti-data">
      <div class="noti-head">${req.from.firstName[0].toUpperCase()}${req.from.firstName.slice(
        1
      )} sent you a friend request</div>
      <div class="noti-time">${timeText} ago</div></div><div class="noti-opt"><div class="noti-acc"><i class="fa-solid fa-check" style="color:#fafafa"></i></div><div class="noti-dec"><i class="fa-solid fa-x fa-sm" style="color:#fafafa"></i></div></div>`;
      container.append(c);
    } else if (req.status == 2 && String(req.to._id) != String(user)) {
      x += 1;
      c.dataset.id = req._id;
      c.innerHTML = `<div class="noti-data">
      <div class="noti-head">${req.to.firstName[0].toUpperCase()}${req.to.firstName.slice(
        1
      )} accepted your friend request</div>
      <div class="noti-time">${timeText} ago</div></div><div class="noti-opt"><div class="noti-rem"><i class="fa-solid fa-x fa-sm" style="color:#fafafa"></i></div></div>`;
      container.append(c);
    } else if (req.status == 3 && String(req.to._id) != String(user)) {
      x += 1;
      c.dataset.id = req._id;
      c.innerHTML = `<div class="noti-data">
      <div class="noti-head">${req.to.firstName[0].toUpperCase()}${req.to.firstName.slice(
        1
      )} declined your friend request</div>
      <div class="noti-time">${timeText} ago</div></div><div class="noti-opt"><div class="noti-rem"><i class="fa-solid fa-x fa-sm" style="color:#fafafa"></i></div></div>`;
      container.append(c);
    } else if (!req.status) {
      x += 1;
      c.dataset.id = req._id;
      c.innerHTML = `<div class="noti-data">
      <div class="noti-head">You scored ${req.score}/${req.totalScore} marks in ${req.quiz.name}</div>
      <div class="noti-time">${timeText} ago</div></div><div class="noti-opt"><div class="noti-rem"><i class="fa-solid fa-x fa-sm" style="color:#fafafa"></i></div></div>`;
      container.append(c);
    }
  });
  if (x == 0) {
    const c = document.createElement("div");

    c.className = "noti-null";
    c.innerHTML = "No New Notifications Available";
    container.append(c);
  }
  document.querySelectorAll(".noti-acc").forEach((ele) =>
    ele.addEventListener("click", async (e) => {
      const id = e.target.closest(".noti-card").dataset.id;
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

  document.querySelectorAll(".noti-dec").forEach((ele) =>
    ele.addEventListener("click", async (e) => {
      const id = e.target.closest(".noti-card").dataset.id;
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

  document.querySelectorAll(".noti-rem").forEach((ele) =>
    ele.addEventListener("click", async (e) => {
      const remId = e.target.closest(".noti-card").dataset.id;
      try {
        const res = await axios.post("/api/friend/delete", {
          id: remId,
        });
        location.reload();
      } catch (err) {
        showAlert("Something went wrong");
      }
    })
  );
});

socket.on("request", (fromUser, toUser, request) => {
  const ele = document.querySelector(".notification-center");
  const div = document.createElement("div");
  div.classList.add("noti-card");
  div.dataset.id = fromUser._id;
  const data = document.createElement("div");
  data.classList.add("noti-data");
  const head = document.createElement("div");
  head.classList.add("noti-head");
  head.innerText = `${fromUser.firstName[0].toUpperCase()}${fromUser.firstName.slice(
    1
  )} sent you a friend request`;
  const time = document.createElement("div");
  time.classList.add("noti-time");
  let timeText =
    timeSince(new Date(request.time).getTime()) == "0 second"
      ? "Just Now"
      : timeSince(new Date(request.time).getTime());
  time.innerText = timeText;
  data.append(head);
  data.append(time);
  div.append(data);
  const btns = document.createElement("div");
  btns.classList.add("noti-opt");
  btns.innerHTML = `<div class='noti-acc'>
    <i class='fa-solid fa-check' style='color:#fafafa'></i>
    </div>
    <div class='noti-dec'>
    <i class='fa-solid fa-x fa-sm' style='color:#fafafa'></i>
    </div>`;
  div.append(btns);
  ele.prepend(div);
  div.querySelector(".noti-acc").addEventListener("click", async (e) => {
    const id = e.target.closest(".noti-card").dataset.id;
    console.log(id);
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
  });

  div.querySelector(".noti-dec").addEventListener("click", async (e) => {
    const id = e.target.closest(".noti-card").dataset.id;
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
  });
});

socket.on("response", (toUser, request, status) => {
  const ele = document.querySelector(".notification-center");
  const div = document.createElement("div");
  div.classList.add("noti-card");
  div.dataset.id = request._id;
  const data = document.createElement("div");
  data.classList.add("noti-data");
  const head = document.createElement("div");
  head.classList.add("noti-head");
  console.log(status);
  head.innerText = `${toUser.firstName[0].toUpperCase()}${toUser.firstName.slice(
    1
  )} ${status == 2 ? "accepted" : "rejected"} your friend request`;
  const time = document.createElement("div");
  time.classList.add("noti-time");
  let timeText =
    timeSince(new Date(request.time).getTime()) == "0 second"
      ? "Just Now"
      : timeSince(new Date(request.time).getTime());
  time.innerText = timeText;
  data.append(head);
  data.append(time);
  div.append(data);
  const btns = document.createElement("div");
  btns.classList.add("noti-opt");
  btns.innerHTML = `
    <div class='noti-rem'>
    <i class='fa-solid fa-x fa-sm' style='color:#fafafa'></i>
    </div>`;
  div.append(btns);
  if (ele.querySelector(".noti-null")) {
    ele
      .querySelector(".noti-null")
      .parentElement.removeChild(ele.querySelector(".noti-null"));
  }
  ele.prepend(div);
  div.querySelector(".noti-rem").addEventListener("click", async (e) => {
    const remId = e.target.closest(".noti-card").dataset.id;
    try {
      const res = await axios.post("/api/friend/delete", {
        id: remId,
      });
      location.reload();
    } catch (err) {
      showAlert("Something went wrong");
    }
  });
});

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

document.querySelectorAll(".noti-dec").forEach((ele) =>
  ele.addEventListener("click", async (e) => {
    const id = e.target.closest(".noti-card").dataset.id;
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

document.querySelectorAll(".noti-rem").forEach((ele) =>
  ele.addEventListener("click", async (e) => {
    const remId = e.target.closest(".noti-card").dataset.id;
    try {
      const res = await axios.post("/api/friend/delete", {
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
    const res = await axios.get("/api/users/logout");
    showAlert("Logged Out Successfully", true);
    if (res.data.status == "success") location.href = "/login";
  } catch (err) {
    showAlert("Error logging out. Try again Later");
  }
};

if (document.querySelector("#logout"))
  document.querySelector("#logout").addEventListener("click", () => {
    logout();
  });

document.querySelectorAll(".noti-mark-rem").forEach((ele) =>
  ele.addEventListener("click", async (e) => {
    const remId = e.target.closest(".noti-card").dataset.id;
    try {
      const res = await axios.patch("/api/users/notify", {
        id: remId,
      });
      location.reload();
    } catch (err) {
      showAlert("Something went wrong");
    }
  })
);

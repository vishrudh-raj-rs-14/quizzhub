const socket = io();

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

socket.emit("joinquiz", document.querySelector(".leader-container").dataset.id);

socket.on("leaderboard", (quiz) => {
  let container = document.querySelector(".leader-content-c");
  container.innerHTML = "";
  quiz.takenBy.forEach((user, i) => {
    const ele = document.createElement("div");
    ele.classList.add("leader-user");
    ele.innerHTML = `<div class="leader-user-det">
    <div class="leader-serial">${i + 1}</div>
    <div class="leader-user-prof">
    ${
      user.user.profilePic
        ? `<a href="/${user.user._id}/profile">
    <div class="profile-pic-c">
    <img src="${
      user.user.profilePic.startsWith("http")
        ? `${user.user.profilePic}`
        : `/img/users/${user.user.profilePic}`
    }">
    </div></a>`
        : `<a href=/${user.user._id}/profile><div style="background-color :${
            user.user.color
          } !important;" class="profile">${user.user.firstName[0].toUpperCase()}</div></a>`
    }
    </div><div class="leader-user-text"><div class="leader-user-name">${user.user.firstName[0].toUpperCase()}${user.user.firstName.slice(
      1
    )} ${user.user.lastName[0].toUpperCase()}${user.user.lastName.slice(
      1
    )}</div><div class="leader-user-time">${
      user.user.email
    }</div></div></div><div class="leader-user-score">${
      user.time
        ? `<div class="lead-time">${timeSince(
            new Date(user.time).getTime()
          )}</div>`
        : ""
    }<div class="lead-score">${user.score}/${user.totalScore}</div></div>`;
    container.append(ele);
  });
});

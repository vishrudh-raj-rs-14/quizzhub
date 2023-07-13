export const hideAlert = function () {
  const ele = document.querySelector(".alert");
  if (ele) ele.parentElement.removeChild(ele);
};

export const showAlert = function (message, status = false) {
  hideAlert();
  const ele = document.createElement("div");
  ele.classList.add("alert");
  ele.innerHTML = message;
  if (status) {
    ele.classList.add("alert--success");
  } else {
    ele.classList.add("alert--error");
  }
  document.querySelector("body").append(ele);
  setTimeout(hideAlert, 2000);
};

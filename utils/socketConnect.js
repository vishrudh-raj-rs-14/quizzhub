let io;
let user;
exports.socketConnection = (server) => {
  io = require("socket.io")(server);
  io.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    if (user) {
      socket.join(String(user._id));
    }
    socket.on("joinquiz", (data) => {
      socket.join(data);
    });
    socket.on("disconnect", () => {
      console.info(`Client disconnected [id=${socket.id}]`);
    });
  });
};

exports.sendMark = (mark, totalMark) => {
  io.to(String(user._id)).emit("marks", mark, totalMark);
};

exports.sendRequest = (fromuser, touser, request) => {
  io.to(String(touser._id)).emit("request", fromuser, touser, request);
};

exports.sendResponse = (fromUserId, toUser, request, status) => {
  io.to(String(fromUserId)).emit("response", toUser, request, status);
};

exports.sendRequestNotification = (users, data) => {
  users.forEach((ele) => {
    io.to(ele).emit("notification", data, ele);
  });
};

exports.sendLeaderBoard = (data) => {
  io.to(String(data._id)).emit("leaderboard", data);
};

exports.setUser = (val) => {
  user = val;
};

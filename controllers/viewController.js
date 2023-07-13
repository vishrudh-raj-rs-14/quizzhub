const { listen } = require("../app");
const Quiz = require("../models/quizModel");
const User = require("../models/userModel");
const catchAync = require("../utils/catchAync");
const Request = require("../models/requestModel");
const AppError = require("../utils/appError");
const { default: mongoose } = require("mongoose");

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

exports.login = (req, res) => {
  res.status(200).render("login");
};
exports.signUp = (req, res) => {
  res.status(200).render("signUp");
};
exports.home = catchAync(async (req, res) => {
  let quizesquery = Quiz.find({
    $or: [
      { isPrivate: { $ne: true } },
      {
        $and: [
          { isPrivate: true },
          { user: { $in: [req.user._id, ...req.user.friends] } },
        ],
      },
    ],
  });
  let myReq;
  if (req.user)
    myReq = await Request.find({ $or: [{ to: req.user._id }] }).sort("-time");
  let resultReq;
  if (req.user)
    resultReq = await Request.find({
      from: req.user._id,
      status: { $in: [2, 3] },
    });
  if (req.query.name) {
    let filter = {
      $or: [
        { name: { $regex: req.query.name, $options: "i" } },
        { tags: { $regex: req.query.name, $options: "i" } },
      ],
    };
    quizesquery = quizesquery.find(filter);
  }
  const quizes = await quizesquery;
  res.status(200).render("home", {
    status: "success",
    quizes,
    timeSince,
    resultReq,
    myReq,
    name: req.query.name,
  });
});

exports.friends = catchAync(async (req, res) => {
  const me = await User.findById(req.user._id);
  let myReq;
  if (req.user) myReq = await Request.find({ to: req.user._id }).sort("-time");
  let userQuery = User.find({ _id: { $ne: me._id } });
  if (req.query.name) {
    let filter = {
      $or: [
        { firstName: { $regex: req.query.name, $options: "i" } },
        { lastName: { $regex: req.query.name, $options: "i" } },
        { email: { $regex: req.query.name, $options: "i" } },
        // { tags: { $regex: req.query.name, $options: "i" } },
      ],
    };
    userQuery = userQuery.find(filter);
  }
  let resultReq = await Request.find({
    from: req.user._id,
    status: { $in: [2, 3] },
  });
  const users = await userQuery;
  const reqs = await Request.find({ from: req.user._id });
  const idList = reqs.map((ele) => String(ele.to._id));
  const toMeIdList = myReq.map((ele) => String(ele.from._id));
  let friendList;
  if (me.friends) {
    friendList = me.friends.map((ele) => String(ele));
  }
  console.log(friendList);
  res.render("friends", {
    users,
    reqs,
    idList,
    myReq,
    toMeIdList,
    resultReq,
    friendList,
    timeSince,
  });
});

exports.profile = catchAync(async (req, res) => {
  const myQuizes = await Quiz.find({ user: req.user._id }).find({
    $or: [
      { isPrivate: { $ne: true } },
      {
        $and: [
          { isPrivate: true },
          { user: { $in: [req.user._id, ...req.user.friends] } },
        ],
      },
    ],
  });
  let myReq;
  if (req.user)
    myReq = await Request.find({ $or: [{ to: req.user._id }] }).sort("-time");
  let resultReq;
  if (req.user)
    resultReq = await Request.find({
      from: req.user._id,
      status: { $in: [2, 3] },
    });
  const curUser = await User.findById(req.user._id).populate({
    path: "quizesTaken",
    populate: {
      path: "quiz",
      populate: {
        path: "user",
      },
    },
  });
  curUser.quizesTaken.sort((a, b) => new Date(b.time) - new Date(a.time));
  res.status(200).render("profile", {
    myQuizes,
    curUser,
    canEdit: true,
    timeSince,
  });
});

exports.otherProfile = catchAync(async (req, res) => {
  let myReq;
  if (req.user)
    myReq = await Request.find({ $or: [{ to: req.user._id }] }).sort("-time");
  let resultReq;
  if (req.user)
    resultReq = await Request.find({
      from: req.user._id,
      status: { $in: [2, 3] },
    });
  const myUsers = await User.findById(req.params.id).populate({
    path: "quizesTaken",
    populate: {
      path: "quiz",
      populate: {
        path: "user",
      },
    },
  });
  const myQuizes = await Quiz.find({ user: myUsers._id }).find({
    $or: [
      { isPrivate: { $ne: true } },
      {
        $and: [
          { isPrivate: true },
          { user: { $in: [req.user._id, ...req.user.friends] } },
        ],
      },
    ],
  });
  myUsers.quizesTaken.sort((a, b) => new Date(b.time) - new Date(a.time));
  let canEdit = false;
  if (String(myUsers._id) == String(req.user._id)) canEdit = true;
  res.status(200).render("profile", {
    curUser: myUsers,
    myQuizes,
    myReq,
    resultReq,
    timeSince,
    canEdit,
  });
});

exports.create = (req, res) => {
  res.status(200).render("createQuiz");
};

exports.quizInfo = catchAync(async (req, res, next) => {
  let myReq;
  if (req.user)
    myReq = await Request.find({ $or: [{ to: req.user._id }] }).sort("-time");
  let resultReq;
  if (req.user)
    resultReq = await Request.find({
      from: req.user._id,
      status: { $in: [2, 3] },
    });
  const quiz = await Quiz.find({
    $or: [
      { isPrivate: { $ne: true } },
      {
        $and: [
          { isPrivate: true },
          { user: { $in: [req.user._id, ...req.user.friends] } },
        ],
      },
    ],
  }).findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
  console.log(quiz);
  if (!quiz || quiz.length == 0) {
    return next(
      new AppError("The quiz doesn't exist or you can't take this quiz", 404)
    );
  }
  res.render("quizInfo", {
    quiz,
    myReq,
    timeSince,
    resultReq,
  });
});

exports.quiz = catchAync(async (req, res, next) => {
  const quiz = await Quiz.find({
    $or: [
      { isPrivate: { $ne: true } },
      {
        $and: [
          { isPrivate: true },
          { user: { $in: [req.user._id, ...req.user.friends] } },
        ],
      },
    ],
  }).findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
  if (!quiz || quiz.length == 0) {
    return next(
      new AppError("The quiz doesn't exist or you can't take this quiz", 404)
    );
  }
  res.render("takeQuiz", {
    quiz,
  });
});

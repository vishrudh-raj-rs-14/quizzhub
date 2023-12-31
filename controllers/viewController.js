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
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const rootDurl = "http://auth.delta.nitt.edu/authorize";
  const options = {
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
  };
  const doptions = {
    redirect_uri: process.env.DELTA_OAUTH_REDIRECT_URL,
    client_id: process.env.DELTA_CLIENT_ID,
    grant_type: "authorization_code",
    response_type: "code",
    scope: "user",
  };
  const qs = new URLSearchParams(options);
  const qsd = new URLSearchParams(doptions);

  const url = `${rootUrl}?${qs.toString()}`;
  const durl = `${rootDurl}?${qsd.toString()}`;
  res.status(200).render("login", {
    url,
    durl,
  });
};
exports.signUp = (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const rootDurl = "http://auth.delta.nitt.edu/authorize";
  const options = {
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
  };
  const doptions = {
    redirect_uri: process.env.DELTA_OAUTH_REDIRECT_URL,
    client_id: process.env.DELTA_CLIENT_ID,
    grant_type: "authorization_code",
    response_type: "code",
    scope: "user",
  };
  const qs = new URLSearchParams(options);
  const qsd = new URLSearchParams(doptions);

  const url = `${rootUrl}?${qs.toString()}`;
  const durl = `${rootDurl}?${qsd.toString()}`;
  res.status(200).render("signUp", {
    url,
    durl,
  });
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
    }).sort("-time");
  if (req.query.name) {
    let filter = {
      $or: [
        { name: { $regex: req.query.name, $options: "i" } },
        { tags: { $regex: req.query.name, $options: "i" } },
      ],
    };
    quizesquery = quizesquery.find(filter);
  }
  const marksData = await User.findById(req.user._id)
    .select("quizesTaken")
    .populate({
      path: "quizesTaken",
      populate: {
        path: "quiz",
      },
    });
  const marks = marksData.quizesTaken.filter((ele) => ele.notified != true);
  let allReqs = [...myReq, ...resultReq, ...marks].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );
  const quizes = await quizesquery;
  res.status(200).render("home", {
    status: "success",
    quizes,
    timeSince,
    resultReq,
    myReq,
    name: req.query.name,
    allReqs,
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
  const idList = reqs
    .filter((ele) => ele.status == 1)
    .map((ele) => String(ele.to._id));
  const toMeIdList = myReq
    .filter((ele) => ele.status == 1)
    .map((ele) => String(ele.from._id));
  let friendList;
  if (me.friends) {
    friendList = me.friends.map((ele) => String(ele));
  }
  const marksData = await User.findById(req.user._id)
    .select("quizesTaken")
    .populate({
      path: "quizesTaken",
      populate: {
        path: "quiz",
      },
    });
  const marks = marksData.quizesTaken.filter((ele) => ele.notified != true);
  let allReqs = [...myReq, ...resultReq, ...marks].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );
  res.render("friends", {
    users,
    reqs,
    idList,
    myReq,
    toMeIdList,
    resultReq,
    friendList,
    timeSince,
    allReqs,
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
  const marksData = await User.findById(req.user._id)
    .select("quizesTaken")
    .populate({
      path: "quizesTaken",
      populate: {
        path: "quiz",
      },
    });
  const marks = marksData.quizesTaken.filter((ele) => ele.notified != true);
  let allReqs = [...myReq, ...resultReq, ...marks].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );
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
    allReqs,
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
  const marksData = await User.findById(req.user._id)
    .select("quizesTaken")
    .populate({
      path: "quizesTaken",
      populate: {
        path: "quiz",
      },
    });
  const marks = marksData.quizesTaken.filter((ele) => ele.notified != true);
  let allReqs = [...myReq, ...resultReq, ...marks].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );
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
    allReqs,
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
  const marksData = await User.findById(req.user._id)
    .select("quizesTaken")
    .populate({
      path: "quizesTaken",
      populate: {
        path: "quiz",
      },
    });
  const marks = marksData.quizesTaken.filter((ele) => ele.notified != true);
  let allReqs = [...myReq, ...resultReq, ...marks].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );
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
  res.render("quizInfo", {
    quiz,
    myReq,
    timeSince,
    resultReq,
    allReqs,
  });
});

exports.leaderboard = catchAync(async (req, res, next) => {
  let myReq;
  if (req.user)
    myReq = await Request.find({ $or: [{ to: req.user._id }] }).sort("-time");
  let resultReq;
  if (req.user)
    resultReq = await Request.find({
      from: req.user._id,
      status: { $in: [2, 3] },
    });
  const marksData = await User.findById(req.user._id)
    .select("quizesTaken")
    .populate({
      path: "quizesTaken",
      populate: {
        path: "quiz",
      },
    });
  const marks = marksData.quizesTaken.filter((ele) => ele.notified != true);
  let allReqs = [...myReq, ...resultReq, ...marks].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );
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
  })
    .findOne({ _id: new mongoose.Types.ObjectId(req.params.id) })
    .populate({ path: "takenBy", populate: { path: "user" } });
  if (!quiz || quiz.length == 0) {
    return next(
      new AppError("The quiz doesn't exist or you can't take this quiz", 404)
    );
  }
  quiz.takenBy
    .sort((a, b) => a.time - b.time)
    .sort((a, b) => b.score - a.score);
  res.render("leaderboard", {
    quiz,
    myReq,
    timeSince,
    resultReq,
    allReqs,
    timeSince,
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

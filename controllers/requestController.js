const mongoose = require("mongoose");
const Request = require("../models/requestModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAync = require("../utils/catchAync");
const {
  sendRequest,
  sendResponse,
  sendRequestNotification,
} = require("../utils/socketConnect");

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

notifiFrontend = catchAync(async (user, req) => {
  let myReq;
  if (req.user)
    myReq = await Request.find({ $or: [{ to: user }] }).sort("-time");
  console.log(myReq);
  let resultReq;
  if (req.user)
    resultReq = await Request.find({
      from: user,
      status: { $in: [2, 3] },
    }).sort("-time");
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
  sendRequestNotification([String(user)], allReqs);
});

exports.sendFriendRequest = catchAync(async (req, res, next) => {
  if (!req.body.to)
    return next(new AppError("A recipient has to be provided", 400));
  const data = {};
  const user = await User.findById(req.user._id);
  data.from = user._id;
  data.to = new mongoose.Types.ObjectId(req.body.to);
  const result = await Request.find({
    from: data.from,
    to: data.to,
    status: { $ne: 3 },
  });
  if (!result || result.length)
    return next(new AppError("A request has already been sent", 400));
  const toUser = await User.findById(new mongoose.Types.ObjectId(req.body.to));
  data.status = 1;
  data.time = Date.now();
  const request = await Request.create(data);

  await notifiFrontend(toUser._id, req);
  res.status(200).json({
    status: "success",
    request,
  });
});

exports.respondToRequest = catchAync(async (req, res, next) => {
  if (!req.body.from)
    return next(new AppError("A sender has to be specified", 400));
  if (!req.body.status)
    return next(
      new AppError("A status of the request has to be specified", 400)
    );
  if (![1, 2, 3].includes(Number(req.body.status)))
    return next(new AppError("This status can't be found"));

  const document = await Request.findOne({
    from: new mongoose.Types.ObjectId(req.body.from),
    to: req.user._id,
  });
  if (!document) {
    return next(new AppError("Sorry, This request does not exist"));
  }
  const doc = await Request.findOneAndUpdate(
    { from: new mongoose.Types.ObjectId(req.body.from), to: req.user._id },
    { status: req.body.status },
    {
      new: true,
      runValidators: true,
    }
  );
  if (req.body.status == 2) {
    await User.findByIdAndUpdate(req.body.from, {
      $push: { friends: req.user._id },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { friends: new mongoose.Types.ObjectId(req.body.from) },
    });
  }
  const toUser = await User.findById(req.user._id);
  await notifiFrontend(new mongoose.Types.ObjectId(req.body.from), req);
  res.status(200).json({
    status: "success",
    data: doc,
  });
});

exports.getAllRequest = catchAync(async (req, res, next) => {
  const data = await Request.find();
  res.status(200).json({
    status: "success",
    data,
  });
});

exports.removeRequest = catchAync(async (req, res, next) => {
  if (req.body.id) {
    const id = req.body.id;
    await Request.findByIdAndDelete(id);
  } else if (req.body.to) {
    await Request.deleteMany({
      from: req.user._id,
      to: new mongoose.Types.ObjectId(req.body.to),
    });
  } else {
    return next(new AppError("Required information is not given", 400));
  }
  await notifiFrontend(req.body.to, req);
  res.status(200).json({
    status: "success",
  });
});

exports.unFriend = catchAync(async (req, res, next) => {
  if (!req.body.friend)
    return next(AppError("Mention the person you want to unfriend"));
  await User.updateOne(
    { _id: req.user._id },
    { $pull: { friends: new mongoose.Types.ObjectId(req.body.friend) } }
  );
  await User.updateOne(
    { _id: new mongoose.Types.ObjectId(req.body.friend) },
    { $pull: { friends: req.user._id } }
  );
  await Request.findOneAndDelete({
    from: req.user._id,
    to: new mongoose.Types.ObjectId(req.body.friend),
  });
  await Request.findOneAndDelete({
    to: req.user._id,
    from: new mongoose.Types.ObjectId(req.body.friend),
  });

  res.status(200).json({
    status: "success",
  });
});

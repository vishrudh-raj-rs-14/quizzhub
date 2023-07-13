const mongoose = require("mongoose");
const Request = require("../models/requestModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAync = require("../utils/catchAync");

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

  data.status = 1;
  data.time = Date.now();
  const request = await Request.create(data);
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
    from: req.body.from,
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
  console.log(req.body);
  if (req.body.id) {
    const id = req.body.id;
    await Request.findByIdAndDelete(id);
  } else if (req.body.to) {
    await Request.findOneAndDelete({
      from: req.user._id,
      to: new mongoose.Types.ObjectId(req.body.to),
    });
  } else {
    return next(new AppError("Required information is not given", 400));
  }
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

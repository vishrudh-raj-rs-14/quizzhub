const User = require("../models/userModel");
const catchAync = require("../utils/catchAync");
const sharp = require("sharp");
const multer = require("multer");
const AppError = require("../utils/appError");

// const multerStroage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStroage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "The given file is not a image. Please upload an image",
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStroage,
  fileFilter: multerFilter,
});

exports.uploadSinglePhoto = upload.single("photo");

exports.resizeUserPhoto = catchAync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

module.exports.getAllUsers = catchAync(async (req, res, next) => {
  let filter = {};
  if (req.query.name) {
    filter = { name: { $regex: req.query.name, $options: "i" } };
  }
  const users = await User.find(filter);
  res.status(200).json({
    status: "success",
    results: users.length,
    users,
  });
});

module.exports.updateMe = catchAync(async (req, res, next) => {
  const updatedUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };
  if (req.file) updatedUser.profilePic = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user._id, updatedUser, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    user,
  });
});

module.exports.notify = catchAync(async (req, res, next) => {
  if (!req.body.id) {
    return next(new AppError("Specify the quiz that notified you"));
  }
  // console.log();
  await User.updateOne(
    { "quizesTaken._id": req.body.id },
    { $set: { "quizesTaken.$[val].notified": true } },
    {
      arrayFilters: [
        {
          "val._id": req.body.id,
        },
      ],
    }
  );
  res.status(200).json({
    status: "success",
  });
});

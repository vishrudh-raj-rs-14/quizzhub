const Quiz = require("../models/quizModel");
const User = require("../models/userModel");
const sharp = require("sharp");
const multer = require("multer");
const APIFeatures = require("../utils/apiFeatures");
const catchAync = require("../utils/catchAync");
const { io } = require("../app");
const {
  sendMark,
  sendRequestNotification,
  sendLeaderBoard,
} = require("../utils/socketConnect");
const Request = require("../models/requestModel");

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

const notifiFrontend = catchAync(async (user, req) => {
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

const upload = multer({
  storage: multerStroage,
  fileFilter: multerFilter,
});

module.exports.uploadImageFiles = upload.array("images", 15);

module.exports.processImages = catchAync(async (req, res, next) => {
  if (!req.files) return next();
  let fileNames = [];
  let processed = [];
  let p = 0;
  for (let i = 0; i < JSON.parse(req.body.imgPos).length; i++) {
    if (JSON.parse(req.body.imgPos)[i] != 0) {
      processed.push([i, req.files[p]]);
      p += 1;
    }
  }
  await Promise.all(
    processed.map(async (ele, i) => {
      const fileName = `quiz-${req.user.id}-${Date.now()}-${ele[0] + 1}.jpg`;
      await sharp(processed[i][1].buffer)
        .resize(650, 365)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/quizzes/${fileName}`);

      fileNames[processed[i][0]] = fileName;
    })
  );
  req.body.fileNames = fileNames;
  next();
});

module.exports.createQuiz = catchAync(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.takenBy = [];
  let questions = JSON.parse(req.body.questions);
  if (req.body.fileNames)
    questions.forEach((ele, i) => {
      if (req.body.fileNames[i]) {
        ele.image = req.body.fileNames[i];
      }
    });
  const data = {
    user: req.user.id,
    name: req.body.name,
    description: req.body.description,
    difficulty: req.body.difficulty,
    tags: JSON.parse(req.body.tags),
    isPrivate: JSON.parse(req.body.isPrivate),
    questions,
    takenBy: req.body.takenBy,
  };
  const quiz = await Quiz.create(data);
  res.status(200).json({
    status: "success",
    quiz,
  });
});

module.exports.getAllQuiz = catchAync(async (req, res, next) => {
  let filter = {};
  if (req.params.id) filter.user = req.params.id;
  const Quizquery = new APIFeatures(Quiz.find(filter), req.query);
  const quiz = await Quizquery.query;
  res.status(200).json({
    status: "success",
    results: quiz.length,
    quiz,
  });
});

module.exports.evaluate = catchAync(async (req, res, next) => {
  let answers = req.body.answers;
  let quizId = req.params.id;
  const quiz = await Quiz.findById(quizId).populate({
    path: "takenBy",
    populate: { path: "user" },
  });
  const user = await User.findById(req.user._id);
  let marks = 0;
  let totMarks = 0;
  quiz.questions.forEach((ele, i) => {
    if (ele.correctAnswer == answers[i]) {
      if (ele.totalMarks) {
        marks += ele.totalMarks;
      } else {
        marks += 1;
      }
    }
    if (ele.totalMarks) {
      totMarks += ele.totalMarks;
    } else {
      totMarks += 1;
    }
  });

  const resultQuiz = await Quiz.updateOne(
    { _id: quiz._id },
    {
      $push: {
        takenBy: {
          user: user._id,
          score: marks,
          totalScore: totMarks,
          time: Date.now(),
        },
      },
    }
  );

  const resultUser = await User.updateOne(
    { _id: user._id },
    {
      $push: {
        quizesTaken: {
          quiz: quiz._id,
          time: Date.now(),
          score: marks,
          totalScore: totMarks,
        },
      },
    }
  );
  // io.emit("connection")
  // sendMark(marks, totMarks);
  const newQuiz = await Quiz.findById(quizId).populate({
    path: "takenBy",
    populate: { path: "user" },
  });
  newQuiz.takenBy
    .sort((a, b) => a.time - b.time)
    .sort((a, b) => b.score - a.score);
  sendLeaderBoard(newQuiz);
  await notifiFrontend(req.user._id, req);
  res.status(200).json({
    status: "success",
    marks,
    totalMarks: totMarks,
  });
});

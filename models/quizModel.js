const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
  questionName: {
    type: String,
    required: [true, "A heading is mandratory for a question"],
  },
  questionDesc: String,
  image: String,
  options: {
    type: [String],
    required: [true, "Options are rquired for a question"],
    validate: {
      validator: function () {
        return this.options.length >= 2 && this.options.length <= 4;
      },
      message:
        "A question can have a minimum of 2 options and a maximum of 4 options",
    },
  },
  correctAnswer: {
    type: Number,
    min: 1,
    max: 4,
    required: [true, "A correct answer is required for the question"],
    validate: [Number.isInteger, "Options should be 1,2,3 or 4"],
  },
  totalMarks: {
    type: Number,
    min: 1,
    validate: [Number.isInteger, "Total marks can only be an integer"],
  },
  takenBy: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: "User" },
      time: { type: Date, default: Date.now() },
      score: Number,
    },
  ],
});

const quiz = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A quiz must belong to a user"],
  },
  name: {
    type: String,
    required: [true, "A quiz requires a name"],
  },
  description: {
    type: String,
    required: [true, "A quiz requires a description"],
  },
  questions: {
    type: [questionSchema],
    validate: [
      {
        validator: function () {
          return this.questions.length >= 1;
        },
        message: "A quiz should have atleast 1 question",
      },
      {
        validator: function () {
          return this.questions.length <= 15;
        },
        message: "A quiz can have a maximum of 15 questions",
      },
    ],
  },
  tags: {
    type: [String],
    validate: {
      validator: function () {
        return this.tags.length >= 1;
      },
      message: "A quiz should have atleast one tag",
    },
  },
  takenBy: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: "User" },
      score: Number,
      totalScore: Number,
    },
  ],
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

quiz.pre(/^find/, function () {
  this.populate({
    path: "user",
  });
});

const Quiz = mongoose.model("Quiz", quiz);

module.exports = Quiz;

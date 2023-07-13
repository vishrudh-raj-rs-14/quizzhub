const mongoose = require("mongoose");
const validators = require("validator");
const catchAync = require("../utils/catchAync");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is Mandoratory"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is Mandoratory"],
      trim: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is Compulsory"],
      lowercase: true,
      validate: [validators.isEmail, "Given email is invalid"],
    },
    profilePic: String,
    password: {
      type: String,
      required: [true, "password is mandratory"],
      minlength: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Confirm Password is mandratory"],
      validate: {
        validator: function (val) {
          return val == this.password;
        },
        message: "Password and Confirm Password does not match",
      },
    },
    google: { type: Boolean, default: false },
    dauth: { type: Boolean, default: false },
    friends: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    quizesTaken: [
      {
        quiz: { type: mongoose.Schema.ObjectId, ref: "Quiz" },
        time: { type: Date, default: Date.now() },
        score: Number,
        totalScore: Number,
      },
    ],
    color: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.virtual("quizesCreated", {
  ref: "Quiz",
  foreignField: "user",
  localField: "_id",
});

userSchema.methods.checkPasswords = async (given, actual) => {
  return await bcrypt.compare(given, actual);
};

const User = mongoose.model("User", userSchema);

module.exports = User;

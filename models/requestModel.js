const mongoose = require("mongoose");

const requestSchema = mongoose.Schema({
  from: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A request must be sent from someone"],
  },
  to: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A request must be sent to someone"],
  },
  status: {
    type: Number,
    enum: [1, 2, 3],
  },
  time: {
    type: Date,
    default: Date.now(),
  },
});

requestSchema.pre(/^find/, function () {
  this.populate("from").populate("to");
});

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;

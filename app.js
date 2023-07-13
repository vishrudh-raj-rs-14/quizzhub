const express = require("express");
const path = require("path");
const app = express();
const morgan = require("morgan");
const userRouter = require("./routes/userRouter");
const quizRouter = require("./routes/quizRouter");
const friendRouter = require("./routes/friendRouter");
const compression = require("compression");
const viewRouter = require("./routes/viewRoutes");
const errorHandler = require("./controllers/errorController");
const cookieParser = require("cookie-parser");
const cors = require("cors");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
// app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "10kb" }));
app.use(compression());
app.use("/", viewRouter);
app.use("/api/users", userRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/friend", friendRouter);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: "Page not Found",
  });
});

app.use(errorHandler);

module.exports = app;

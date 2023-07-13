const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const PORT = process.env.PORT || 5500;

const DB = process.env.MONGO_CONNECTION_STRING.replace(
  "<PASSWORD>",
  process.env.DB_PASSSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => console.log("Connection to DataBase Successful"));

app.listen(PORT, () => {
  console.log("App Starting...");
});

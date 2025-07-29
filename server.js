//START SERVER AND CONNECT TO MONGODB

// require("dotenv").config({ path: "./config.env" }); // To Read .env file and set key value to node environment
require("dotenv").config(); // To Read .env file and set key value to node environment

const app = require("./app"); // Require app.js file

const mongoose = require("mongoose");
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.set("strictQuery", false); // mongoose new version we have to set this to true or false otherwise will keep givig warning
// console.log(process.env.DATABASE);
mongoose
  .connect(DB)
  .then(() => console.log("DB CONNECTED SUCCESSFULLY..."))
  .catch((err) => console.log("❌ Database connection failed:", err));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is listening at PORT: ${PORT}...`);
});

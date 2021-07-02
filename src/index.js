const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const app = express();

//imports
const userRoutes = require("./routes/routes");
//settings

app.set("port", 3000);

//middlewares

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use(userRoutes);

//run
app.listen(app.get("port"), () => {
  console.log("Server corriendo en puerto 3000");
});

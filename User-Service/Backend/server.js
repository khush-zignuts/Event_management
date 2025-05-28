require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const { socketSetup } = require("./config/socketIo");
const bodyParser = require("body-parser");
const cors = require("cors"); // <-- Import cors
const sequelize = require("./config/db");

const routes = require("./api/routes/index");

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: "*",
    // origin: ["http://localhost:5173", , "http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
//127.0.0.1:5500/api/public/chat.html
//Routes
app.use("/api", routes);

// Static files
// app.use(express.static(path.join(__dirname, "api", "public")));

// Root route
app.get("/", (req, res) => {
  // res.sendFile(path.join(__dirname, "api", "public", "login.html"));
});
// at last port call :
const PORT = process.env.PORT;

server.listen(PORT, async () => {
  // Sync Database and Start Server
  try {
    socketSetup(server);
    // await sequelize.sync({ alter: true }); // or { force: true } to drop & recreate tables (CAUTION)
    // await sequelize.sync({ force: true });
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.log(error.message);
  }
});

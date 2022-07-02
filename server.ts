import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import https from "https";
// DATABASE
import Database from "./Configs/Database";
// CONFIGS
import ResponseHandler from "./Configs/ResponseHandler";
// PARSE ENV
dotenv.config();
Database();

const app = express();
const port = process.env.PORT || 8000;

// CHECK WHICH PROTOCOL TO USE
const SHOULD_RUN_ON_HTTP = process.env.SHOULD_RUN_ON_HTTP;
const connection = SHOULD_RUN_ON_HTTP === "true" ? http : https;

// SSL CONFIG
// const options = { key: fs.readFileSync(__dirname + "/SSL/key.pem"), cert: fs.readFileSync(__dirname + "/SSL/cert.pem") };
// require("./Configs/globals"); // GLOBAL SETTINGS FILES

// const server = SHOULD_RUN_ON_HTTP == "true" ? http.createServer(app) : http.createServer(options, app);
const server = connection.createServer(app);

// ------------------------      GLOBAL MIDDLEWARE -------------------------
app.use(cors()); // ALLOWED ALL CROSS ORIGIN REQUESTS
app.use(express.json({ limit: "5mb" })); // ALLOW APPLICATION JSON
app.use(express.urlencoded({ extended: false })); // ALLOW URL ENCODED PARSER
app.use(express.static(__dirname + "/Assets")); // SERVE STATIC IMAGES FROM ASSETS FOLDER
app.set("view engine", "ejs"); // SET THE VIEW ENGINE TO EJS

// ------------------------    RESPONSE HANDLER    -------------------
app.use((req, res, next) => {
	res.handler = new ResponseHandler(req, res);
	next();
});

// --------------------------    ROUTES    ------------------
import Routes from "./Routes";
Routes(app);

// --------------------------    START SERVER    ---------------------
server.listen(port, () => console.log(`\nServer started on ${port} :) \n`));

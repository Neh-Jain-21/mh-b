import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import https from "https";
import localtunnel from "localtunnel";
// CONFIGS
import ResponseHandler from "./Configs/ResponseHandler";
// PARSE ENV
dotenv.config();
// DATABASE CONNECTION
import "./Database/Database";

const app = express();
const port = process.env.PORT || (8000).toString();

// CHECK WHICH PROTOCOL TO USE
const SHOULD_RUN_ON_HTTP = process.env.SHOULD_RUN_ON_HTTP;
const connection = SHOULD_RUN_ON_HTTP === "true" ? http : https;

// SSL CONFIG
// const options = { key: fs.readFileSync(__dirname + "/SSL/key.pem"), cert: fs.readFileSync(__dirname + "/SSL/cert.pem") };
// require("./Configs/globals"); // GLOBAL SETTINGS FILES

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
server.listen(port, () => {
	// START ON PUBLIC NETWORK
	console.log("\x1b[32m%s\x1b[0m", "Compiled Successfully!");
	console.log(`\n Local:\t\t http://localhost:${process.env.PORT}`);

	// (async () => {
	// 	const tunnel = await localtunnel({ port: parseInt(port), subdomain: process.env.APP_NAME });

	// 	console.log(` Public:\t ${tunnel.url}\n`);
	// })();
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
// CONFIGS
const ResponseHandler_1 = __importDefault(require("./Configs/ResponseHandler"));
// PARSE ENV
dotenv_1.default.config();
// DATABASE CONNECTION
require("./Configs/Database");
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
// CHECK WHICH PROTOCOL TO USE
const SHOULD_RUN_ON_HTTP = process.env.SHOULD_RUN_ON_HTTP;
const connection = SHOULD_RUN_ON_HTTP === "true" ? http_1.default : https_1.default;
// SSL CONFIG
// const options = { key: fs.readFileSync(__dirname + "/SSL/key.pem"), cert: fs.readFileSync(__dirname + "/SSL/cert.pem") };
// require("./Configs/globals"); // GLOBAL SETTINGS FILES
const server = connection.createServer(app);
// ------------------------      GLOBAL MIDDLEWARE -------------------------
app.use((0, cors_1.default)()); // ALLOWED ALL CROSS ORIGIN REQUESTS
app.use(express_1.default.json({ limit: "5mb" })); // ALLOW APPLICATION JSON
app.use(express_1.default.urlencoded({ extended: false })); // ALLOW URL ENCODED PARSER
app.use(express_1.default.static(__dirname + "/Assets")); // SERVE STATIC IMAGES FROM ASSETS FOLDER
app.set("view engine", "ejs"); // SET THE VIEW ENGINE TO EJS
// ------------------------    RESPONSE HANDLER    -------------------
app.use((req, res, next) => {
    res.handler = new ResponseHandler_1.default(req, res);
    next();
});
// --------------------------    ROUTES    ------------------
const Routes_1 = __importDefault(require("./Routes"));
(0, Routes_1.default)(app);
// --------------------------    START SERVER    ---------------------
server.listen(port, () => console.log(`\nServer started on ${port} :)`));

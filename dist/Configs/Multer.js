"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const Multer = (storagePath, type) => {
    const storageCover = multer_1.default.diskStorage({
        destination: (req, file, callback) => {
            callback(null, storagePath);
        },
        filename: (req, file, callback) => {
            let fileName = "";
            if (type === "coverImg") {
                fileName = req.body.id + "_cover" + path_1.default.extname(file.originalname);
                callback(null, fileName);
                file.originalname = fileName;
            }
            else if (type === "profileImg") {
                fileName = req.body.id + "_profile" + path_1.default.extname(file.originalname);
                callback(null, fileName);
                file.originalname = fileName;
            }
            else if (type === "uploadMedia") {
                const id = (0, uuid_1.v4)();
                fileName = id + path_1.default.extname(file.originalname);
                callback(null, fileName);
                file.originalname = fileName;
            }
            else {
                console.log("Invalid Type");
            }
        },
    });
    return (0, multer_1.default)({ storage: storageCover });
};
module.exports = Multer;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
if (process.env.DB_DATABASE && process.env.DB_USERNAME && process.env.DB_PASSWORD) {
    const run = () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mongoose_1.connect)(`mongodb+srv://neh:nehujain21@cluster0.em7em.mongodb.net/?retryWrites=true&w=majority/mediahost`);
    });
    run()
        .then(() => {
        console.log("Connected to database :)");
    })
        .catch((reason) => {
        console.log(reason);
        console.error("Unable to connect to the database :(");
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserTokensSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId, required: [true, "User ID is required!"], ref: "Users" },
    token: { type: mongoose_1.Schema.Types.String, required: [true, "Token is required!"] },
});
const UserTokens = (0, mongoose_1.model)("UserTokens", UserTokensSchema);
exports.default = UserTokens;

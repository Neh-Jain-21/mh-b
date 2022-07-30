"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UsersSchema = new mongoose_1.Schema({
    username: { type: mongoose_1.Schema.Types.String, required: [true, "Username is required!"], unique: true },
    email: { type: mongoose_1.Schema.Types.String, required: [true, "Email is required!"], unique: true },
    password: { type: mongoose_1.Schema.Types.String, required: [true, "Password is required!"] },
    name: { type: mongoose_1.Schema.Types.String, required: false },
    tagline: { type: mongoose_1.Schema.Types.String, required: false },
    bio: { type: mongoose_1.Schema.Types.String, required: false },
    profile_img: { type: mongoose_1.Schema.Types.String, required: false },
    cover_img: { type: mongoose_1.Schema.Types.String, required: false },
    web_link: { type: mongoose_1.Schema.Types.String, required: false },
    twitter_link: { type: mongoose_1.Schema.Types.String, required: false },
    meta_link: { type: mongoose_1.Schema.Types.String, required: false },
    instagram_link: { type: mongoose_1.Schema.Types.String, required: false },
    otp: { type: mongoose_1.Schema.Types.String, required: false },
    is_active: { type: mongoose_1.Schema.Types.Boolean, required: false, default: false },
    tokens: [{ type: mongoose_1.Types.ObjectId, ref: "UserTokens" }],
});
const Users = (0, mongoose_1.model)("Users", UsersSchema);
exports.default = Users;

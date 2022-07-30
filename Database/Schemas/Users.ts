import { Schema, model, Types } from "mongoose";

interface IUsers {
	username: string;
	email: string;
	password: string;
	name?: string | null;
	tagline?: string | null;
	bio?: string | null;
	profile_img?: string | null;
	cover_img?: string | null;
	web_link?: string | null;
	twitter_link?: string | null;
	meta_link?: string | null;
	instagram_link?: string | null;
	otp?: string | null;
	is_active: boolean;
	tokens: { type: Types.ObjectId; ref: "UserTokens" }[];
}

const UsersSchema = new Schema<IUsers>({
	username: { type: Schema.Types.String, required: [true, "Username is required!"], unique: true },
	email: { type: Schema.Types.String, required: [true, "Email is required!"], unique: true },
	password: { type: Schema.Types.String, required: [true, "Password is required!"] },
	name: { type: Schema.Types.String, required: false },
	tagline: { type: Schema.Types.String, required: false },
	bio: { type: Schema.Types.String, required: false },
	profile_img: { type: Schema.Types.String, required: false },
	cover_img: { type: Schema.Types.String, required: false },
	web_link: { type: Schema.Types.String, required: false },
	twitter_link: { type: Schema.Types.String, required: false },
	meta_link: { type: Schema.Types.String, required: false },
	instagram_link: { type: Schema.Types.String, required: false },
	otp: { type: Schema.Types.String, required: false },
	is_active: { type: Schema.Types.Boolean, required: false, default: false },
	tokens: [{ type: Types.ObjectId, ref: "UserTokens" }],
});

const Users = model<IUsers>("Users", UsersSchema);

export default Users;

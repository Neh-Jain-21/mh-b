import { model, Schema, Types } from "mongoose";

interface IUserTokens {
	user_id: Types.ObjectId;
	token: string;
}

const UserTokensSchema = new Schema<IUserTokens>({
	user_id: { type: Schema.Types.ObjectId, required: [true, "User ID is required!"], ref: "Users" },
	token: { type: Schema.Types.String, required: [true, "Token is required!"] },
});

const UserTokens = model<IUserTokens>("UserTokens", UserTokensSchema);

export default UserTokens;

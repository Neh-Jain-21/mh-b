import bcrypt from "bcrypt";

const Encrypt = {
	/**
	 * Encrypts password with bcrypt
	 * @param password string
	 * @returns Promise<string>
	 */
	cryptPassword: (password: string) =>
		bcrypt
			.genSalt(10)
			.then((salt) => bcrypt.hash(password, salt))
			.then((hash) => hash),

	/**
	 * Compares passwrod
	 * @param password string
	 * @param hashPassword string
	 * @returns Promise<boolean>
	 */
	comparePassword: (password: string, hashPassword: string) => bcrypt.compare(password, hashPassword).then((resp) => resp),
};

export = Encrypt;

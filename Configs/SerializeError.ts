"use strict";

interface Error {
	name: string;
	message: string;
	stack?: string;
}

const destroyCircular = (from: Error, seen: Error[]) => {
	const to: { [key: string]: string } = {};

	seen.push(from);

	for (const fromValue of Object.entries(from)) {
		const [key, value]: [string, string] = fromValue;

		if (typeof value === "function") {
			continue;
		}

		if (!value || typeof value !== "object") {
			to[key] = value;
			continue;
		}

		if (!seen.includes(from[key])) {
			to[key] = destroyCircular(from[key], seen.slice());
			continue;
		}

		to[key] = "[Circular]";
	}

	const commonProperties = ["name", "message", "stack", "code"];

	for (const property of commonProperties) {
		if (typeof from[property] === "string") {
			to[property] = from[property];
		}
	}

	return to;
};

const serializeError = (value: Error) => {
	if (typeof value === "object") {
		return destroyCircular(value, []);
	}

	return value;
};

module.exports = serializeError;
// TODO: Remove this for the next major release
module.exports.default = serializeError;

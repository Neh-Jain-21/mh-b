import { Request, Response } from "express";
import { STATUS_CODES } from "./Constants";

class ResponseHandler {
	private req: Request;
	private res: Response;

	constructor(req: Request, res: Response) {
		this.req = req;
		this.res = res;
	}

	private sender(code: number, message: string, data?: any, logging?: boolean) {
		this.res.status(code).json({ message, data });

		if (logging) {
			console.log(`--------------------- ${code} ----------------------`);
			console.log(`-------------------- ${message} --------------------`);
			console.log(JSON.stringify(data));
			console.log(`----------------------------------------------------`);
		}
	}

	/** Custom Response */
	custom(code: number, message: string, data: any, logging?: boolean) {
		this.sender(code, message, data, logging);
	}

	/**
	 * Status Code - 200
	 * @default
	 * message = "Success"
	 * logging = false
	 */
	success(data?: any, message?: string, logging?: boolean) {
		this.sender(STATUS_CODES.SUCCESS, message || "Success", data, logging);
	}

	/**
	 * Status Code - 201
	 * @default
	 * message = "Created Successfully"
	 * logging = false
	 */
	created(data?: any, message?: string, logging?: boolean) {
		this.sender(STATUS_CODES.CREATED, message || "Created Successfully", data, logging);
	}

	/**
	 * Status Code - 400
	 * @default
	 * message = "Bad Request"
	 * logging = false
	 */
	badRequest(data?: any, message?: string, logging?: boolean) {
		this.sender(STATUS_CODES.BAD_REQUEST, message || "Bad Request", data, logging);
	}

	/**
	 * Status Code - 401
	 * @default
	 * message = "Unauthorized"
	 * logging = false
	 */
	unauthorized(data?: any, message?: string, logging?: boolean) {
		this.sender(STATUS_CODES.UNAUTHORIZED, message || "Unauthorized", data, logging);
	}

	/**
	 * Status Code - 403
	 * @default
	 * message = "Forbidden"
	 * logging = false
	 */
	forbidden(data?: any, message?: string, logging?: boolean) {
		this.sender(STATUS_CODES.FORBIDDEN, message || "Forbidden", data, logging);
	}

	/**
	 * Status Code - 404
	 * @default
	 * message = "Requested resource not found!"
	 * logging = false
	 */
	notFound(data?: any, message?: string, logging?: boolean) {
		this.sender(STATUS_CODES.NOT_FOUND, message || "Requested resource not found!", data, logging);
	}

	/**
	 * Status Code - 405
	 * @default
	 * message = "Method is not allowed!"
	 * logging = false
	 */
	notAllowed(data?: any, message?: string, logging?: boolean) {
		this.sender(STATUS_CODES.NOT_ALLOWED, message || "Method is not allowed!", data, logging);
	}

	/**
	 * Status Code - 409
	 * @default
	 * message = "Provided information already exist!"
	 * logging = false
	 */
	conflict(data?: any, message?: string, logging?: boolean) {
		this.sender(STATUS_CODES.CONFLICT, message || "Provided information already exist!", data, logging);
	}

	/**
	 * Status Code - 412
	 * @default
	 * message = "Please complete other steps first"
	 * logging = false
	 */
	preconditionFailed(data?: any, message?: string, logging?: boolean) {
		this.sender(STATUS_CODES.PRECONDITION_FAILED, message || "Please complete other steps first", data, logging);
	}

	/**
	 * Status Code - 422
	 * @default
	 * message = "Validation error!"
	 * logging = false
	 */
	validationError(data?: any, message?: string, logging?: boolean) {
		this.sender(STATUS_CODES.VALIDATION_ERROR, message || "Validation error!", data, logging);
	}

	/**
	 * Status Code - 500
	 * @default
	 * message = "Internal Server Error!"
	 * logging = false
	 */
	serverError(data?: any, message?: string, logging?: boolean) {
		this.sender(STATUS_CODES.SERVER_ERROR, message || "Internal Server Error!", data, logging);
	}
}

export = ResponseHandler;

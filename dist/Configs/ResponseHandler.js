"use strict";
const Constants_1 = require("./Constants");
class ResponseHandler {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    sender(code, message, data, logging) {
        this.res.status(code).json({ message, data });
        if (logging) {
            console.log(`--------------------- ${code} ----------------------`);
            console.log(`-------------------- ${message} --------------------`);
            console.log(JSON.stringify(data));
            console.log(`----------------------------------------------------`);
        }
    }
    /** Custom Response */
    custom(code, message, data, logging) {
        this.sender(code, message, data, logging);
    }
    /**
     * Status Code - 200
     * @default
     * message = "Success"
     * logging = false
     */
    success(data, message, logging) {
        this.sender(Constants_1.STATUS_CODES.SUCCESS, message || "Success", data, logging);
    }
    /**
     * Status Code - 201
     * @default
     * message = "Created Successfully"
     * logging = false
     */
    created(data, message, logging) {
        this.sender(Constants_1.STATUS_CODES.CREATED, message || "Created Successfully", data, logging);
    }
    /**
     * Status Code - 400
     * @default
     * message = "Bad Request"
     * logging = false
     */
    badRequest(data, message, logging) {
        this.sender(Constants_1.STATUS_CODES.BAD_REQUEST, message || "Bad Request", data, logging);
    }
    /**
     * Status Code - 401
     * @default
     * message = "Unauthorized"
     * logging = false
     */
    unauthorized(data, message, logging) {
        this.sender(Constants_1.STATUS_CODES.UNAUTHORIZED, message || "Unauthorized", data, logging);
    }
    /**
     * Status Code - 403
     * @default
     * message = "Forbidden"
     * logging = false
     */
    forbidden(data, message, logging) {
        this.sender(Constants_1.STATUS_CODES.FORBIDDEN, message || "Forbidden", data, logging);
    }
    /**
     * Status Code - 404
     * @default
     * message = "Requested resource not found!"
     * logging = false
     */
    notFound(data, message, logging) {
        this.sender(Constants_1.STATUS_CODES.NOT_FOUND, message || "Requested resource not found!", data, logging);
    }
    /**
     * Status Code - 405
     * @default
     * message = "Method is not allowed!"
     * logging = false
     */
    notAllowed(data, message, logging) {
        this.sender(Constants_1.STATUS_CODES.NOT_ALLOWED, message || "Method is not allowed!", data, logging);
    }
    /**
     * Status Code - 409
     * @default
     * message = "Provided information already exist!"
     * logging = false
     */
    conflict(data, message, logging) {
        this.sender(Constants_1.STATUS_CODES.CONFLICT, message || "Provided information already exist!", data, logging);
    }
    /**
     * Status Code - 412
     * @default
     * message = "Please complete other steps first"
     * logging = false
     */
    preconditionFailed(data, message, logging) {
        this.sender(Constants_1.STATUS_CODES.PRECONDITION_FAILED, message || "Please complete other steps first", data, logging);
    }
    /**
     * Status Code - 422
     * @default
     * message = "Validation error!"
     * logging = false
     */
    validationError(data, message, logging) {
        this.sender(Constants_1.STATUS_CODES.VALIDATION_ERROR, message || "Validation error!", data, logging);
    }
    /**
     * Status Code - 500
     * @default
     * message = "Internal Server Error!"
     * logging = false
     */
    serverError(data, message, logging) {
        this.sender(Constants_1.STATUS_CODES.SERVER_ERROR, message || "Internal Server Error!", data, logging);
    }
}
module.exports = ResponseHandler;

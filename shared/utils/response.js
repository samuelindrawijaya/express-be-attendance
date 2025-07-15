const createResponse = (success = true, message = '', data = null, code = null) => {
    return {
        success,
        message,
        data,
        code
    };
};

const success = (res, data = null, message = 'Success', code = 200) => {
    return res.status(code).json(createResponse(true, message, data, code));
};

const error = (res, message = 'Something went wrong', code = 500) => {
    return res.status(code).json(createResponse(false, message, null, code));
};

module.exports = {
    createResponse,
    success,
    error,
};

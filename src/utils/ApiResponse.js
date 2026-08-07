
class ApiResponse{

    constructor(
        statusCode,
        data,
        message = "Success"
    ){
        this.statusCode = statusCode,
        this.data = data,
        this.message = message,
        this.success = true
    }

    // should know basics pf stastus code overview on it.
}

export {ApiResponse}
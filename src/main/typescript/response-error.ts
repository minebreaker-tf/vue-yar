class ResponseError extends Error {

    constructor(public envelope: Response) {
        super()
    }

}

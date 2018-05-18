export const alwaysTrue = function () { return true }

export const noop = function () { }

class Logger {

    constructor(condition) {
        this.condition = condition
    }

    log(...message) {
        if (this.condition) console.log(...message)
    }

    warn(...message) {
        if (this.condition) console.warn(...message)
    }
}

const debug = "__DEBUG__"
// const debug = false
export const logger = new Logger(process.env.NODE_ENV !== "production" && debug)

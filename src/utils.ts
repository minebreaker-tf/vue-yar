export const alwaysTrue = function () { return true }

export const noop = function () { }

export function unwrap(thisRef: any, target: Function | Object) {
    if (typeof target === "function") {
        return target.call(thisRef)
    } else {
        return target
    }
}

class Logger {

    constructor(private condition: boolean) { }

    log(...message: Array<any>) {
        if (this.condition) console.log(...message)
    }

    warn(...message: Array<any>) {
        if (this.condition) console.warn(...message)
    }
}

declare const process: any
const debug: boolean = !!"__DEBUG__"
// const debug = false
export const logger = new Logger(process.env.NODE_ENV !== "production" && debug)

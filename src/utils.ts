export const alwaysTrue = function () { return true }

export const noop = function () { }

export function unwrap(thisRef: any, target: Function | Object) {
    if (typeof target === "function") {
        return target.call(thisRef)
    } else {
        return target
    }
}

export interface Mappable<T> {
    [key: string]: T
}

export function mapObject<T, U>(input: Mappable<T>, mapper: (key: string, value: T) => U): Mappable<U> {
    return Object.keys(input)
                 .reduce((result: Mappable<U>, key) => {
                     result[key] = mapper(key, input[key])
                     return result
                 }, {})
}

export function includes<T>(input: Array<T>, value: T): boolean {
    return input.indexOf(value) >= 0
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

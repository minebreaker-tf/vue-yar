import { logger } from "./utils"
import { VueYarOptions, CheckedVueYarOptions } from "../types/vue-yar";

/**
 * Check and inject default values if necessary.
 *
 * @param {Object} options vue-yar options specified by user
 * @returns Validated options
 */
export function createOptions(options: VueYarOptions | undefined): CheckedVueYarOptions {

    if (!options) {
        options = {}
    }

    const returningOptions = {
        network: options["network"] || defaultNetwork,
        validate: options["validate"] || defaultValidate,
        mutate: options["mutate"] || defaultMutate
    }

    for (let key in options) {
        if (key !== "network" && key !== "validate" && key !== "mutate") {
            logger.log("Unknown option: %s", key)
        }
    }
    return returningOptions
}

/**
 * The method to handle HTTP request.
 * The type of the returned object is implementation dependent.
 * Default returns {Promise<Response>}.
 *
 * @param {string} url
 * @return {*} response of the request
 */
function defaultNetwork(url: string): Promise<Response> {
    return fetch(url, { method: "GET" })
}

/**
 * Checks if the HTTP response is successful.
 * The type of the response is depends on "network" function.
 * If it is Promise, it'll be unwrapped.
 *
 * @param {*} response HTTP Response
 * @returns {boolean} true if the response was successful
 */
function defaultValidate(response: Response): boolean {
    return response.status === 200
}

/**
 * Mutate function.
 * Maps response object returned by "network" function into the
 * value directly bounded to the vue instance.
 * The type of the response is depends on "network" function.
 * If it is Promise, it'll be unwrapped.
 *
 * @param {*} response HTTP Response
 * @return {*} The value to bind
 */
function defaultMutate(response: Response): Promise<any> {
    logger.log(response.headers.get("Content-Type"))
    if (parseContentType(response.headers.get("Content-Type")) === "application/json") {
        return response.json()
    } else {
        return response.text()
    }
}

function parseContentType(contentTypeString: string | null) {
    if (contentTypeString === null) {
        return ""
    }

    const parts = contentTypeString.split(";")
    if (parts.length > 0) {
        return parts[0].trim()
    } else {
        return ""
    }
}

import * as options from "../src/options"

const assert = chai.assert

describe("options.ts", () => {

    describe("createOptions", () => {

        it("should create the option object if no default values are provided", () => {
            const result = options.createOptions(undefined)

            assert.hasAllKeys(result, ["network", "validate", "mutate"])
            assert.isFunction(result.network)
            assert.isFunction(result.validate)
            assert.isFunction(result.mutate)
        })

        it("should create the option object with provided values", () => {
            const network = () => {}
            const validate = () => true
            const mutate = () => {}

            const result = options.createOptions({ network, validate, mutate })

            assert.hasAllKeys(result, ["network", "validate", "mutate"])
            assert.strictEqual(result.network, network)
            assert.strictEqual(result.validate, validate)
            assert.strictEqual(result.mutate, mutate)
        })
    })

    describe("defaultNetwork", () => {
        it("should fetch web resource and returns the promise of the response", async function () {

            const url = "fetching url"
            const responseString = "response"

            window.fetch = (requestedUrl: string, options: RequestInit) => {
                assert.strictEqual(url, requestedUrl)
                assert.strictEqual(options.method, "GET")
                return Promise.resolve(new Response(responseString))
            }

            const network = options.createOptions(undefined).network
            const result = await <Promise<Response>> network(url)
            const resultResponse = await  result.text()

            assert.strictEqual(resultResponse, responseString)
        })
    })

    describe("defaultValidate", () => {
        it("should return true if the response code is 200", () => {

            const response = new Response("response", { status: 200 })

            const validate = options.createOptions(undefined).validate
            const result = validate(response)

            assert.isTrue(result)
        })

        it("should return false if the response code is not 200", () => {

            const response = new Response("response", { status: 500 })

            const validate = options.createOptions(undefined).validate
            const result = validate(response)

            assert.isFalse(result)
        })
    })

    describe("defaultMutate", () => {
        it("should return the promise of the parsed object if the mime type is 'application/json'", async function () {

            const response = new Response(`{"result":true}`, { headers: { "Content-Type": "application/json" } })

            const mutate = options.createOptions(undefined).mutate
            const result = await mutate(response)

            assert.isObject(result)
            assert.hasAllKeys(result, ["result"])
            assert.isTrue(result.result)
        })

        it("should return the promise of the string if the mime type is not 'application/json'", async function () {

            const body = `{"result":true}`
            const response = new Response(body, { headers: { "Content-Type": "text/plain" } })

            const mutate = options.createOptions(undefined).mutate
            const result = await mutate(response)

            assert.strictEqual(result, body)
        })
    })
})

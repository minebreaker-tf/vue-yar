import * as utils from "../src/utils"

const assert = chai.assert

describe("utils.ts", () => {

    describe("alwaysTrue", () => {
        it("should be a function that returns true", () => {
            const result = utils.alwaysTrue()

            assert.isFunction(utils.alwaysTrue)
            assert.isTrue(result)
        })
    })

    describe("noop", () => {
        it("should be a function that returns nothing", () => {
            const result = utils.noop()

            assert.isFunction(utils.noop)
            assert.isUndefined(result)
        })
    })

    describe("unwrap", () => {
        it("should return itself if it is a object", () => {
            const input = { result: true }
            const result = utils.unwrap(null, input)

            assert.strictEqual(input, result)
        })

        it("should if the parameter is a function return the result of it with provided 'this' reference", () => {
            const thisObj = { field: true }
            const input = function (this: any) {
                return { result: this.field }
            }
            const result = utils.unwrap(thisObj, input)

            assert.isObject(result)
            assert.isTrue(result.result)
        })
    })

    describe("collectMapping", () => {
        it("should map objects into another object", () => {
            const input = { foo: "abc", bar: "def" }
            const result = utils.mapObject(input, (key, value) => key + ":" + value)

            assert.deepEqual(result, {
                foo: "foo:abc",
                bar: "bar:def"
            })
        })
    })

    describe("include", () => {
        it("should return true if array contains it", () => {
            const input = ["foo", "bar", "buz"]
            const result1 = utils.includes(input, "foo")
            const result2 = utils.includes(input, "bar")
            const result3 = utils.includes(input, "buz")
            const result4 = utils.includes(input, "hoge")

            assert.isTrue(result1)
            assert.isTrue(result2)
            assert.isTrue(result3)
            assert.isFalse(result4)
        })
    })
})

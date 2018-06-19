import Vue from "vue"
import VueYar from "../src/vue-yar"

const assert = chai.assert

describe("vue-yar.ts", () => {

    describe("VueYar", () => {

        it("should exports VueYar object, and it can be used as Vue plugin", () => {
            Vue.use(VueYar)

            assert.isFunction(Vue.resource)
            assert.isFunction(Vue.withResource)
        })
    })
})

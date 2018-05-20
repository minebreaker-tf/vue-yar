import Vue from "vue"
import { createOptions } from "./options"
import { wrap, createResource } from "./resource";
import { logger } from "./utils";
import VueYar from "../types/vue-yar"

const VueYarObject: VueYar = {

    install: function (VueC, options) {

        const actualOptions = createOptions(options)

        VueC.withResource = function (wrappedComponentOptions, resourceOptions) {
            return wrap(wrappedComponentOptions, actualOptions, resourceOptions)
        }

        Vue.resource = function (resourceComponentOptions) {
            return createResource(actualOptions, resourceComponentOptions)
        }

        // Necessary to acquire "this"
        Vue.prototype.$resourceDelegate = function (f: Function, ...arg: Array<any>) {
            logger.log("delegating")
            if (f) {
                f.call(this, ...arg)
            }
        }
    }
}

Vue.use(VueYarObject)

//noinspection JSUnusedGlobalSymbols
export default VueYarObject

import Vue from "vue"
import { createOptions } from "./options"
import { wrap, createResource } from "./resource";
import { logger } from "./utils";

const VueYar = {

    install: function (Vue, options) {

        const actualOptions = createOptions(options)

        Vue.withResource = function (wrappedComponentOptions, resourceOptions) {
            return wrap(wrappedComponentOptions, actualOptions, resourceOptions)
        }

        Vue.resource = function (resourceComponentOptions) {
            return createResource(actualOptions, resourceComponentOptions)
        }

        // Necessary to acquire "this"
        Vue.prototype.$resourceDelegate = function (f, ...arg) {
            logger.log("delegating")
            if (f) {
                f.call(this, ...arg)
            }
        }
    }
}

if (Vue) {
    Vue.use(VueYar)
}

//noinspection JSUnusedGlobalSymbols
export default VueYar

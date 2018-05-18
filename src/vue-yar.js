import Vue from "vue"
import { createOptions } from "./options"
import { wrap } from "./resource";
import { logger } from "./utils";

const VueYar = {

    install: function (Vue, options) {

        const actualOptions = createOptions(options)

        Vue.withResource = function (wrappedComponent, resourceOptions) {
            return wrap(wrappedComponent, actualOptions, resourceOptions)
        }

        // Vue.resource = function (resourceComponentOptions) {
        //
        // }

        // Necessary to acquire "this"
        Vue.prototype.$resourceDelegate = function(f, ...arg) {
            logger.log("delegating")
            f.call(this, ...arg)
        }
    }
}

if (Vue) {
    Vue.use(VueYar)
}

//noinspection JSUnusedGlobalSymbols
export default VueYar

import Vue, { ComponentOptions } from "vue"
import { createOptions } from "./options"
import { createMixin, createResourceComponent } from "./resource"
import { logger } from "./utils";
import { VueYar, ResourceOptions } from "../types/vue-yar"

const VueYarObject: VueYar = {

    install: function (Vue, options) {

        const actualOptions = createOptions(options)

        Vue.withResource = function (resourceOptions: ResourceOptions) {
            return createMixin(actualOptions, resourceOptions)
        }

        Vue.resource = function (resourceComponentOptions) {
            return createResourceComponent(actualOptions, resourceComponentOptions)
        }
    }
}

Vue.use(VueYarObject)

//noinspection JSUnusedGlobalSymbols
export default VueYarObject

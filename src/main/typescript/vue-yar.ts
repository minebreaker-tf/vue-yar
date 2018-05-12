import VueYarInstance from "./instance"
import Registry from "./registry"
import { VueYar, VueYarOption } from "../types/vue-yar"

const VueYar: VueYar = {

    install: function (Vue: any, options?: VueYarOption) {

        options = options ? options : {}

        const vueYar = new VueYarInstance(new Registry(options))

        Object.defineProperties(Vue.prototype, {
            $resource: {
                get: () => ({ $options: vueYar.options })
            }
        })

        Vue.mixin(vueYar.mixin)
    }
}

//noinspection JSUnusedGlobalSymbols
export default VueYar

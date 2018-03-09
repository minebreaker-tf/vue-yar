import VueYarInstance from "./instance"
import { VueYar, VueYarOption } from "./type/vue-yar"
import Registry from "./registry"

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

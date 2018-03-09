import { ComponentOptions } from "vue/types/options"
import { Resource, VueConstructor } from "vue/types/vue"

export interface VueYar {
    install: (constructor: VueConstructor, options?: VueYarOption) => void
}

export interface VueYarOption {
    // TODO
}

declare module 'vue/types/vue' {

    export interface Vue {
        $resource: Resource
    }

    export interface VueConstructor<V extends Vue> {
        resource?: any
    }

    export interface Resource {
        $options: any
    }

}

declare module 'vue/types/options' {

    export interface ComponentOptions<V> {
        resource?: any
    }

}

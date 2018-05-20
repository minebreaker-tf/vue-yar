import Vue, { ComponentOptions, PluginObject } from "vue"

export default interface VueYar extends PluginObject<VueYarOptions> { }

export interface VueYarOptions {
    network?: (url: string) => any,
    validate?: (response: any) => boolean
    mutate?: (response: any) => any
}

export interface CheckedVueYarOptions {
    network: (url: string) => any,
    validate: (response: any) => boolean
    mutate: (response: any) => any
}

export interface ResourceOptionValue {
    url: string
    refetch?: boolean
    validate?: (response: any) => boolean
    beforeLoad?: () => void
    loaded?: () => void
    failed?: (e: any) => void
}

export interface ResourceOptions {
    [key: string]: ResourceOptionValue
}

export interface ResourceComponentOptions {
    url: string
    template: ResourceTemplateSet
    refetch?: boolean
    validate?: (response: any) => boolean
    beforeLoad?: () => void
    loaded?: () => void
    failed?: (response?: any) => void

    [other: string]: any
}

export interface ResourceTemplateSet {
    success: string
    loading: string
    failure: string
}

declare module "vue/types/vue" {
    interface VueConstructor<V extends Vue = Vue> {
        withResource(componentOptions: ComponentOptions<Vue>, resourceOptions: ResourceOptions): ComponentOptions<Vue>
        resource(resourceComponentOptions: ResourceComponentOptions): ComponentOptions<Vue>
    }

    interface Vue {
        $resourceDelegate: Function
    }
}

import Vue, { ComponentOptions, PluginObject } from "vue"

export default interface VueYar extends PluginObject<VueYarOptions?> { }

export interface VueYarOptions {
    network?: (string) => any,
    validate?: (any) => boolean
    mutate?: (any) => any
}

export interface ResourceOptions {
    url: string
    refetch?: boolean
    validate?: (any) => boolean
    beforeLoad?: () => void
    loaded?: () => void
    failed?: (any) => void
}

export interface ResourceComponentOptions extends ComponentOptions {
    url: string
    template: ResourceTemplateSet
    refetch?: boolean
    validate?: (any) => boolean
    beforeLoad?: () => void
    loaded?: () => void
    failed?: (any?) => void
}

export interface ResourceTemplateSet {
    success: string
    loading: string
    failure: string
}

declare module "vue/types/vue" {
    interface VueConstructor<V extends Vue = Vue> {
        withResource(componentOptions: ComponentOptions, resourceOptions: ResourceOptions): ComponentOptions
        resource(resourceComponentOptions: ResourceComponentOptions): ComponentOptions
    }
}

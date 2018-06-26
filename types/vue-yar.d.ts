import { PluginObject } from "vue"
import VueYarObject from "../src/vue-yar"

export default VueYarObject

export interface VueYar extends PluginObject<VueYarOptions> {
}

export interface VueYarOptions {
    network?: (url: string) => any,
    validate?: (response: any) => boolean
    mutate?: (response: any) => any
}

export interface CheckedVueYarOptions {
    network: (url: string) => any
    validate: (response: any) => boolean
    mutate: (response: any) => any
}

export interface ResourceOptionValue {
    url: UrlDeclaration
    refetch?: boolean
    validate?: Validator
    beforeLoad?: BeforeLoadHook
    loaded?: LoadedHook
    failed?: FailedHook
}

export interface ResourceOptions {
    [key: string]: ResourceOptionValue
}

export interface ResourceComponentOptions {
    url: UrlDeclaration
    template: ResourceTemplateSet
    refetch?: boolean
    validate?: Validator
    beforeLoad?: BeforeLoadHook
    loaded?: LoadedHook
    failed?: FailedHook

    [other: string]: any
}

export interface ResourceTemplateSet {
    success: string
    loading: string
    failure: string
}

type UrlDeclaration = string | ((this: any) => string)
type Validator = (this: any, response: any) => boolean
type BeforeLoadHook = (this: any) => void
type LoadedHook = (this: any) => void
type FailedHook = (this: any, e?: any) => void

declare module "vue/types/vue" {
    interface VueConstructor<V extends Vue = Vue> {
        // withResource(componentOptions: ComponentOptions<Vue>, resourceOptions: ResourceOptions): ComponentOptions<Vue>
        // resource(resourceComponentOptions: ResourceComponentOptions): ComponentOptions<Vue>
        withResource(resourceOptions: ResourceOptions): any

        resource(resourceComponentOptions: ResourceComponentOptions): any
    }

    interface Vue {
        $resourceDelegate: Function
    }
}

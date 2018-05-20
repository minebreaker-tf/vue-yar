import Vue, { ComponentOptions } from "vue";
import { noop, alwaysTrue, logger } from "./utils";
import { VueYarOptions, CheckedVueYarOptions, ResourceOptions, ResourceComponentOptions } from "../types/vue-yar";

export function wrap(wrappedComponent: ComponentOptions<Vue>, options: CheckedVueYarOptions, resourceInfoParam: ResourceOptions): any {

    const { network, validate, mutate } = options

    const resourceInfo: any = {}
    for (let key in resourceInfoParam) {
        resourceInfo[key] = {
            url: resourceInfoParam[key]["url"],
            refetch: !!resourceInfoParam[key]["refetch"],
            validate: resourceInfoParam[key]["validate"] || alwaysTrue,
            beforeLoad: resourceInfoParam[key]["beforeLoad"] || noop,
            loaded: resourceInfoParam[key]["loaded"] || noop,
            failed: resourceInfoParam[key]["failed"] || noop,
        }
    }

    const urls: any = {}
    for (let key in resourceInfo) {
        urls[key] = resourceInfo[key].url
    }

    const resources: any = {}
    for (let key in resourceInfo) {
        resources[key] = null
    }

    let watch: any = null
    const watchTarget = Object.keys(resourceInfo).filter(key => resourceInfo[key].refetch)
    if (watchTarget.length > 0) {
        watch = {
            url: {
                handler(this: any, newValue, oldValue) {
                    for (let key in newValue) {
                        if (newValue[key] !== oldValue[key] && watchTarget.indexOf(key) >= 0) {
                            this.load(key)
                        }
                    }
                },
                deep: true
            },
        }
    }

    return Vue.extend({
        name: "ResourceComponent",
        render(h, ctx) {
            const props: any = {}
            for (let key in this.resource) {
                props[key] = this.resource[key]
            }
            return h(wrappedComponent, { props })
        },
        data: () => ({
            url: urls,
            resource: resources
        }),
        watch,
        mounted() {
            for (let key in resourceInfo) {
                this.load(key)
            }
        },
        methods: {
            load(key: string) {

                this.$children[0].$resourceDelegate(resourceInfo[key]["beforeLoad"])

                Promise.resolve(network(resourceInfo[key].url)).then(response => {
                    if (validate(response)) {
                        return Promise.resolve(mutate(response))
                    } else {
                        logger.warn("Global validation failed on key '%s'", key)
                        this.$children[0].$resourceDelegate(resourceInfo[key]["failed"])
                    }
                }).then(result => {
                    if (resourceInfo[key].validate(result)) {
                        this.resource[key] = result
                        this.$children[0].$resourceDelegate(resourceInfo[key]["loaded"])
                    } else {
                        logger.warn("Response validation failed on key '%s'", key)
                        // const i = this.$children[0].$resourceDelegate
                        // i(resourceInfo[key]["failed"], "Response validation error")  // doesn't work
                        this.$children[0].$resourceDelegate(resourceInfo[key]["failed"])  // works
                    }
                }).catch(e => {
                    logger.warn("Unexpected error on '%s'", key)
                    logger.warn(e)
                    this.$children[0].$resourceDelegate(resourceInfo[key]["failed"], e)
                })
            }
        },
        components: {
            wrappedComponent
        }
    })
}

function prepareProperty(props: any): any {
    if (props instanceof Array) {
        if (props.indexOf("resource") < 0) throw Error("Property 'resource' is preserved.")
        return props.concat(["resource"])
    } else if (props instanceof Object) {
        if (props.resource) throw Error("Property 'resource' is preserved.")
        return Object.assign({}, props, { resource: null, default: null })
    } else {
        return { resource: null, default: null }
    }
}

function prepareData(data: any): any {
    const d
        = !data ? {}
            : typeof data === "function" ? data()
                : data
    if (d.child) throw Error("Data 'child' is preserved")
    d.child = "loading"
    return d
}

export function createResource(options: CheckedVueYarOptions, rco: ResourceComponentOptions): any {

    const props = prepareProperty(rco.props)
    const data = prepareData(rco.data)  // Shares data among components

    const co = Object.assign({}, rco, {
        name: "ResourceComponentSwitcher",
        props,
        template: `<keep-alive><component :is="child" :resource="resource"></component></keep-alive>`,
        data: () => data,
        components: {
            success: { template: rco.template.success, props, data: () => data, components: rco.components },
            loading: { template: rco.template.loading, props, data: () => data, components: rco.components },
            failure: { template: rco.template.failure, props, data: () => data, components: rco.components }
        }
    })

    const ro = {
        resource: {
            url: rco.url,
            validate: rco.validate,
            beforeLoad(this: any) {
                this.child = "loading"
                rco.beforeLoad && rco.beforeLoad()
            },
            loaded(this: any) {
                this.child = "success"
                rco.loaded && rco.loaded()
            },
            failed(this: any) {
                this.child = "failed"
                rco.failed && rco.failed()
            }
        }
    }

    return wrap(co, options, ro)
}

import Vue from "vue"
import { CheckedVueYarOptions, ResourceComponentOptions, ResourceOptions } from "../types/vue-yar";
import { alwaysTrue, logger, noop, unwrap } from "./utils";

export function createMixin(options: CheckedVueYarOptions, resourceInfoParam: ResourceOptions) {

    const { network, validate, mutate } = options

    const resourceInfo: any = {}
    for (let key in resourceInfoParam) {
        resourceInfo[key] = {
            url: resourceInfoParam[key]["url"],
            refetch: !!resourceInfoParam[key]["refetch"],
            validate: resourceInfoParam[key]["validate"] || alwaysTrue,
            beforeLoad: resourceInfoParam[key]["beforeLoad"] || noop,
            loaded: resourceInfoParam[key]["loaded"] || noop,
            failed: resourceInfoParam[key]["failed"] || noop
        }
    }

    const urls: any = {}
    Object.keys(resourceInfo).forEach((key: string) => {
        urls[key] = resourceInfo[key].url
    })

    const resources: any = {}
    Object.keys(resourceInfo).forEach((key: string) => {
        resources[key] = null  // Inject keys for reactive parameters
    })
    const data = () => resources

    let watch: any = null
    const watchTarget = Object.keys(resourceInfo).filter(key => resourceInfo[key].refetch)
    if (watchTarget.length > 0) {
        watch = {
            url: {
                handler(this: any, newValue: any, oldValue: any) {
                    Object.keys(newValue).forEach((key: string) => {
                        if (newValue[key] !== oldValue[key] && watchTarget.indexOf(key) >= 0) {
                            this.load(key)
                        }
                    })
                },
                deep: true
            }
        }
    }

    const mixin = {
        data,
        computed: {
            url() {
                const returning: any = {}
                Object.keys(urls).forEach((key: string) => {
                    returning[key] = unwrap(this, urls[key])
                })
                return returning
            }
        },
        watch,
        mounted(this: any) {
            Object.keys(resourceInfo).forEach(this.load)
        },
        methods: {
            load(this: any, key: string) {

                resourceInfo[key]["beforeLoad"].call(this)

                const url = this.url[key]
                if (!url) {
                    logger.log("URL is not defined.")
                    return
                } else {
                    logger.log("Fetch URL: %s", url)
                }

                Promise.resolve(network(url)).then(response => {
                    if (validate(response)) {
                        return Promise.resolve(mutate(response))
                    } else {
                        logger.warn("Global validation failed on key '%s'", key)
                        resourceInfo[key]["failed"].call(this)
                        return Promise.reject("gvf")
                    }
                }).then(result => {
                    if (resourceInfo[key].validate(result)) {
                        this[key] = result
                        resourceInfo[key]["loaded"].call(this)
                    } else {
                        logger.warn("Response validation failed on key '%s'", key)
                        resourceInfo[key]["failed"].call(this)
                    }
                }).catch(e => {
                    if (e !== "gvf") {
                        logger.warn("Unexpected error on '%s'", key)
                        logger.warn(e)
                        resourceInfo[key]["failed"].call(this, e)
                    }
                })
            }
        }
    }

    return mixin
}

export function createResourceComponent(options: CheckedVueYarOptions, rco: ResourceComponentOptions) {

    const data = Object.assign({}, unwrap(null, rco.data), { child: "loading" })

    const resource = createMixin(options, {
        resource: {
            url: rco.url,
            refetch: rco.refetch,
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
                this.child = "failure"
                rco.failed && rco.failed()
            }
        }
    })

    const component = Vue.extend(Object.assign({}, rco, {
        name: rco.name || "ResourceComponent",
        props: rco.props,
        template: `<keep-alive><component :is="child" :resource="resource"></component></keep-alive>`,
        data: () => data,
        components: {
            success: { template: rco.template.success, props: rco.props, data: () => data, components: rco.components },
            loading: { template: rco.template.loading, props: rco.props, data: () => data, components: rco.components },
            failure: { template: rco.template.failure, props: rco.props, data: () => data, components: rco.components }
        },
        mixins: [resource]
    }))

    return component
}

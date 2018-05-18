import Vue from "vue";
import { noop, alwaysTrue, logger } from "./utils";

export function wrap(wrappedComponent, options, resourceInfoParam) {

    const { network, validate, mutate } = options

    const resourceInfo = {}
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

    const urls = {}
    for (let key in resourceInfo) {
        urls[key] = resourceInfo[key].url
    }

    const resources = {}
    for (let key in resourceInfo) {
        resources[key] = null
    }

    return Vue.extend({
        name: "ResourceComponent",
        render(h, ctx) {
            const props = {}
            for (let key in this.resource) {
                props[key] = this.resource[key]
            }
            return h(wrappedComponent, { props })
        },
        data: () => ({
            url: urls,
            resource: resources
        }),
        // watch: {
        //     url: {
        //         handler: function() {
        //
        //         },
        //         deep: true
        //     }
        // },
        mounted() {
            for (let key in resourceInfo) {
                this.load(key)
            }
        },
        methods: {
            load(key) {

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

function prepareProperty(props) {
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

function prepareData(data) {
    const d
        = !data ? {}
            : typeof data === "function" ? data()
                : data
    if (d.child) throw Error("Data 'child' is preserved")
    d.child = "loading"
    return d
}

export function createResource(options, rco) {

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
            beforeLoad() {
                this.child = "loading"
                rco.beforeLoad && rco.beforeLoad()
            },
            loaded() {
                this.child = "success"
                rco.loaded && rco.loaded()
            },
            failed() {
                this.child = "failed"
                rco.failed && rco.failed()
            }
        }
    }

    return wrap(co, options, ro)
}

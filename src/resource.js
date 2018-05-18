import Vue from "vue";
import { noop, alwaysTrue } from "./utils";

export function wrap(wrappedComponent, options, resourceInfoParam) {

    const { network, validate, mutate } = options

    const resourceInfo = {}
    for (let key in resourceInfoParam) {
        resourceInfo[key] = {
            url: resourceInfoParam[key]["url"],
            refetch: !!resourceInfoParam[key]["refetch"],
            validate: resourceInfoParam[key]["validate"] || alwaysTrue,
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
                this.$children[0].$options.beforeLoad(key)
                Promise.resolve(network(resourceInfo[key].url)).then(response => {
                    if (validate(response)) {
                        return Promise.resolve(mutate(response))
                    } else {
                        this.$children[0].$options.failed(key, "Global validation error")
                    }
                }).then(result => {
                    if (resourceInfo[key].validate(result)) {
                        this.resource[key] = result
                        this.$children[0].$options.loaded(key, result)
                    } else {
                        console.log("wooooo")
                        // this.$children[0].$resourceDelegate(this.$children[0].$options.failed, key, "Response validation error")  // works
                        // this.$children[0].$options.failed(key, "Response validation error")  // doesn't work
                        this.$children[0].$resourceDelegate(resourceInfoParam[key]["failed"], key, "Response validation error")  // works
                    }
                }).catch(e => {
                    console.log(e)
                    this.$children[0].$options.failed(key, "Unexpected error", e)
                })
            }
        },
        components: {
            wrappedComponent
        }
    })
}

export function createResource(options, rco) {

    const co = {
        props: ["resource"],
        template: `
            <div>
                <success v-if="error"></success>
                <failure v-else-if="resource"></failure>
                <loading v-else></loading>
            </div>`,
        components: {
            success,
            failure,
            loading
        }
    }

    const ro = {
        resource: {
            url: rco["url"],
            validate: rco["validate"]
        }
    }

    return Vue.extend(wrap(co, options, ro))
}

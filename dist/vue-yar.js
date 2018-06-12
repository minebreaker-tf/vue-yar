import Vue from 'vue';

const alwaysTrue = function () { return true; };
const noop = function () { };
function unwrap(thisRef, target) {
    if (typeof target === "function") {
        return target.call(thisRef);
    }
    else {
        return target;
    }
}
class Logger {
    constructor(condition) {
        this.condition = condition;
    }
    log(...message) {
        if (this.condition)
            console.log(...message);
    }
    warn(...message) {
        if (this.condition)
            console.warn(...message);
    }
}
const debug = !!"__DEBUG__";
const logger = new Logger(process.env.NODE_ENV !== "production" && debug);

function createOptions(options) {
    if (!options) {
        options = {};
    }
    const returningOptions = {
        network: options["network"] || defaultNetwork,
        validate: options["validate"] || defaultValidate,
        mutate: options["mutate"] || defaultMutate
    };
    for (let key in options) {
        if (key !== "network" && key !== "validate" && key !== "mutate") {
            logger.log("Unknown option: %s", key);
        }
    }
    return returningOptions;
}
function defaultNetwork(url) {
    return fetch(url, { method: "GET" });
}
function defaultValidate(response) {
    return response.status === 200;
}
function defaultMutate(response) {
    logger.log(response.headers.get("Content-Type"));
    if (parseContentType(response.headers.get("Content-Type")) === "application/json") {
        return response.json();
    }
    else {
        return response.text();
    }
}
function parseContentType(contentTypeString) {
    if (contentTypeString === null) {
        return "";
    }
    const parts = contentTypeString.split(";");
    if (parts.length > 0) {
        return parts[0].trim();
    }
    else {
        return "";
    }
}

function createMixin(options, resourceInfoParam) {
    const { network, validate, mutate } = options;
    const resourceInfo = {};
    for (let key in resourceInfoParam) {
        resourceInfo[key] = {
            url: resourceInfoParam[key]["url"],
            refetch: !!resourceInfoParam[key]["refetch"],
            validate: resourceInfoParam[key]["validate"] || alwaysTrue,
            beforeLoad: resourceInfoParam[key]["beforeLoad"] || noop,
            loaded: resourceInfoParam[key]["loaded"] || noop,
            failed: resourceInfoParam[key]["failed"] || noop,
        };
    }
    const urls = {};
    for (let key in resourceInfo) {
        urls[key] = resourceInfo[key].url;
    }
    const resources = {};
    for (let key in resourceInfo) {
        resources[key] = null;
    }
    const data = () => resources;
    let watch = null;
    const watchTarget = Object.keys(resourceInfo).filter(key => resourceInfo[key].refetch);
    if (watchTarget.length > 0) {
        watch = {
            url: {
                handler(newValue, oldValue) {
                    for (let key in newValue) {
                        if (newValue[key] !== oldValue[key] && watchTarget.indexOf(key) >= 0) {
                            this.load(key);
                        }
                    }
                },
                deep: true
            },
        };
    }
    const mixin = {
        data,
        computed: {
            url() {
                const returning = {};
                for (let key in urls) {
                    returning[key] = unwrap(this, urls[key]);
                }
                return returning;
            }
        },
        watch,
        mounted() {
            for (let key in resourceInfo) {
                this.load(key);
            }
        },
        methods: {
            load(key) {
                resourceInfo[key]["beforeLoad"].call(this);
                const url = this.url[key];
                if (!url) {
                    logger.log("URL is not defined.");
                    return;
                }
                else {
                    logger.log("Fetch URL: %s", url);
                }
                Promise.resolve(network(url)).then(response => {
                    if (validate(response)) {
                        return Promise.resolve(mutate(response));
                    }
                    else {
                        logger.warn("Global validation failed on key '%s'", key);
                        resourceInfo[key]["failed"].call(this);
                        return Promise.reject("gvf");
                    }
                }).then(result => {
                    if (resourceInfo[key].validate(result)) {
                        this[key] = result;
                        resourceInfo[key]["loaded"].call(this);
                    }
                    else {
                        logger.warn("Response validation failed on key '%s'", key);
                        resourceInfo[key]["failed"].call(this);
                    }
                }).catch(e => {
                    if (e !== "gvf") {
                        logger.warn("Unexpected error on '%s'", key);
                        logger.warn(e);
                        resourceInfo[key]["failed"].call(this, e);
                    }
                });
            }
        }
    };
    return mixin;
}
function createResourceComponent(options, rco) {
    const data = Object.assign({}, unwrap(null, rco.data), { child: "loading" });
    const resource = createMixin(options, {
        resource: {
            url: rco.url,
            refetch: rco.refetch,
            validate: rco.validate,
            beforeLoad() {
                this.child = "loading";
                rco.beforeLoad && rco.beforeLoad();
            },
            loaded() {
                this.child = "success";
                rco.loaded && rco.loaded();
            },
            failed() {
                this.child = "failed";
                rco.failed && rco.failed();
            }
        }
    });
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
    }));
    return component;
}

const VueYarObject = {
    install: function (Vue$$1, options) {
        const actualOptions = createOptions(options);
        Vue$$1.withResource = function (resourceOptions) {
            return createMixin(actualOptions, resourceOptions);
        };
        Vue$$1.resource = function (resourceComponentOptions) {
            return createResourceComponent(actualOptions, resourceComponentOptions);
        };
    }
};
Vue.use(VueYarObject);

export default VueYarObject;
//# sourceMappingURL=vue-yar.js.map

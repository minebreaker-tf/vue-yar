import Vue from 'vue';

const alwaysTrue = function () { return true; };
const noop = function () { };
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

function wrap(wrappedComponent, options, resourceInfoParam) {
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
    return Vue.extend({
        name: "ResourceComponent",
        render(h, ctx) {
            const props = {};
            for (let key in this.resource) {
                props[key] = this.resource[key];
            }
            return h(wrappedComponent, { props });
        },
        data: () => ({
            url: urls,
            resource: resources
        }),
        mounted() {
            for (let key in resourceInfo) {
                this.load(key);
            }
        },
        methods: {
            load(key) {
                this.$children[0].$resourceDelegate(resourceInfo[key]["beforeLoad"]);
                Promise.resolve(network(resourceInfo[key].url)).then(response => {
                    if (validate(response)) {
                        return Promise.resolve(mutate(response));
                    }
                    else {
                        logger.warn("Global validation failed on key '%s'", key);
                        this.$children[0].$resourceDelegate(resourceInfo[key]["failed"]);
                    }
                }).then(result => {
                    if (resourceInfo[key].validate(result)) {
                        this.resource[key] = result;
                        this.$children[0].$resourceDelegate(resourceInfo[key]["loaded"]);
                    }
                    else {
                        logger.warn("Response validation failed on key '%s'", key);
                        this.$children[0].$resourceDelegate(resourceInfo[key]["failed"]);
                    }
                }).catch(e => {
                    logger.warn("Unexpected error on '%s'", key);
                    logger.warn(e);
                    this.$children[0].$resourceDelegate(resourceInfo[key]["failed"], e);
                });
            }
        },
        components: {
            wrappedComponent
        }
    });
}
function prepareProperty(props) {
    if (props instanceof Array) {
        if (props.indexOf("resource") < 0)
            throw Error("Property 'resource' is preserved.");
        return props.concat(["resource"]);
    }
    else if (props instanceof Object) {
        if (props.resource)
            throw Error("Property 'resource' is preserved.");
        return Object.assign({}, props, { resource: null, default: null });
    }
    else {
        return { resource: null, default: null };
    }
}
function prepareData(data) {
    const d = !data ? {}
        : typeof data === "function" ? data()
            : data;
    if (d.child)
        throw Error("Data 'child' is preserved");
    d.child = "loading";
    return d;
}
function createResource(options, rco) {
    const props = prepareProperty(rco.props);
    const data = prepareData(rco.data);
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
    });
    const ro = {
        resource: {
            url: rco.url,
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
    };
    return wrap(co, options, ro);
}

const VueYarObject = {
    install: function (Vue$$1, options) {
        const actualOptions = createOptions(options);
        Vue$$1.withResource = function (wrappedComponentOptions, resourceOptions) {
            return wrap(wrappedComponentOptions, actualOptions, resourceOptions);
        };
        Vue$$1.resource = function (resourceComponentOptions) {
            return createResource(actualOptions, resourceComponentOptions);
        };
        Vue$$1.prototype.$resourceDelegate = function (f, ...arg) {
            logger.log("delegating");
            if (f) {
                f.call(this, ...arg);
            }
        };
    }
};
Vue.use(VueYarObject);

export default VueYarObject;
//# sourceMappingURL=vue-yar.js.map

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
function mapObject(input, mapper) {
    return Object.keys(input)
        .reduce((result, key) => {
        result[key] = mapper(key, input[key]);
        return result;
    }, {});
}
function includes(input, value) {
    return input.indexOf(value) >= 0;
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
    const resourceInfo = mapObject(resourceInfoParam, (_, value) => ({
        url: value["url"],
        refetch: value["refetch"],
        validate: value["validate"] || alwaysTrue,
        beforeLoad: value["beforeLoad"] || noop,
        loaded: value["loaded"] || noop,
        failed: value["failed"] || noop
    }));
    const urls = mapObject(resourceInfo, (_, value) => value.url);
    const resources = mapObject(resourceInfo, () => null);
    const watchTarget = Object.keys(resourceInfo).filter(key => resourceInfo[key].refetch);
    const watch = watchTarget.length > 0 ? {
        url: {
            handler(newValue, oldValue) {
                Object.keys(newValue).forEach((key) => {
                    if (newValue[key] !== oldValue[key] && includes(watchTarget, key)) {
                        this.load(key);
                    }
                });
            },
            deep: true
        }
    } : null;
    const mixin = {
        data: () => resources,
        computed: {
            url() {
                return mapObject(urls, (_, value) => unwrap(this, value));
            }
        },
        watch,
        mounted() {
            Object.keys(resourceInfo).forEach(this.load);
        },
        methods: {
            load(key) {
                resourceInfo[key]["beforeLoad"].call(this);
                const url = this.url[key];
                if (!url) {
                    logger.log("URL is not defined.");
                    return;
                }
                logger.log("Fetch URL: %s", url);
                Promise.resolve(network(url)).then(response => {
                    return validate(response) ? Promise.resolve(mutate(response)) : Promise.reject("gvf");
                }).then(result => {
                    if (resourceInfo[key]["validate"].call(this, result)) {
                        this[key] = result;
                        resourceInfo[key]["loaded"].call(this);
                        return Promise.resolve(null);
                    }
                    else {
                        return Promise.reject("vf");
                    }
                }).catch(e => {
                    if (e === "gvf") {
                        logger.warn("Global validation failed on key '%s'", key);
                    }
                    else if (e === "vf") {
                        logger.warn("Response validation failed on key '%s'", key);
                    }
                    else {
                        logger.warn("Unexpected error on '%s'", key);
                        logger.warn(e);
                    }
                    resourceInfo[key]["failed"].call(this, e);
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
            failed(e) {
                this.child = "failure";
                rco.failed && rco.failed(e);
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

export default VueYarObject;
//# sourceMappingURL=vue-yar.js.map

# vue-yar

Yet another resource fetching library for Vue

* Declarative
* Fluent & Intuitive
* Validation hook

```javascript
const resourceComponent = Vue.resource({
    url: `/your/api/`,
    template: {
        success: `<div>Fetched object is: {{ resource }}</div>`,
        failure: `<div>Error</div>`,
        loading: `<div>Loading...</div>`
    }
})
```

A sample file is found in `test/sample.js`.


## Simple resource component

```javascript
const component = Vue.resource({
    // Resource location
    url: `/api/user/${this.id}`,
    // Refetch the resource on change. If true, url must be function.
    refetch: false,
    // Can access to the fetched object via `this.resource`.
    template: {
        // Rendered if the fetch was successful
        success: `<p>ID: {{ resource.id }}, Name: {{ resource.name }}</p>`,
        // Rendered while loading
        loading: `<p>Loading...</p>`,
        // Rendered if the fetch failed
        failure: `<p>Error</p>`
    },
    // Can validate the fetched resource is correct or not
    validate() {
        return data.id && data.name
    },
    // vue-yar life cycle hook
    beforeLoad() {},
    loaded() {},
    failed() {},
    // Properties of a plain Vue component...
    props: ["id"], data() { return {} }, computed: {}, components: {}
})
```

## Resource mixin

```javascript
const resource = Vue.withResource({
    user: {
        url: `http://localhost:8080/api/user/${this.id}`,
        refetch: false,
        validate: response => {
            return response.id && response.name
        },
        beforeLoad() {},
        loaded() {},
        failed() {
            this.error = "Error!"
        }
    }
})

const component = Vue.component({
    props: ["id"],
    template: `
        <div>
            <p v-if="resource.error">Error</p>
            <p v-else-if="user">ID: {{ user.id }}, Name: {{ user.name }}</p>
            <p v-else>Loading...</p>
        </div>`,
    data: () => ({
        error: ""
    }),
    mixins: [resource]
})
```


## Options

```javascript
{
    // Function to fetch resources.
    // Default: `fetch(url, { method: "GET" })`
    network,
    // Global validator of the response.
    // Default: success if HTTP status was 200
    validate,
    // How the response is treated as the Vue data.
    // Default: if the response content type was `application/json`,
    //          assuming JSON object. Otherwise treated as plain text.
    mutate
}
```


## TODO

* Add unit tests
* Documentations
* POST request

# vue-yar

Yet another resource-fetching library for Vue.js

## Sample

## Simplified resource component

```javascript
Vue.resource({
    props: ["id"],
    // Resource location
    url: `http://localhost:8080/api/user/${this.id}`,
    template: {
        success: `<p>ID: {{ $resource.id }}, Name: {{ $resource.name }}</p>`,
        loading: `<p>Loading...</p>`,
        failure: `<p>Error</p>`
    },
    // If true, watch "url" and re-fetch the resource if necessary
    refetch: true,
    // Can validate the fetched resource is correct or not
    validate() {
        return data.id && data.name
    },
    // vue-yar life cycle hook
    beforeLoad() {},
    loaded() {},
    failed() {},
    // Properties of a plain Vue component...
    data() { return {} }, computed: {}, components: {}
})
```

## Resource HOC

```javascript
const resource = Vue.withResource({
    props: ["id", "resource"],
    template: `
        <div>
            <p v-if="resource.user && !resource.error">ID: {{ resource.user.id }}, Name: {{ resource.user.name }}</p>
            <p v-else-if="resource.error">Error</p>
            <p v-else>Loading...</p>
        </div>`,
    data: () => ({
        error: ""
    }),
},  {
    // user: `http://localhost:8080/api/user/${this.id}`
    user: {
        url: `http://localhost:8080/api/user/${this.id}`,
        refetch: true,
        validate: response => {
            return response.id && response.name
        },
        beforeLoad(key) {},
        loaded(key) {},
        failed(key) {
            this.error = "Error!"
        }
    }
})
Vue.component(resource)
```

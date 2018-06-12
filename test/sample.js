import Vue from "vue"
import VueYar from "../build/rollup/vue-yar"

// Load the plugin
Vue.use(VueYar)

// Resource Mixin

const resourceMixin = Vue.withResource({
    user: {
        url() {
            return `/api/user/${this.id}`
        },
        refetch: true,
        validate(r) {
            return r.id && r.name
        },
        loaded() {
            this.error = null
        },
        failed() {
            this.error = "Error"
        }
    }
})

const yourComponent1 = Vue.extend({
    template: `
        <div>
            <input type="number" v-model="id">
            <p v-if="error">Error</p>
            <p v-else-if="user">ID: {{ user.id }}, Name: {{ user.name }}</p>
            <p v-else>Loading...</p>
        </div>`,
    data: () => ({
        id: 1,
        error: ""
    }),
    mixins: [resourceMixin]
})


// Resource Component

const resourceComponent = Vue.resource({
    props: ["id"],
    url() {
        return `/api/user/${this.id}`
    },
    refetch: true,
    template: {
        success: `<div>ID: {{ resource.id }}, Name: {{ resource.name }}</div>`,
        failure: `<div>Error</div>`,
        loading: `<div>Loading...</div>`
    }
})

const yourComponent2 = Vue.extend({
    template: `
        <div>
            <input type="number" v-model="id">
            <user :id="id"></user>
        </div>`,
    data: () => ({
        id: 1
    }),
    components: {
        user: resourceComponent
    }
})

new Vue({
    el: "#app",
    template: `
        <div>
            <your-component-1></your-component-1>
            <your-component-2></your-component-2>
        </div>`,
    components: {
        yourComponent1,
        yourComponent2
    }
})

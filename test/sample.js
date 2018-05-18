import Vue from "vue"
import VueYar from "../src/vue-yar"

const component = Vue.extend({
    props: ["user"],
    template: `
        <div>
            <p v-if="error">Error</p>
            <p v-else-if="user">ID: {{ user.id }}, Name: {{ user.name }}</p>
            <p v-else>Loading...</p>
        </div>`,
    data: () => ({
        error: ""
    }),

    beforeLoad(key) {
        console.log("beforeLoad", key)
    },
    loaded(key) {
        console.log("loaded", key)
    },
    failed(key, e) {
        console.log("failed", key, e)
        this.error = "Failed"
    }
})

const resourceComponent = Vue.withResource(component, {
    user: {
        url: "http://localhost:8000/api/user/1",
        validate(r) {
            console.log("validate: %s", r)
            return false
        },
        failed( e) {
            console.log("failed on ro", e)
            this.error = "Failed"
        }
    }
})

new Vue({
    el: "#app",
    template: `<resource-component></resource-component>`,
    components: {
        resourceComponent
    }
})

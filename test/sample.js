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

    beforeLoad() {
        console.log("beforeLoad")
    },
    loaded() {
        console.log("loaded")
    },
    failed(e) {
        console.log("failed", e)
        this.error = "Failed!"
    }
})

const resourceComponent = Vue.withResource(component, {
    user: {
        url: "http://localhost:8000/api/user/1",
        validate(r) {
            console.log("validate: %s", r)
            return true
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

import Vue from "vue"
import VueYar from "../build/rollup/vue-yar"

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
    })
})

const resourceComponent = Vue.withResource(component, {
    user: {
        url: "http://localhost:8000/api/user/1",
        validate(r) {
            console.log("validate: %s", r)
            return true
        },
        beforeLoad() {
            console.log("beforeLoad")
        },
        loaded() {
            console.log("loaded")
        },
        failed(e) {
            console.log("failed on ro", e)
            this.error = "failed hook"
        }
    }
})

// const resourceComponent = Vue.resource({
//     url: "http://localhost:8000/api/user/1",
//     template: {
//         success: `<div>ID: {{ resource.id }}, Name: {{ resource.name }}</div>`,
//         failure: `<div>Error</div>`,
//         loading: `<div>Loading...</div>`
//     }
// })

new Vue({
    el: "#app",
    template: `<resource-component></resource-component>`,
    components: {
        resourceComponent
    }
})

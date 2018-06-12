import Vue from "vue"
import VueYar from "../build/rollup/vue-yar"

Vue.use(VueYar)

// const resource = Vue.withResource({
//     user: {
//         url() {
//             return `/api/user/${this.id}`
//         },
//         refetch: true,
//         validate(r) {
//             console.log("validate: %s", r)
//             return true
//         },
//         beforeLoad() {
//             console.log("beforeLoad")
//         },
//         loaded() {
//             console.log("loaded")
//             this.error = ""
//         },
//         failed(e) {
//             console.log("failed on ro", e)
//             this.error = "failed hook"
//         }
//     }
// })

// const resourceComponent = Vue.extend({
//     template: `
//         <div>
//             <input type="number" v-model="id">
//             <p v-if="error">Error</p>
//             <p v-else-if="user">ID: {{ user.id }}, Name: {{ user.name }}</p>
//             <p v-else>Loading...</p>
//         </div>`,
//     data: () => ({
//         id: 1,
//         error: ""
//     }),
//     mixins: [resource]
// })

const resourceComponent = Vue.resource({
    // url: "/api/user/1",
    props: ["id"],
    url() {
        return `/api/user/${this.id}`
    },
    template: {
        success: `<div>ID: {{ resource.id }}, Name: {{ resource.name }}</div>`,
        failure: `<div>Error</div>`,
        loading: `<div>Loading...</div>`
    }
})

const yourComponent = Vue.extend({
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
    template: `<your-component></your-component>`,
    components: {
        yourComponent
    }
})

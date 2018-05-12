import Vue from 'vue'
import VueYar from '../../../src/main/typescript/vue-yar'

function main() {

    Vue.use(VueYar, { test1: "ypa!" })

    const vm = new Vue({
        el: "#app",
        template: `
            <div>
                <p>{{ value }}</p>
                <p>{{ json }}</p>
                <p>{{ error }}</p>
            </div>`,
        data: () => ({
            error: ""
        }),
        computed: {
            value: function () {
                return this.test1 ? this.test1.substring(0, 20) : ""
            },
            json: function () {
                return this.test3 && this.test3.greeting ? this.test3.greeting : ""
            }
        },
        resource: {
            test1: "./index.js",
            test2: "will_not_found",
            test3: "index.json"
        }
    })
    vm.$on("resource.error", function (r) {
        this.error = "エラー"
    })
}

// noinspection JSUnusedGlobalSymbols
export default main

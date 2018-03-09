import Vue from 'vue'
import VueYar from '../../../build/typescript/rollup/vue-yar'

function main() {

    Vue.use(VueYar, { test: "ypa!" })

    new Vue({
        el: "#app",
        template: `<div>{{ value }}</div>`,
        computed: {
            value: function () {
                return this.test
            }
        },
        resource: {
            test: "./index.js"
        }
    })
}

// noinspection JSUnusedGlobalSymbols
export default main

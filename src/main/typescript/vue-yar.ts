const VueYar: any = {

    install: function (Vue: any, options: any) {

        console.log("install")
        console.log(options)

        Object.defineProperties(Vue.prototype, {
            $resource: {
                get: () => ({ $options: options })
            }
        })

        Vue.mixin({
            data() {
                const resource = this.$options.resource
                const dataObj: any = {}
                Object.keys(resource).forEach(k => {
                    dataObj[k] = null
                })
                return dataObj
            },
            created() {
                const resource = this.$options.resource
                Object.keys(resource).forEach(k => {
                    fetch(resource[k], {
                        method: "GET"
                    }).then(response => response.text())
                      .then(text => {
                          this[k] = text
                      })
                      .catch(r => {
                          console.log(r)
                          this[k] = "エラー"
                      })
                })
            }
        })
    }
}

//noinspection JSUnusedGlobalSymbols
export default VueYar

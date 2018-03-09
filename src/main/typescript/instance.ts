import Registry from "./registry"

class VueYar {

    constructor(private registry: Registry) {}

    public get options() {
        return this.registry.options
    }

    public get mixin(): any {
        const instance = this

        return {
            data() {
                // 指定されたリソースのdataをVueのキーに追加して、利用可能にする
                const dataObj: any = {}
                Object.keys(this.$options.resource).forEach(k => {
                    dataObj[k] = null
                })
                return dataObj
            },
            created() {
                Object.keys(this.$options.resource).forEach(k => {
                    return instance.fetch(instance, this, k)
                })
            }
        }
    }

    private fetch(instance: VueYar, vm: any, resourceKey: string): void {

        instance.registry.window.fetch(vm.$options.resource[resourceKey], {
            method: "GET"
        }).then(response => {
            if (response.headers.get("Content-Type") == "application/json") {
                return response.json()
            } else {
                return response.text()
            }
        }).then(body => {
            vm[resourceKey] = body
        }).catch(r => {
            vm[resourceKey] = null
            vm.$emit("resource.error", r)
        })
    }

}

export default VueYar

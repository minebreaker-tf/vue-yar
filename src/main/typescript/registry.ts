import { VueYarOption } from "../types/vue-yar"

class Registry {

    public constructor(
        public options: VueYarOption
    ) {
        this._window = options.window ? options.window : window
    }

    public readonly _window: Window
    get window(): Window {
        return this._window
    }
}


export default Registry

import Vue from 'vue'
import {
    CombinedVueInstanceWithResource, ComponentOptions, ThisTypedComponentOptionsWithArrayPropsWithResource,
    ThisTypedComponentOptionsWithRecordPropsWithResource
} from 'vue/types/options';
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options';
import { CombinedVueInstance } from 'vue/types/vue';
import { ThisTypedComponentOptionsWithArrayProps } from 'vue/types/options';

export interface VueYar {
    install: (constructor: any, options?: VueYarOption) => void
}

export interface VueYarOption {
    window?: Window
}

export interface ResourceOption {
    url: string
    init?: () => any | any
}

export interface Resource {
    $options: ResourceOption
}

declare module 'vue/types/vue' {

    interface Vue {
        $resource: Resource
    }

    interface VueConstructor<V extends Vue> {

        new <Data = object, Methods = object, Computed = object, PropNames extends string = never>(
            options?: ThisTypedComponentOptionsWithArrayPropsWithResource<V, Data, Methods, Computed, PropNames>
        ): CombinedVueInstanceWithResources<V, Data, Methods, Computed, Record<PropNames, any>>;

        new <Data = object, Methods = object, Computed = object, Props = object>(
            options?: ThisTypedComponentOptionsWithRecordPropsWithResource<V, Data, Methods, Computed, Props>
        ): CombinedVueInstanceWithResources<V, Data, Methods, Computed, Record<keyof Props, any>>;

        new (options?: ComponentOptions<V>): CombinedVueInstanceWithResource<V, object, object, object, Record<keyof object, any>, object>;
    }

    export type CombinedVueInstanceWithResources<Instance extends Vue, Data, Methods, Computed, Props, Resources> =
        Data & Methods & Computed & Props & Instance & Resources;

}

declare module 'vue/types/options' {

    interface ComponentOptions<V extends Vue> {
        resource?: any
    }

    export type ThisTypedComponentOptionsWithArrayPropsWithResources<V extends Vue, Data, Methods, Computed, PropNames extends string> =
        object &
        ComponentOptions<V, Data | ((this: Readonly<Record<PropNames, any>> & V) => Data), Methods, Computed, PropNames[]> &
        ThisType<CombinedVueInstance<V, Data, Methods, Computed, Readonly<Record<PropNames, any>>>>;

    export type ThisTypedComponentOptionsWithRecordPropsWithResources<V extends Vue, Data, Methods, Computed, Props> =
        object &
        ComponentOptions<V, Data | ((this: Readonly<Props> & V) => Data), Methods, Computed, RecordPropsDefinition<Props>> &
        ThisType<CombinedVueInstance<V, Data, Methods, Computed, Readonly<Props>>>;

}

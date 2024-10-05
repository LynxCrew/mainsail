<template>
    <button v-if="iconSource != undefined"
            type="button"
            :class="buttonClasses"
            :style="{ color: color, caretColor: strokeColor }"
            @click="enableClick && $emit('click')"
            :inert="!enableClick">
        <inline-svg :src="iconSource"
                    :width="width || size"
                    :height="height || size"
                    class="v-icon__svg"
                    role="img"
                    aria-hidden="true"
                    />
    </button>
    <v-icon v-else
            :width="width || size"
            :height="height || size"
            :style="{ color: color, caretColor: strokeColor }"
            @click="enableClick && $emit('click')"
            :inert="!enableClick">
        {{ defaultIcon }}
    </v-icon>
</template>

<script lang="ts">
import InlineSvg from 'vue-inline-svg'
import {mdiThermometer} from "@mdi/js";
import {Mixins, Prop} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";
import Component from "vue-class-component";

@Component({
    components: {InlineSvg,}
})
export default class TemperaturePanelListItem extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) readonly name!: String
    @Prop({ type: String, default: undefined }) readonly defaultSource!: String
    @Prop({ type: String, default: mdiThermometer }) readonly defaultIcon!: String
    @Prop({ type: Boolean, default: false }) readonly enableClick!: Boolean
    @Prop({ type: Number, default: undefined }) readonly width!: String
    @Prop({ type: Number, default: undefined }) readonly height!: String
    @Prop({ type: Number, default: undefined }) readonly size!: String
    @Prop({ type: String, default: undefined }) readonly color!: String
    @Prop({ type: String, default: undefined }) readonly strokeColor!: String

    get iconSource() {
        return this.$store.getters['files/getCustomIcon'](this.name) ?? this.defaultSource
    }

    get buttonClasses(){
        const classes = ["v-icon", "notranslate", "v-icon--link", "_no-focus-style"]

        if (this.enableClick) {
            classes.push("cursor-pointer")
        }

        if (this.$store.state.gui.uiSettings.mode == "light") {
            classes.push("theme--light")
        } else {
            classes.push("theme--dark")
        }

        return classes
    }
}
</script>

<style scoped>
:focus {
    outline: none !important;
}
</style>

<template>
    <v-row>
        <v-col class="py-1">
            <v-checkbox v-model="disableAnimation" :label="this.$t('Panels.TemperaturePanel.Animation')" hide-details class="mt-0" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class TemperaturePanelListItemEditAdditionalSensor extends Mixins(BaseMixin) {

    @Prop({ type: String, required: true }) readonly objectName!: string

    get disableAnimation() {
        return this.$store.getters['gui/getDisableFanAnimation']({
            name: this.objectName,
        })
    }

    set disableAnimation(newVal) {
        this.$store.dispatch('gui/setDisableFanAnimation', {
            objectName: this.objectName,
            value: newVal,
        })
    }
}
</script>

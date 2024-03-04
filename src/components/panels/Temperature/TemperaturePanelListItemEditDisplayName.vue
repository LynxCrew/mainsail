<template>
    <v-row>
        <v-col class="col-12 py-1">
            <v-text-field
                v-model="value"
                :label="$t('Panels.TemperaturePanel.DisplayName')"
                hide-details="auto"
                dense
                outlined>
            </v-text-field>
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

    get value() {
        return this.$store.getters['gui/getDisplayName']({
            name: this.objectName,
        })
    }

    set value(newVal) {
        this.$store.dispatch('gui/setDisplayName', {
            objectName: this.objectName,
            value: newVal,
        })
    }

    get label() {
        return this.$t('Panels.TemperaturePanel.DisplayName')
    }
}
</script>

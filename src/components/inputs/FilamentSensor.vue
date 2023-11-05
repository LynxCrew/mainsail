<style scoped>
._filamentRunout-subheader {
    height: auto;
}
</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="_filamentRunout-subheader">
                    <v-icon small class="mr-2">{{ mdiPrinter3dNozzleAlert }}</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer></v-spacer>
                    <small :class="'mr-3 --text'">{{ infoText }}</small>
                    <small :class="'mr-3 ' + statusColor + '--text'">{{ statusText }}</small>
                    <v-icon @click="changeSensor">
                        {{ enabled ? mdiToggleSwitch : mdiToggleSwitchOffOutline }}
                    </v-icon>
                </v-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { convertName } from '@/plugins/helpers'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiPrinter3dNozzleAlert, mdiToggleSwitch, mdiToggleSwitchOffOutline } from '@mdi/js'
import {PrinterStateFilamentSensors} from "@/store/printer/types";

@Component
export default class FilamentSensor extends Mixins(BaseMixin) {
    /**
     * Icons
     */

    mdiToggleSwitch = mdiToggleSwitch
    mdiToggleSwitchOffOutline = mdiToggleSwitchOffOutline
    mdiPrinter3dNozzleAlert = mdiPrinter3dNozzleAlert

    convertName = convertName

    @Prop({ type: String, required: true }) declare readonly name: string
    @Prop({type: String, required: true }) declare readonly info: string
    @Prop({ type: Boolean, required: true }) declare readonly enabled: boolean
    @Prop({ type: Boolean, required: true }) declare readonly filament_detected: boolean
    @Prop({ type: String, required: true }) declare readonly type: string

    get statusColor() {
        if (!this.enabled) return 'gray'
        else if (this.filament_detected) return 'success'
        else return 'danger'
    }

    get statusText() {
        if (!this.enabled) return this.$t('Panels.MiscellaneousPanel.RunoutSensor.Disabled')
        else if (this.filament_detected) return this.$t('Panels.MiscellaneousPanel.RunoutSensor.Detected')
        else return this.$t('Panels.MiscellaneousPanel.RunoutSensor.Empty')
    }

    get infoText() {
        if (this.type == 'switch' && this.showRunoutDistance && (this.enabled || !this.hideRunoutDistanceOnDisabled)) {
            return this.info
        }

        if (this.type == 'motion' && this.showDetectionLength && (this.enabled || !this.hideDetectionLengthOnDisabled)) {
            return this.info
        }

        return ""
    }

    changeSensor() {
        const gcode = 'SET_FILAMENT_SENSOR SENSOR=' + this.name + ' ENABLE=' + (this.enabled ? 0 : 1)
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    get showDetectionLength() {
        return this.$store.state.gui.uiSettings.showDetectionLength ?? true
    }

    get hideDetectionLengthOnDisabled() {
        return this.$store.state.gui.uiSettings.hideDetectionLengthOnDisabled ?? true
    }

    get showRunoutDistance() {
        return this.$store.state.gui.uiSettings.showRunoutDistance ?? true
    }

    get hideRunoutDistanceOnDisabled() {
        return this.$store.state.gui.uiSettings.hideRunoutDistanceOnDisabled ?? true
    }
}
</script>

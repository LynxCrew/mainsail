<template>
    <tr v-longpress:600="(e) => openContextMenu(e)" @contextmenu.prevent="openContextMenu($event)">
        <td class="icon">
            <template @click="openEditDialog">
                <DynamicIcon
                    :name="name"
                    :default-source="iconSource"
                    :default-icon="icon"
                    :color="iconColor"
                    :class="iconClass"
                    tabindex="-1"
                    enable-click
                    @click="openEditDialog"/>
            </template>
        </td>
        <td class="name">
            <span class="cursor-pointer" @click="openEditDialog">{{ formatName }}</span>
        </td>
        <td v-if="!isResponsiveMobile && !hideHeaterProfiles" class="heater-profile">
            <form @submit.prevent="setHeaterProfile"
                  @mouseover="focused = true"
                  @mouseleave="focused = false">
                <v-text-field
                v-if="loaded_heater_profile !== null"
                class="_heater-profile-input pr-6"
                :rules="[rules.heater_profile]"
                v-model="heater_profile"
                dense
                outlined
                hide-details
                hide-spin-buttons
                @blur="heaterProfile = loaded_heater_profile"
                @focus="$event.target.select()">
                    <template v-if="heater_profile !== 'default' && focused" #append>
                        <v-btn
                            icon
                            class="_heater-profile-reset"
                            @click="resetHeaterProfile">
                            <v-icon>{{ mdiRefresh }}</v-icon>
                        </v-btn>
                    </template>
                </v-text-field>
            </form>
        </td>
        <td v-if="!isResponsiveMobile" class="state">
            <v-tooltip v-if="state !== null" top>
                <template #activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on">{{ formatState }}</div>
                </template>
                <span>{{ $t('Panels.TemperaturePanel.Avg') }}: {{ avgState }} %</span>
            </v-tooltip>
        </td>
        <td class="current">
            <v-tooltip top :disabled="(measured_min_temp === null && measured_max_temp === null) || (measured_min_temp === '0.0' && measured_max_temp === '0.0')">
                <template #activator="{ on, attrs }">
                    <span style="cursor: default" v-bind="attrs" v-on="on">
                        {{ formatTemperature }}
                    </span>
                </template>
                <span>
                    {{ $t('Panels.TemperaturePanel.Max') }}: {{ measured_max_temp ?? "--" }}°C
                    <br />
                    {{ $t('Panels.TemperaturePanel.Min') }}: {{ measured_min_temp ?? "--" }}°C
                </span>
            </v-tooltip>
            <div v-if="rpm !== null">
                <small :class="rpmClass">{{ rpm }} RPM</small>
            </div>
            <temperature-panel-list-item-additional-sensor
                v-if="additionalSensorName"
                :object-name="objectName"
                :additional-object-name="additionalSensorName" />
        </td>
        <td class="target">
            <temperature-input
                v-if="command !== null"
                :name="name"
                :target="target"
                :presets="presets"
                :min_temp="min_temp"
                :max_temp="max_temp"
                :command="command"
                :attribute-name="commandAttributeName" />
        </td>
        <temperature-panel-list-item-edit
            :bool-show="showEditDialog"
            :object-name="objectName"
            :name="name"
            :format-name="defaultName"
            :additional-sensor-name="additionalSensorName"
            :icon="icon"
            :icon-color="iconColor"
            :color="color"
            @close-dialog="showEditDialog = false" />
        <v-menu v-model="showContextMenu" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item v-if="isHeater" :disabled="!isHeaterActive" @click="turnOffHeater">
                    <v-icon left>{{ mdiSnowflake }}</v-icon>
                    {{ $t('Panels.TemperaturePanel.TurnHeaterOff') }}
                </v-list-item>
                <v-list-item @click="openEditDialog">
                    <v-icon left>{{ mdiCog }}</v-icon>
                    {{ $t('Panels.TemperaturePanel.Settings') }}
                </v-list-item>
            </v-list>
        </v-menu>
    </tr>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins, Prop, Watch} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { convertName } from '@/plugins/helpers'
import {
    mdiCog,
    mdiFan,
    mdiFire,
    mdiMemory,
    mdiPrinter3dNozzle,
    mdiPrinter3dNozzleAlert,
    mdiRadiator,
    mdiRadiatorDisabled,
    mdiSnowflake,
    mdiThermometer,
    mdiRefresh,
    mdiPrinter3dNozzleOff,
} from '@mdi/js'
import {
    additionalSensors,
    opacityHeaterActive,
    opacityHeaterInactive,
    opacityStepperActive,
    opacityStepperInactive,
} from '@/store/variables'
import DynamicIcon from "@/components/icons/DynamicIcon.vue";
import { CLOSE_TEMPERATURE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'

@Component({
    components: {DynamicIcon},
})
export default class TemperaturePanelListItem extends Mixins(BaseMixin) {
    mdiRefresh = mdiRefresh
    mdiCog = mdiCog
    mdiSnowflake = mdiSnowflake

    @Prop({ type: String, required: true }) readonly objectName!: string
    @Prop({ type: Boolean, required: true }) readonly isResponsiveMobile!: boolean

    
    showContextMenu = false
    contextMenuX = 0
    contextMenuY = 0
    showEditDialog = false
    focused = false
    heaterProfile = this.printerObject.heater_profile ?? null
    heater_name = (this.$store.state.printer?.toolhead?.improved_axes_def && this.objectName.startsWith("extruder"))
        ? "hotend" + this.objectName.replace("extruder", "")
        : this.objectName

    private rules = {
        heater_profile: (value: string) => this.heaterProfileExists(value) || this.$t('Panels.TemperaturePanel.HeaterProfileNotAllowed')
    }

    heaterProfileExists(name: string) {
        if (name == 'autotune') return true;
        const heaterProfiles = this.getHeaterProfiles
        for (let i = 0; i < heaterProfiles.length; i++) {
            if (name == heaterProfiles[i]) {
                return true
            }
        }
        return false
    }

    get printerObject() {
        if (!(this.objectName in this.$store.state.printer)) return {}

        return this.$store.state.printer[this.objectName]
    }

    get printerObjectSettings() {
        // convert objectName to lowercase, because klipper only user lowercase in configfile.settings
        const lowerCaseObjectName = this.heater_name.toLowerCase()

        if (!(lowerCaseObjectName in (this.$store.state.printer?.configfile?.settings ?? {}))) return {}

        return this.$store.state.printer?.configfile?.settings[lowerCaseObjectName]
    }

    get name() {
        const splits = this.objectName.split(' ')
        if (splits.length === 1) return this.objectName

        return splits[1]
    }

    get defaultName() {
        return convertName(this.name)
    }

    get formatName() {
        if (this.displayName != '' && this.displayName != null) return this.displayName

        return convertName(this.name)
    }

    get displayName() {
        return this.$store.getters['gui/getDisplayName']({
            name: this.objectName,
        })
    }

    get icon() {
        // handle extruder icons
        if (this.objectName.startsWith('extruder')) {
            if (this.printerObject.can_extrude ?? false) return mdiPrinter3dNozzle

            if (
                (this.temperature !== null && this.temperature > 50) ||
                (this.target && this.temperature && this.temperature > this.target - 5)
            ) return mdiPrinter3dNozzleAlert

            return mdiPrinter3dNozzleOff
        }

        // show heater_bed icon
        if (this.objectName === 'heater_bed') {
            if (
                (this.temperature !== null && this.temperature > 50) ||
                (this.target && this.temperature && this.temperature > this.target - 5)
            )
                return mdiRadiator

            return mdiRadiatorDisabled
        }

        // show heater_generic icon
        if (this.objectName.startsWith('heater_generic')) return mdiFire

        // show heater_generic icon
        if (this.objectName.startsWith('tmc')) return mdiMemory

        // show fan icon, if it is a fan
        if (this.isFan) return mdiFan

        return mdiThermometer
    }

    get iconSource() {
        if (this.isBeacon) return "/img/beacon-icon.svg"

        return undefined
    }

    get color() {
        return this.$store.getters['printer/tempHistory/getDatasetColor'](this.objectName) ?? '#FFFFFF'
    }

    get iconColor() {
        if (this.objectName.startsWith('tmc')) {
            const steppers = this.$store.state.printer.stepper_enable?.steppers
            const stepper_name = this.objectName.split(" ").pop()
            if (steppers != undefined && stepper_name != undefined && (steppers[stepper_name] ?? true)) {
                return `${this.color}${opacityStepperActive}`
            }

            return `${this.color}${opacityStepperInactive}`
        }
        // set icon color to active, if no target exists (temperature_sensors) or a heater is active
        if (this.target === null || this.target > 0) return `${this.color}${opacityHeaterActive}`

        return `${this.color}${opacityHeaterInactive}`
    }

    get iconClass() {
        const classes = ['_no-focus-style', 'cursor-pointer']
        // add icon animation, when it is a fan and state > 0
        if (this.isFan) {
            if (!this.disableFanAnimation && (this.state ?? 0) > 0) classes.push('icon-rotate')
        }

        return classes
    }

    get disableFanAnimation() {
        return (this.$store.state.gui?.uiSettings.disableFanAnimation ?? false)
            || this.$store.getters['gui/getDisableFanAnimation']({
            name: this.objectName,
        })
    }

    get isFan() {
        return this.objectName.startsWith('temperature_fan') || this.objectName.startsWith('controller_temperature_fan')
    }

    get state(): number | null {
        return this.printerObject.power ?? this.printerObject.real_power ?? this.printerObject.speed ?? null
    }

    set heater_profile(newval: string) {
        this.heaterProfile = newval
    }

    get heater_profile(): string {
        return this.heaterProfile
    }

    get loaded_heater_profile(): string | null {
        return this.printerObject.heater_profile ?? null
    }

    get getHeaterProfiles(): string[] {
        return this.$store.getters['printer/getHeaterProfiles']?.get(this.heater_name) ?? {}
    }

    get isBeacon(): boolean {
        return this.printerObjectSettings.sensor_type?.startsWith("beacon_coil") || (this.printerObjectSettings.sensor_type === "temperature_mcu" && this.printerObjectSettings.sensor_mcu?.startsWith("beacon"))
    }

    resetHeaterProfile():void {
        this.heaterProfile = "default"
        this.setHeaterProfile()
    }

    setHeaterProfile():void {
        if (!this.heaterProfileExists(this.heaterProfile)) {
            this.$toast.error(
                this.$t('Panels.TemperaturePanel.UnknownHeaterProfile', { profile: this.heaterProfile, heater: this.heater_name }) + ''
            )
        } else {
            const gcode = 'HEATER_PROFILE HEATER=' + this.heater_name + ' LOAD=' + this.heaterProfile
            this.$store.dispatch('server/addEvent', {
                message: gcode,
                type: 'command',
            })
            this.$socket.emit('printer.gcode.script', {script: gcode}, {loading: 'macro_' + gcode})
        }
    }

    @Watch('loaded_heater_profile')
    heaterProfileChanged(newVal: any): void {
        this.heaterProfile = this.printerObject.heater_profile
    }

    get formatState() {
        if (this.state === null) return null
        if (this.target === 0 && this.state === 0) return 'off'

        return `${Math.round(this.state * 100)} %`
    }

    get avgPower() {
        return this.$store.getters['printer/tempHistory/getAvgPower'](this.objectName) ?? 0
    }

    get avgSpeed() {
        return this.$store.getters['printer/tempHistory/getAvgSpeed'](this.objectName) ?? 0
    }

    get avgState() {
        if ('power' in this.printerObject) return Math.round(this.avgPower)
        if ('speed' in this.printerObject) return Math.round(this.avgSpeed)

        return null
    }

    get temperature(): number | null {
        return this.printerObject?.temperature ?? null
    }

    get formatTemperature() {
        return `${this.temperature?.toFixed(1) ?? '--'}°C`
    }

    get min_temp() {
        return parseInt(this.printerObjectSettings.min_temp ?? 0)
    }

    get max_temp() {
        return parseInt(this.printerObjectSettings.max_set_temp ?? 0)
    }

    get measured_min_temp() {
        return this.printerObject?.measured_min_temp?.toFixed(1) ?? null
    }

    get measured_max_temp() {
        return this.printerObject?.measured_max_temp?.toFixed(1) ?? null
    }

    get target() {
        return this.printerObject?.target ?? null
    }

    get additionalSensorName() {
        if (this.objectName === 'z_thermal_adjust') return 'z_thermal_adjust'

        const additionalSensorName = additionalSensors.find((sensorName) => {
            const objectName = `${sensorName} ${this.name}`

            if (objectName in this.$store.state.printer) return true
        })

        if (!additionalSensorName) return null

        return `${additionalSensorName} ${this.name}`
    }

    get rpm() {
        const rpm = this.printerObject.rpm ?? null

        // return null when rpm doesn't exist
        if (rpm === null) return null

        let rpmNumber = parseInt(this.printerObject.rpm)

        return isNaN(rpmNumber) ? null : rpmNumber
    }

    get rpmClass() {
        if (this.rpm === 0 && (this.printerObject.speed ?? 0) > 0) return 'red--text'

        return ''
    }

    get presets() {
        return this.$store.getters['gui/presets/getPresetsFromHeater']({ name: this.objectName }) ?? []
    }

    get command() {
        if (this.objectName.startsWith('temperature_fan')) return 'SET_TEMPERATURE_FAN_TARGET'
        if (this.objectName.startsWith('extruder') || this.objectName.startsWith('heater_'))
            return 'SET_HEATER_TEMPERATURE'

        return null
    }

    get commandAttributeName() {
        if (this.command === 'SET_HEATER_TEMPERATURE') return 'HEATER'
        if (this.command === 'SET_TEMPERATURE_FAN_TARGET') return 'TEMPERATURE_FAN'

        return ''
    }

    get hideHeaterProfiles(): boolean {
        return this.$store.state.gui.view.tempchart.hideHeaterProfiles ?? false
    }

    get availableHeaters() {
        return this.$store.state.printer.heaters?.available_heaters ?? []
    }

    get isHeater() {
        return this.availableHeaters.includes(this.objectName)
    }

    get isHeaterActive() {
        return this.target > 0
    }

    mounted() {
        EventBus.$on(CLOSE_TEMPERATURE_CONTEXT_MENU, this.closeContextMenu)
    }

    beforeDestroy() {
        EventBus.$off(CLOSE_TEMPERATURE_CONTEXT_MENU, this.closeContextMenu)
    }

    openContextMenu(event: MouseEvent) {
        EventBus.$emit(CLOSE_TEMPERATURE_CONTEXT_MENU)

        this.showContextMenu = true
        this.contextMenuX = event?.clientX || event?.pageX || window.screenX / 2
        this.contextMenuY = event?.clientY || event?.pageY || window.screenY / 2
    }

    closeContextMenu() {
        this.showContextMenu = false
    }

    openEditDialog() {
        this.closeContextMenu()
        this.showEditDialog = true
    }

    turnOffHeater() {
        const gcode = `SET_HEATER_TEMPERATURE HEATER=${this.name} TARGET=0`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>

<style scoped>
::v-deep .v-icon._no-focus-style:focus::after {
    opacity: 0 !important;
}

::v-deep .cursor-pointer {
    cursor: pointer;
}

.heater-profile {
    padding-right: 10px !important;
}

._heater-profile-input {
    width: 6.0rem;
    padding-right: 0 !important;
}

._heater-profile-input >>> .v-input__slot {
    min-height: 1rem !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
}

._heater-profile-input >>> .v-text-field__slot input {
    text-align: center !important;
    padding-top: 4px;
    padding-bottom: 4px;
    min-width: 4rem;
}

._heater-profile-reset {
    margin-top: -6px;
    margin-left: -5px;
    margin-right: -4px;
    height: 24px;
    width: 24px;
    padding: 0;
}
</style>

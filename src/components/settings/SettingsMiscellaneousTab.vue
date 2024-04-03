<template>
    <div>
        <settings-miscellaneous-tab-light-groups
            v-if="editLightGroupObject"
            :light="editLightGroupObject"
            @close="editLightGroupObject = null" />
        <settings-miscellaneous-tab-light-presets
            v-else-if="editLightPresetObject"
            :light="editLightPresetObject"
            @close="editLightPresetObject = null" />
        <v-card-text v-else>
            <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.Miscellaneous') }}</h3>
            <settings-row
                :title="$t('Settings.MiscellaneousTab.ShowRealPWM')"
                :sub-title="$t('Settings.MiscellaneousTab.ShowRealPWMDescription')"
                :dynamic-slot-width="true">
                <v-switch v-model="showRealPWM" hide-details class="mt-0" />
            </settings-row>
            <v-divider class="my-2" />
            <settings-row
                :title="$t('Settings.MiscellaneousTab.HideMiscellaneousLight')"
                :sub-title="$t('Settings.MiscellaneousTab.HideMiscellaneousLightDescription')"
                :dynamic-slot-width="true">
                <v-switch v-model="hideMiscellaneousLight" hide-details class="mt-0" />
            </settings-row>
            <v-divider class="my-2" />
            <settings-row
                :title="$t('Settings.MiscellaneousTab.ShowStateOnDisabled')"
                :sub-title="$t('Settings.MiscellaneousTab.ShowStateOnDisabledDescription')"
                :dynamic-slot-width="true">
                <v-switch v-model="showStateOnDisabled" hide-details class="mt-0" />
            </settings-row>
            <v-divider class="my-2" />
            <settings-row
                :title="$t('Settings.MiscellaneousTab.ShowDetectionLength')"
                :sub-title="$t('Settings.MiscellaneousTab.ShowDetectionLengthDescription')"
                :dynamic-slot-width="true">
                <v-switch v-model="showDetectionLength" hide-details class="mt-0" />
            </settings-row>
            <template v-if="showDetectionLength">
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.MiscellaneousTab.HideDetectionLengthOnDisabled')"
                    :sub-title="$t('Settings.MiscellaneousTab.HideDetectionLengthOnDisabledDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="hideDetectionLengthOnDisabled" hide-details class="mt-0" />
                </settings-row>
            </template>
            <v-divider class="my-2" />
            <settings-row
                :title="$t('Settings.MiscellaneousTab.ShowRunoutDistance')"
                :sub-title="$t('Settings.MiscellaneousTab.ShowRunoutDistanceDescription')"
                :dynamic-slot-width="true">
                <v-switch v-model="showRunoutDistance" hide-details class="mt-0" />
            </settings-row>
            <template v-if="showRunoutDistance">
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.MiscellaneousTab.HideRunoutDistanceOnDisabled')"
                    :sub-title="$t('Settings.MiscellaneousTab.HideRunoutDistanceOnDisabledDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="hideRunoutDistanceOnDisabled" hide-details class="mt-0" />
                </settings-row>
            </template>
            <v-divider class="my-2" />
            <template v-if="filteredLights.length">
                <div v-for="(light, index) in filteredLights" :key="index">
                    <v-divider v-if="index" class="my-2"></v-divider>
                    <settings-row :title="convertName(light.name)" :dynamic-slot-width="true">
                        <v-btn
                            v-if="light.chainCount > 1"
                            small
                            outlined
                            class="ml-3"
                            @click="editLightGroupObject = light">
                            <v-icon left small>{{ mdiPencil }}</v-icon>
                            {{ $t('Settings.MiscellaneousTab.Groups') }}
                        </v-btn>
                        <v-btn small outlined class="ml-3" @click="editLightPresetObject = light">
                            <v-icon left small>{{ mdiPalette }}</v-icon>
                            {{ $t('Settings.MiscellaneousTab.Presets') }}
                        </v-btn>
                    </settings-row>
                </div>
            </template>
            <template v-else>
                <v-row>
                    <v-col>
                        <p class="mb-0 text-center font-italic">{{ $t('Settings.MiscellaneousTab.NoDevicesFound') }}</p>
                    </v-col>
                </v-row>
            </template>
        </v-card-text>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPalette, mdiPencil } from '@mdi/js'
import { convertName } from '@/plugins/helpers'
import SettingsMiscellaneousTabLightGroups from '@/components/settings/SettingsMiscellaneousTabLightGroups.vue'
import SettingsMiscellaneousTabLightPresets from '@/components/settings/SettingsMiscellaneousTabLightPresets.vue'
import { PrinterStateLight } from '@/store/printer/types'

@Component({
    components: {
        SettingsRow,
        SettingsMiscellaneousTabLightGroups,
        SettingsMiscellaneousTabLightPresets,
    },
})
export default class SettingsMiscellaneousTab extends Mixins(BaseMixin) {
    mdiDelete = mdiDelete
    mdiPalette = mdiPalette
    mdiPencil = mdiPencil

    convertName = convertName

    editLightGroupObject: PrinterStateLight | null = null
    editLightPresetObject: PrinterStateLight | null = null

    get lights() {
        return this.$store.getters['printer/getLights'] ?? []
    }

    get filteredLights() {
        return this.lights.filter((light: PrinterStateLight) => light.colorOrder.length > 1)
    }

    get showRealPWM() {
        return this.$store.state.gui.uiSettings.showRealPWM ?? false
    }

    set showRealPWM(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.showRealPWM', value: newVal })
    }

    get hideMiscellaneousLight() {
        return this.$store.state.gui.uiSettings.hideMiscellaneousLight ?? false
    }

    set hideMiscellaneousLight(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.hideMiscellaneousLight', value: newVal })
    }

    get showStateOnDisabled() {
        return this.$store.state.gui.uiSettings.showStateOnDisabled ?? true
    }

    set showStateOnDisabled(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.showStateOnDisabled', value: newVal })
    }

    get showDetectionLength() {
        return this.$store.state.gui.uiSettings.showDetectionLength ?? true
    }

    set showDetectionLength(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.showDetectionLength', value: newVal })
    }

    get hideDetectionLengthOnDisabled() {
        return this.$store.state.gui.uiSettings.hideDetectionLengthOnDisabled ?? true
    }

    set hideDetectionLengthOnDisabled(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.hideDetectionLengthOnDisabled', value: newVal })
    }

    get showRunoutDistance() {
        return this.$store.state.gui.uiSettings.showRunoutDistance ?? true
    }

    set showRunoutDistance(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.showRunoutDistance', value: newVal })
    }

    get hideRunoutDistanceOnDisabled() {
        return this.$store.state.gui.uiSettings.hideRunoutDistanceOnDisabled ?? true
    }

    set hideRunoutDistanceOnDisabled(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.hideRunoutDistanceOnDisabled', value: newVal })
    }
}
</script>

<style scoped></style>

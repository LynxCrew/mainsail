<template>
    <div>
        <template v-if="boolForm">
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.CreateGroup') }}</h3>
                <settings-row :title="$t('Settings.MiscellaneousTab.Name')">
                    <v-text-field
                        v-model="form.name"
                        hide-details="auto"
                        :rules="[rules.required, rules.groupUnique]"
                        dense
                        outlined></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.MiscellaneousTab.Index')"
                    :sub-title="$t('Settings.MiscellaneousTab.IndexDescription')">
                    <v-text-field
                        v-model="indices"
                        hide-details="auto"
                        type="string"
                        :rules="[rules.indices]"
                        dense
                        outlined></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.MiscellaneousTab.CheckIndex')"
                    :sub-title="$t('Settings.MiscellaneousTab.CheckIndexDescription')">
                    <v-text-field
                        v-model="checkIndex"
                        hide-details="auto"
                        type="number"
                        step="1"
                        :rules="[rules.checkIndex]"
                        dense
                        outlined></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.MiscellaneousTab.DefaultPreset')"
                    :sub-title="$t('Settings.MiscellaneousTab.DefaultPresetDescription')">
                    <v-text-field
                        v-model="defaultPreset"
                        hide-details="auto"
                        type="string"
                        :rules="[rules.defaultPreset]"
                        dense
                        outlined></v-text-field>
                </settings-row>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="closeForm">{{ $t('Settings.Cancel') }}</v-btn>
                <v-btn v-if="form.id !== null" text color="primary" @click="updateGroup">
                    {{ $t('Settings.Update') }}
                </v-btn>
                <v-btn v-else text color="primary" @click="storeGroup">{{ $t('Settings.Store') }}</v-btn>
            </v-card-actions>
        </template>
        <template v-else>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.LightGroups', { name: light.name }) }}</h3>
                <template v-if="light">
                    <template v-if="groups.length">
                        <div v-for="(group, index) in groups" :key="group.id">
                            <v-divider v-if="index" class="my-2"></v-divider>
                            <settings-row
                                :title="group.name"
                                :sub-title="
                                    $t('Settings.MiscellaneousTab.GroupSubTitle', {
                                        indices: group.indices,
                                        checkIndex: group.checkIndex,
                                    })
                                "
                                :dynamic-slot-width="true">
                                <v-btn small outlined class="ml-3" @click="editGroup(group)">
                                    <v-icon left small>{{ mdiPencil }}</v-icon>
                                    {{ $t('Settings.Edit') }}
                                </v-btn>
                                <v-btn
                                    small
                                    outlined
                                    class="ml-3 minwidth-0 px-2"
                                    color="error"
                                    @click="deleteGroup(group.id)">
                                    <v-icon small>{{ mdiDelete }}</v-icon>
                                </v-btn>
                            </settings-row>
                        </div>
                    </template>
                    <template v-else>
                        <v-row>
                            <v-col>
                                <p class="mb-0 text-center font-italic">
                                    {{ $t('Settings.MiscellaneousTab.NoGroupFound') }}
                                </p>
                            </v-col>
                        </v-row>
                    </template>
                </template>
                <template v-else>
                    <v-row>
                        <v-col>
                            <p class="mb-0 text-center font-italic">
                                {{ $t('Settings.MiscellaneousTab.UnableToLoadLight') }}
                            </p>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="$emit('close')">{{ $t('Settings.Close') }}</v-btn>
                <v-btn text color="primary" @click="createGroup">
                    {{ $t('Settings.MiscellaneousTab.AddGroup') }}
                </v-btn>
            </v-card-actions>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPalette, mdiPencil } from '@mdi/js'
import { caseInsensitiveSort, convertName } from '@/plugins/helpers'
import { PrinterStateLight } from '@/store/printer/types'
import { GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'
import {
    GuiMiscellaneousStateEntry,
    GuiMiscellaneousStateEntryLightgroup,
    GuiMiscellaneousStateEntryPreset
} from '@/store/gui/miscellaneous/types'

@Component({
    components: {
        SettingsRow,
    },
})
export default class SettingsMiscellaneousTabLightGroups extends Mixins(BaseMixin) {
    mdiDelete = mdiDelete
    mdiPalette = mdiPalette
    mdiPencil = mdiPencil

    convertName = convertName

    private boolForm = false
    private local_indices = [1]
    private local_checkIndex = 1
    private local_defaultPreset = ''

    private form: {
        id: string | null
        name: string
        indices: string
        checkIndex: number
        defaultPreset: string
    } = {
        id: null,
        name: '',
        indices: '1',
        checkIndex: 1,
        defaultPreset: ''
    }

    private rules = {
        required: (value: string) => value !== '' || 'required',
        groupUnique: (value: string) => !this.existsGroupName(value) || 'Name already exists',
        indices: (value: string) => this.indexAllowed(value),
        checkIndex: (value: number) => this.checkIndexAllowed(value) || 'not in indices',
        defaultPreset: (value: string) => this.defaultPresetAllowed(value) || 'Not a valid Preset'
    }

    @Prop({ type: Object, default: null })
    declare light: PrinterStateLight | null

    get entry() {
        return this.$store.getters['gui/miscellaneous/getEntry']({
            type: this.light?.type,
            name: this.light?.name,
        }) as GuiMiscellaneousStateEntry | null
    }

    get groups() {
        if (!this.entry) return []

        const groups: GuiMiscellaneousStateEntryLightgroup[] = []
        Object.entries(this.entry.lightgroups).forEach(([key, lightgroup]) => {
            groups.push({
                name: lightgroup.name,
                id: key,
                indices: lightgroup.indices,
                checkIndex: lightgroup.checkIndex,
                defaultPreset: lightgroup.defaultPreset,
            })
        })
        window.console.log('getEntryLightgroups', groups)

        return caseInsensitiveSort(groups, 'name')
    }

    get presets() {
        return (
            this.$store.getters['gui/miscellaneous/getEntryPresets']({
                type: this.light?.type,
                name: this.light?.name,
            }) ?? []
        )
    }

    set indices(newval: string) {
        this.local_indices = this.parse_indices(newval)
        if (this.local_indices.length > 0) {
            this.form.indices = newval
        } else if (this.parse_indices(this.form.indices).length < 0) {
            this.form.indices = "1"
        }
    }

    get indices() {
        return this.form.indices
    }

    set checkIndex(newval: number) {
        this.local_checkIndex = newval
        if (this.checkIndexAllowed(newval)) {
            this.form.checkIndex = newval
        } else if (!this.checkIndexAllowed(this.form.checkIndex)) {
            this.form.checkIndex = this.local_indices[0] ?? 1
        }
    }

    get checkIndex() {
        return this.local_checkIndex
    }

    set defaultPreset(newval: string) {
        this.local_defaultPreset = newval
        if (this.defaultPresetAllowed(newval)) {
            this.form.defaultPreset = newval
        } else if (!this.defaultPresetAllowed(this.form.defaultPreset)) {
            this.form.defaultPreset = ''
        }
    }

    get defaultPreset() {
        return this.local_defaultPreset
    }

    parse_indices(index: string) {
        const result = []
        const indices = index.split(",")
        for (let i = 0; i < indices.length; i++) {
            const s = indices[i]
            const range = s.split("-")
            if (range.length > 2) {
                return []
            }
            if (range.length == 1) {
                const index = parseInt(range[0])
                if (this.invalidIndex(index)
                    || range[0].includes("|")) {
                    return []
                }
                result.push(index)
            }
            if (range.length == 2) {
                let step = "1"
                const minval = range[0]
                let maxval = range[1]
                const range_steps = maxval.split("|")
                if (range_steps.length > 2) {
                    return []
                }
                if (range_steps.length == 2) {
                    step = range_steps[1]
                    maxval = range_steps[0]
                }
                let min = parseInt(minval)
                let max = parseInt(maxval)
                let parsedstep = parseInt(step)
                if (this.invalidIndex(min)
                    || this.invalidIndex(max)
                    || isNaN(parsedstep)
                    || parsedstep < 1
                    || parsedstep > (max - min)) {
                    return []
                }
                for (min; min <= max; min += parsedstep) {
                    result.push(min)
                }
            }
        }
        return result
    }

   invalidIndex(index: number) {
        return (isNaN(index) || index < 1 || index > (this.light?.chainCount ?? 1))
    }

    createGroup() {
        this.form.id = null
        this.form.name = ''
        this.form.indices = '1'
        this.form.checkIndex = 1
        this.form.defaultPreset = ''
        this.boolForm = true
        this.local_indices = this.parse_indices(this.form.indices)
        this.local_checkIndex = this.form.checkIndex
        this.local_defaultPreset = this.form.defaultPreset
    }

    editGroup(group: GuiMiscellaneousStateEntryLightgroup) {
        this.form.id = group.id ?? null
        this.form.name = group.name
        this.form.indices = group.indices
        this.form.checkIndex = group.checkIndex
        this.form.defaultPreset = group.defaultPreset
        this.boolForm = true
        this.local_indices = this.parse_indices(this.form.indices)
        this.local_checkIndex = this.form.checkIndex
        this.local_defaultPreset = this.form.defaultPreset
    }

    closeForm() {
        this.boolForm = false
    }

    storeGroup() {
        this.$store.dispatch('gui/miscellaneous/storeLightgroup', {
            entry: this.light,
            lightgroup: this.form,
        })

        this.boolForm = false
    }

    updateGroup() {
        this.$store.dispatch('gui/miscellaneous/updateLightgroup', {
            entry: this.light,
            lightgroup: this.form,
        })

        this.boolForm = false
    }

    deleteGroup(groupId: string) {
        this.$store.dispatch('gui/miscellaneous/deleteLightgroup', {
            entry: this.light,
            lightgroupId: groupId,
        })
    }

    existsGroupName(name: string) {
        return (
            this.groups.findIndex(
                (group: GuiMacrosStateMacrogroup) => group.name === name && group.id != this.form.id
            ) >= 0
        )
    }

    indexAllowed(value: string) {
        const indices = value.split(",")
        for (let i = 0; i < indices.length; i++) {
            const s = indices[i]
            const range = s.split("-")
            if (range.length > 2) {
                return ("More than one '-' found in '"+ s + "', only one allowed")
            }
            if (range.length == 1) {
                const index = parseInt(range[0])
                if (this.invalidIndex(index)) {
                    return "Missing characters in '" + value + "'"
                }
                if (range[0].includes("|")) {
                    return "'|' specified without preceding range in '" + s + "'"
                }
            }
            if (range.length == 2) {
                let step = "1"
                const minval = range[0]
                let maxval = range[1]
                const range_steps = maxval.split("|")
                if (range_steps.length > 2) {
                    return "More than one '|' found in '" + s + "', only one allowed"
                }
                if (range_steps.length == 2) {
                    step = range_steps[1]
                    maxval = range_steps[0]
                }
                let min = parseInt(minval)
                let max = parseInt(maxval)
                let parsedstep = parseInt(step)
                if (this.invalidIndex(min)
                    || this.invalidIndex(max)
                    || isNaN(parsedstep)) {
                    return "'" + s + "' contains illegal characters"
                }
                if (min > max) {
                    return "Min value greater than max value in '" + s + "'"
                }
                if (parsedstep < 1) {
                    return "Steps must be at least 1 (are '" + parsedstep + "')"
                }
                if (parsedstep > max - min) {
                    return "Steps can not be bigger than range (are '" + parsedstep + "')"
                }
            }
        }
        return true
    }

    checkIndexAllowed(index: number) {
        return this.local_indices.includes(parseInt(index.toString()))
    }

    defaultPresetAllowed(preset: string) {
        if (preset == '') {
            return true
        }
        const presets = this.presets
        for (let i = 0; i < presets.length; i++) {
            const local_preset = presets[i]
            if (preset == local_preset.name) {
                return true
            }
        }
        return false
    }
}
</script>

<style lang="scss" scoped></style>

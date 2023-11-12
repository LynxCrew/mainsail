import { GetterTree } from 'vuex'
import {
    GuiMiscellaneousState,
    GuiMiscellaneousStateEntry,
    GuiMiscellaneousStateEntryLightgroup,
    GuiMiscellaneousStateEntryPreset,
} from '@/store/gui/miscellaneous/types'
import { caseInsensitiveSort } from '@/plugins/helpers'

// eslint-disable-next-line
export const getters: GetterTree<GuiMiscellaneousState, any> = {
    getEntries: (state) => {
        const output: GuiMiscellaneousStateEntry[] = []

        Object.entries(state.entries).forEach(([key, values]) => {
            output.push({
                id: key,
                name: values.name,
                type: values.type,
                lightgroups: { ...values.lightgroups },
                presets: { ...values.presets },
            })
        })

        return output
    },

    getEntry: (state, getters) => (payload: { type: string; name: string }) => {
        return getters.getEntries.find(
            (entry: GuiMiscellaneousStateEntry) => entry.name === payload.name && entry.type === payload.type
        ) as GuiMiscellaneousStateEntry
    },

    getId: (state, getters) => (payload: { type: string; name: string }) => {
        return getters.getEntry(payload)?.id ?? null
    },

    getEntryLightgroups: (state, getters) => (payload: { type: string; name: string }) => {
        const entry = getters.getEntry(payload) as GuiMiscellaneousStateEntry | null

        if (!entry) return []

        const groups: GuiMiscellaneousStateEntryLightgroup[] = []
        Object.entries(entry.lightgroups).forEach(([key, lightgroup]) => {
            groups.push({
                name: lightgroup.name,
                id: key,
                indices: lightgroup.indices,
                checkIndex: lightgroup.checkIndex,
                defaultPreset: lightgroup.defaultPreset,
            })
        })

        return caseInsensitiveSort(groups, 'name')
    },

    getEntryPresets: (state, getters) => (payload: { type: string; name: string }) => {
        const entry = getters.getEntry(payload) as GuiMiscellaneousStateEntry | null

        if (!entry) return []

        const presets: GuiMiscellaneousStateEntryPreset[] = []
        Object.entries(entry.presets).forEach(([key, preset]) => {
            presets.push({
                name: preset.name,
                red: preset.red,
                green: preset.green,
                blue: preset.blue,
                white: preset.white,
                id: key,
                groups: preset.groups,
                template: preset.template,
            })
        })

        return caseInsensitiveSort(presets, 'name')
    },
}

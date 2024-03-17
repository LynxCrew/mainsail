import Vue from 'vue'
import { ActionTree } from 'vuex'
import { GuiMaintenanceState } from '@/store/gui/maintenance/types'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'

export const actions: ActionTree<GuiMaintenanceState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit(
            'server.database.get_item',
            { namespace: 'maintenance' },
            { action: 'gui/maintenance/initStore' }
        )
    },

    async initStore({ commit, dispatch }, payload) {
        await commit('reset')
        await commit('initStore', payload)
        await dispatch('socket/removeInitModule', 'gui/maintenance/init', { root: true })
    },

    upload(_, payload) {
        Vue.$socket.emit('server.database.post_item', {
            namespace: 'maintenance',
            key: payload.id,
            value: payload.value,
        })
    },

    store({ commit, dispatch, state }, payload) {
        const id = uuidv4()

        commit('store', { id, values: payload.entry })
        dispatch('upload', {
            id,
            value: state.entries[id],
        })
    },

    update({ commit, dispatch, state }, payload) {
        commit('update', payload)
        dispatch('upload', {
            id: payload.id,
            value: state.entries[payload.id],
        })
    },

    delete({ commit }, payload) {
        commit('delete', payload)
        Vue.$socket.emit('server.database.delete_item', { namespace: 'maintenance', key: payload })
    },

    /*repeat({ dispatch, getters, state, rootState }, payload) {
        if (!(payload.id in state.reminders)) return
        const reminder = getters['getReminder'](payload.id)
        const new_start_time = rootState.server?.history?.job_totals.total_print_time || 0
        const snooze_epoch_time = Date.now()
        dispatch('update', {
            id: reminder.id,
            snooze_print_hours_timestamps: [...reminder.snooze_print_hours_timestamps, new_start_time],
            snooze_epoch_timestamps: [...reminder.snooze_epoch_timestamps, snooze_epoch_time],
        })
    },*/
}

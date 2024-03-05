<template>
    <v-row>
        <v-col class="col d-flex justify-center">
            <v-row class="d-flex flex-row">
                <v-col class="col-12 d-flex justify-center flex-column">
                    <span class="settings-row-title display-name-color">{{ this.$t('Panels.TemperaturePanel.DisplayName') }}</span>
                </v-col>
            </v-row>
        </v-col>
        <v-col class="col-auto d-flex justify-end align-center settings-row-slot">
            <v-text-field
                v-model="displayName"
                hide-details
                :placeholder="formatName"
                persistent-placeholder
                clearable
                :clear-icon="mdiRefresh"
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
import {convertName} from "@/plugins/helpers";
import {mdiRefresh} from '@mdi/js'

@Component
export default class TemperaturePanelListItemEditAdditionalSensor extends Mixins(BaseMixin) {

    mdiRefresh = mdiRefresh

    @Prop({ type: String, required: true }) readonly objectName!: string

    get displayName() {
        return this.$store.getters['gui/getDisplayName']({
            name: this.objectName,
        })
    }

    set displayName(newVal) {
        this.$store.dispatch('gui/setDisplayName', {
            objectName: this.objectName,
            value: newVal,
        })
    }

    get name() {
        const splits = this.objectName.split(' ')
        if (splits.length === 1) return this.objectName

        return splits[1]
    }

    get formatName() {
        return convertName(this.name)
    }
}
</script>

<style scoped>
.settings-row-title {
    padding-left: 4px;
    display: block;
    width: 100%;
}

.settings-row-slot {
    min-height: 64px;
}

.display-name-color {
    color: #ffffffb3
}
</style>

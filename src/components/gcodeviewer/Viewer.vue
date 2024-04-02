<template>
    <div v-if="useFluiddViewer">
        <FluiddViewer></FluiddViewer>
    </div>
    <div v-else>
        <MainsailViewer></MainsailViewer>
    </div>
</template>

<script lang="ts">
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'

export default class Viewer extends Mixins(BaseMixin) {

    get useFluiddViewer() {
        const fluiddURL = this.$store.state.gui.gcodeViewer.fluiddUrl
        return this.$store.state.gui.gcodeViewer.useFluiddViewer && fluiddURL != ''
    }
}
</script>

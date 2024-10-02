<template>
    <inline-svg
        :src="this.$store.getters['files/getCustomTempSensorIcon']('beacon-icon') ?? '/img/beacon-icon.svg'"
        :width="width || size"
        :height="height || size"
        :style="{ fill: color || undefined, stroke: strokeColor || undefined }"
    />
</template>

<script lang="ts">
import Vue from "vue";
import InlineSvg from 'vue-inline-svg'

export default Vue.extend({
    name: 'BeaconIcon',
    components: {
        InlineSvg,
    },
    props: {
        width: {
            type: Number,
            default: null,
        },
        height: {
            type: Number,
            default: null,
        },
        size: {
            type: Number,
            default: 24,
        },
        color: {
            type: String,
            default: undefined,
        },
        strokeColor: {
            type: String,
            default: undefined,
        },
    },
})
</script>

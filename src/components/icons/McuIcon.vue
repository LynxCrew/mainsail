<template>
    <inline-svg
        :src="this.$store.getters['files/getCustomTempSensorIcon']('mcu-icon') ?? '/img/mcu-icon.svg'"
        :width="width || size"
        :height="height || size"
        :style="{ fill: color || undefined, stroke: strokeColor || undefined }"
    />
</template>

<script lang="ts">
import Vue from "vue";
import InlineSvg from 'vue-inline-svg'

export default Vue.extend({
    name: 'McuIcon',
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

<template>
        <iframe src="http://192.168.178.135:81/#/preview"
                width="100%"
                ref="iFrame"
                @load='resizeIFrame'></iframe>
</template>


<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import {ref} from "vue";

@Component({})
export default class Test extends Vue {

    declare $refs: {
        iFrame: HTMLIFrameElement,
    }

    resizeIFrame() {
        this.$refs.iFrame.style.height = `${this.$refs.iFrame.contentDocument?.body.scrollHeight}px`
    }
}
</script>


<style scoped>
html {
    overflow: auto;
}

html,
body,
div,

iframe {
    display: block;
    width: 100%;
    height: var(--app-height);
    border: none;
    overflow-y: hidden;
    overflow-x: hidden;
}
</style>

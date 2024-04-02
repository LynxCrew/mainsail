<template>
    <div>
        <template>
            <iframe :src="fluiddViewerUrl"
                    width="100%">
            </iframe>
        </template>
    </div>
</template>

<script lang="ts">
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'

export default class Viewer extends Mixins(BaseMixin) {
    get fluiddViewerUrl() {
        const fluiddURL = this.$store.state.gui.gcodeViewer.fluiddUrl
        if (fluiddURL == '') {
            return ''
        }
        return "http://" + this.$store.state.gui.gcodeViewer.fluiddUrl + "/#/preview"
    }
}
</script>

<!-- Because the viewer lives outside of the components DOM it can't be scoped -->
<style>
.viewer {
    width: 100%;
    height: calc(var(--app-height) - 240px);
    border: 1px solid #3f3f3f;
}

.withScrubber .viewer {
    height: calc(var(--app-height) - 300px);
}

@media (min-width: 600px) and (max-width: 959px) {
    .viewer {
        height: calc(var(--app-height) - 295px);
    }

    .withScrubber .viewer {
        height: calc(var(--app-height) - 360px);
    }
}

@media (max-width: 599px) {
    .viewer {
        height: calc(var(--app-height) - 340px);
    }

    .withScrubber .viewer {
        height: calc(var(--app-height) - 340px);
    }
}
</style>

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

import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import { Touch, Ripple } from 'vuetify/lib/directives'
import BeaconIcon from "@/components/icons/BeaconIcon.vue";
import HostIcon from "@/components/icons/HostIcon.vue";
import CustomTempSensorIcon from "@/components/icons/HostIcon.vue";
import McuIcon from "@/components/icons/McuIcon.vue";

Vue.use(Vuetify, {
    directives: { Touch, Ripple },
})

export default new Vuetify({
    theme: {
        dark: true,
        themes: {
            dark: {
                panel: '#1e1e1e',
                toolbar: '#272727',
                primary: '#1976D2',
                secondary: '#424242',
                accent: '#82B1FF',
                error: '#FF5252',
                info: '#2196F3',
                success: '#4CAF50',
                warning: '#FF8300',
                highlight: '#FF8300',
                attention: '#FF8300',
            },
        },
        options: { customProperties: true },
    },
    icons: {
        values: {
            beacon_icon: {
                component: BeaconIcon,
            },
            host_icon: {
                component: HostIcon,
            },
            mcu_icon: {
                component: McuIcon,
            },
        },
        iconfont: 'mdiSvg',
    },
    breakpoint: {
        mobileBreakpoint: 768,
    },
})

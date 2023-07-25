import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import { Touch, Ripple } from 'vuetify/lib/directives'

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
            },
        },
        options: { customProperties: true },
    },
    icons: {
        iconfont: 'mdiSvg',
    },
    breakpoint: {
        mobileBreakpoint: 768,
    },
})

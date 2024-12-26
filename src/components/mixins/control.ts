import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class ControlMixin extends Vue {
    get absolute_coordinates() {
        return this.$store.state.printer?.gcode_move?.absolute_coordinates ?? true
    }

    get enableXYHoming(): boolean {
        return this.$store.state.gui.control.enableXYHoming
    }

    get feedrateXY() {
        return this.$store.state.gui.control?.feedrateXY ?? 100
    }

    get feedrateZ() {
        return this.$store.state.gui.control?.feedrateZ ?? 10
    }

    get lynxLayout(): boolean {
        return this.$store.state.gui.control.lynxLayout ?? false
    }

    get existsQGL() {
        return this.$store.getters['printer/existsQGL']
    }

    get existsZtilt() {
        return this.$store.getters['printer/existsZtilt']
    }

    get existsBedTilt() {
        return this.$store.getters['printer/existsBedTilt']
    }

    get existsBedScrews() {
        return this.$store.getters['printer/existsBedScrews']
    }

    get existsDeltaCalibrate() {
        return this.$store.getters['printer/existsDeltaCalibrate']
    }

    get existsScrewsTilt() {
        return this.$store.getters['printer/existsScrewsTilt']
    }

    get existsFirmwareRetraction(): boolean {
        return this.$store.getters['printer/existsFirmwareRetraction']
    }

    get colorQuadGantryLevel() {
        const status = this.$store.state.printer.quad_gantry_level?.applied ?? false

        return status ? 'primary' : 'highlight'
    }

    get colorQuadGantryLevelCircle() {
        const status = this.$store.state.printer.quad_gantry_level?.applied ?? false

        return status ? 'highlight' : 'primary'
    }

    get colorZTilt() {
        const status = (this.$store.state.printer.z_tilt?.applied ?? false) || (this.$store.state.printer.z_tilt_ng?.applied ?? false)

        return status ? 'primary' : 'highlight'
    }

    get colorZTiltCircle() {
        const status = (this.$store.state.printer.z_tilt?.applied ?? false) || (this.$store.state.printer.z_tilt_ng?.applied ?? false)

        return status ? 'highlight' : 'primary'
    }

    get defaultActionButton() {
        return this.$store.getters['gui/getDefaultControlActionButton']
    }

    get actionButton(): string {
        const button = this.$store.state.gui.control.actionButton ?? this.defaultActionButton

        if (
            (button === 'qgl' && !this.$store.getters['printer/existsQGL']) ||
            (button === 'ztilt' && !this.$store.getters['printer/existsZTilt'])
        ) {
            return this.defaultActionButton
        }

        return button
    }

    /**
     * Axes home states
     */

    get homedAxes(): string {
        return this.$store.state.printer?.toolhead?.homed_axes ?? ''
    }

    get xAxisHomed(): boolean {
        return this.homedAxes.includes('x')
    }

    get yAxisHomed(): boolean {
        return this.homedAxes.includes('y')
    }

    get zAxisHomed(): boolean {
        return this.homedAxes.includes('z')
    }

    get macros() {
        return this.$store.getters['printer/getMacros']
    }

    get toolchangeMacros(): string[] {
        return Object.keys(this.$store.state.printer.gcode?.commands ?? {})
            .filter((gcode) => gcode.match(/^T\d+/))
            .sort((a: string, b: string) => {
                const numberA = parseInt(a.slice(1))
                const numberB = parseInt(b.slice(1))

                return numberA - numberB
            })
    }

    get existsClientLinearMoveMacro() {
        const macros = this.$store.state.printer?.gcode?.commands ?? {}

        return '_CLIENT_LINEAR_MOVE' in macros
    }

    doHome() {
        this.$store.dispatch('server/addEvent', { message: 'G28', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'G28' }, { loading: 'homeAll' })
    }

    doHomeX() {
        this.$store.dispatch('server/addEvent', { message: 'G28 X', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'G28 X' }, { loading: 'homeX' })
    }

    doHomeY() {
        this.$store.dispatch('server/addEvent', { message: 'G28 Y', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'G28 Y' }, { loading: 'homeY' })
    }

    doHomeXY() {
        this.$store.dispatch('server/addEvent', { message: 'G28 X Y', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'G28 X Y' }, { loading: 'homeXY' })
    }

    doHomeZ() {
        this.$store.dispatch('server/addEvent', { message: 'G28 Z', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'G28 Z' }, { loading: 'homeZ' })
    }

    doQGL() {
        this.$store.dispatch('server/addEvent', { message: 'QUAD_GANTRY_LEVEL', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'QUAD_GANTRY_LEVEL' }, { loading: 'qgl' })
    }

    doZtilt() {
        if (this.lynxLayout) {
            this.$store.dispatch('server/addEvent', {message: 'ADJUST_Z_TILT', type: 'command'})
            this.$socket.emit('printer.gcode.script', {script: 'ADJUST_Z_TILT'}, {loading: 'zTilt'})
        } else {
            this.$store.dispatch('server/addEvent', {message: 'Z_TILT_ADJUST', type: 'command'})
            this.$socket.emit('printer.gcode.script', {script: 'Z_TILT_ADJUST'}, {loading: 'zTilt'})
        }
    }

    doSendMove(gcode: string, feedrate: number) {
        let command =
            `SAVE_GCODE_STATE NAME=_ui_movement\n` +
            `G91\n` +
            `G1 ${gcode} F${feedrate * 60}\n` +
            `RESTORE_GCODE_STATE NAME=_ui_movement`

        if (this.existsClientLinearMoveMacro) {
            gcode = gcode
                .split(' ')
                .map((part) => {
                    const axis = part.slice(0, 1)
                    const value = parseFloat(part.slice(1))

                    return `${axis}=${value}`
                })
                .join(' ')

            command = `_CLIENT_LINEAR_MOVE ${gcode} F=${feedrate * 60}`
        }

        this.doSend(command)
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}

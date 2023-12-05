export interface GuiMacrosState {
    mode: 'simple' | 'expert'
    hiddenMacros: string[]
    macrogroups: {
        [key: string]: GuiMacrosStateMacrogroup
    }
}

export interface GuiMacrosStateMacrogroup {
    id: string | null
    name: string
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'highlight' | 'attention' | 'custom'
    colorCustom?: string
    showInStandby: boolean
    showInPrinting: boolean
    showInPause: boolean
    macros?: GuiMacrosStateMacrogroupMacro[]
}

export interface GuiMacrosStateMacrogroupMacro {
    pos: number
    name: string
    alias: string
    color: 'group' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'highlight' | 'attention'
    showInStandby: boolean
    showInPrinting: boolean
    showInPause: boolean
}

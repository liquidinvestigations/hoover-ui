import { FC, ReactNode, RefObject } from 'react'

import HotKeysWithHelp from '../HotKeysWithHelp'
import { useSharedStore } from '../SharedStoreProvider'

interface HotKeysProps {
    children: ReactNode | ReactNode[]
}

export const HotKeys: FC<HotKeysProps> = ({ children }) => {
    const { keys } = useSharedStore().hotKeysStore

    return <HotKeysWithHelp keys={keys}>{children}</HotKeysWithHelp>
}

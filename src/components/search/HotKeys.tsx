import { FC, ReactNode } from 'react'

import { HotKeysWithHelp } from '../common/HotKeysWithHelp/HotKeysWithHelp'
import { useSharedStore } from '../SharedStoreProvider'

interface HotKeysProps {
    children: ReactNode | ReactNode[]
}

export const HotKeys: FC<HotKeysProps> = ({ children }) => {
    const { keys } = useSharedStore().hotKeysStore

    return <HotKeysWithHelp keys={keys}>{children}</HotKeysWithHelp>
}

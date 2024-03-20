import { ReactNode } from 'react'

export interface TabPanelProps {
    children: ReactNode | ReactNode[]
    value: number
    index: number
    padding?: number
}

import { SplitPaneLayout } from '../../common/SplitPaneLayout/SplitPaneLayout'
import { Document } from '../Document'
import Locations from '../Locations/Locations'

interface InfoPaneProps {
    digest?: string
    loading: boolean
}

export const InfoPane = ({ digest, loading }: InfoPaneProps) =>
    !digest ? (
        <Document />
    ) : (
        <SplitPaneLayout container={false} left={loading ? null : <Locations />} defaultSizeLeft="25%" defaultSizeMiddle="70%">
            <Document />
        </SplitPaneLayout>
    )

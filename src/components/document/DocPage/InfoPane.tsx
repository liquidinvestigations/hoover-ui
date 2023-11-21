import { DocumentData } from '../../../Types'
import { SplitPaneLayout } from '../../common/SplitPaneLayout/SplitPaneLayout'
import { Document } from '../Document'
import Locations from '../Locations/Locations'

interface InfoPaneProps {
    digest?: string
    data?: DocumentData
    loading: boolean
    digestUrl?: string
}

export const InfoPane = ({ digest, data, loading, digestUrl }: InfoPaneProps) =>
    !digest ? (
        <Document />
    ) : (
        <SplitPaneLayout
            container={false}
            left={loading ? null : <Locations data={data} url={digestUrl} />}
            defaultSizeLeft="25%"
            defaultSizeMiddle="70%">
            <Document />
        </SplitPaneLayout>
    )

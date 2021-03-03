import dynamic from 'next/dynamic'

const Dynamic = dynamic(
    () => import('./Viewer'),
    { ssr: false }
)

export default Dynamic

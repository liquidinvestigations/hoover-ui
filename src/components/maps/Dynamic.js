import dynamic from 'next/dynamic'

const Dynamic = dynamic(
    () => import('./Map'),
    { ssr: false }
)

export default Dynamic

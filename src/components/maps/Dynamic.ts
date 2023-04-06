import dynamic from 'next/dynamic'

export default dynamic(() => import('./Map/Map'), { ssr: false })

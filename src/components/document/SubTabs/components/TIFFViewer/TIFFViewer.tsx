import { Typography } from '@mui/material'
import { FC, useEffect, useState } from 'react'
import { decode } from 'tiff'

import { Loading } from '../../../../common/Loading/Loading'

import { useStyles } from './TIFFViewer.styles'

export const TIFFViewer: FC<{ url: string }> = ({ url }) => {
    const { classes } = useStyles()
    const [loading, setLoading] = useState<boolean | number>(true)
    const [error, setError] = useState<string>()
    const [pages, setPages] = useState<string[]>()

    useEffect(() => {
        ;(async () => {
            setError(undefined)
            setLoading(true)

            const response = await fetch(url)

            if (response.ok) {
                const reader = response.body?.getReader()
                const contentLengthHeader = response.headers.get('Content-Length')
                const contentLength = contentLengthHeader ? parseInt(contentLengthHeader) : 1

                if (!reader) {
                    return
                }

                const chunks = []
                let receivedLength = 0

                while (true) {
                    const { done, value } = await reader.read()

                    if (done) {
                        break
                    }

                    chunks.push(value)
                    receivedLength += value.length

                    setLoading((receivedLength / contentLength) * 100)
                }

                const chunksAll = new Uint8Array(receivedLength)
                let position = 0
                for (const chunk of chunks) {
                    chunksAll.set(chunk, position)
                    position += chunk.length
                }

                let ifd
                try {
                    ifd = decode(chunksAll)
                } catch (e: any) {
                    setError(e.message)
                    setLoading(false)
                    return
                }

                setPages(
                    ifd.map((page) => {
                        const canvas = document.createElement('canvas')
                        canvas.width = page.width
                        canvas.height = page.height

                        const pixels = new Uint8ClampedArray(page.data)
                        const ctx = canvas.getContext('2d')

                        if (!ctx) {
                            return ''
                        }

                        const imageData = ctx.createImageData(page.width, page.height)
                        const data = imageData.data
                        const len = data.length

                        let i = 0,
                            t = 0
                        for (; i < len; i += 4) {
                            data[i] = pixels[t]
                            data[i + 1] = pixels[t + 1]
                            data[i + 2] = pixels[t + 2]
                            data[i + 3] = page.alpha ? pixels[t + 3] : 255

                            t += page.alpha ? 4 : 3
                        }
                        ctx.putImageData(imageData, 0, 0)

                        return canvas.toDataURL()
                    }),
                )
            } else {
                setError(response.statusText)
            }
            setLoading(false)
        })()
    }, [url])

    return (
        <div className={classes.wrapper}>
            {loading && (
                <Loading
                    variant={typeof loading === 'number' ? 'determinate' : 'indeterminate'}
                    value={typeof loading === 'number' ? loading : undefined}
                />
            )}
            {error && <Typography color="error">{error}</Typography>}
            {pages?.map((data) => <img key={data} src={data} />)}
        </div>
    )
}

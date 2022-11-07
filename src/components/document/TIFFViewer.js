import { useEffect, useState } from 'react'
import { decode } from 'tiff'
import { makeStyles } from '@mui/styles'
import { Typography } from '@mui/material'
import Loading from '../Loading'

const useStyles = makeStyles((theme) => ({
    wrapper: {
        textAlign: 'center',
        paddingTop: theme.spacing(2),
        backgroundColor: theme.palette.grey[200],

        '& img': {
            maxWidth: '95%',
            boxShadow: '0 2px 10px 0 black',
            marginBottom: theme.spacing(2),
        },
    },
}))

export default function TIFFViewer({ url }) {
    const classes = useStyles()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState()
    const [pages, setPages] = useState(null)

    useEffect(() => {
        ;(async () => {
            setError(null)
            setLoading(true)

            const response = await fetch(url)

            if (response.ok) {
                const reader = response.body.getReader()
                const contentLength = response.headers.get('Content-Length')

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
                for (let chunk of chunks) {
                    chunksAll.set(chunk, position)
                    position += chunk.length
                }

                let ifd
                try {
                    ifd = decode(chunksAll)
                } catch (e) {
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
                    })
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
                <Loading variant={typeof loading === 'number' ? 'determinate' : 'indeterminate'} value={typeof loading === 'number' ? loading : null} />
            )}
            {error && <Typography color="error">{error}</Typography>}
            {pages?.map((data) => (
                <img key={data} src={data} />
            ))}
        </div>
    )
}

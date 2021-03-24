import React, { useEffect, useRef, useState } from 'react'
import { decode, isMultiPage } from 'tiff'
import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import Loading from '../Loading'

const useStyles = makeStyles(theme => ({
    canvasWrapper: {
        textAlign: 'center',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        backgroundColor: theme.palette.grey[200],

        '& canvas': {
            maxWidth: '95%',
        }
    },
}))

export default function TIFFViewer({ url }) {
    const classes = useStyles()
    const canvasRef = useRef()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState()

    useEffect(() => {
        setError(null)
        setLoading(true)
        fetch(url).then(res => {
            if (res.ok) {
                res.arrayBuffer().then(raw => {
                    if (!isMultiPage(raw)) {
                        const canvas = canvasRef.current
                        const ctx = canvas.getContext('2d')

                        const ifd = decode(raw)
                        const alpha = ifd[0].alpha
                        const w = ifd[0].width
                        const h = ifd[0].height

                        canvas.width = w
                        canvas.height = h

                        const pixels = new Uint8ClampedArray(ifd[0].data)
                        const imageData = ctx.createImageData(w, h)
                        const data = imageData.data
                        const len = data.length

                        let i = 0, t = 0

                        for(; i < len; i += 4) {
                            data[i]     = pixels[t];
                            data[i + 1] = pixels[t + 1];
                            data[i + 2] = pixels[t + 2];
                            data[i + 3] = alpha ? pixels[t + 3] : 255;

                            t += alpha ? 4 : 3;
                        }

                        ctx.putImageData(imageData, 0, 0)
                    } else {
                        setError('Multiple page TIFFs are not supported yet')
                    }
                })
            } else {
                setError(res.statusText)
            }
        }).finally(() => {
            setLoading(false)
        })
    }, [url])

    return (
        <div className={classes.canvasWrapper}>
            {loading && <Loading />}
            {error && <Typography color="error">{error}</Typography>}
            <canvas ref={canvasRef} />
        </div>
    )
}

import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Section from './Section'

const useStyles = makeStyles({
    preWrap: {
        whiteSpace: 'pre-wrap'
    },
})

function TextSection({ text, title, omitIfEmpty = true }) {
    const classes = useStyles()

    let displayText = null

    if (!text) {
        if (omitIfEmpty) {
            return null;
        } else {
            displayText = <i> (empty) </i>
        }
    } else {
        displayText = <pre className={classes.preWrap}>{text.trim()}</pre>
    }

    return (
        <Section title={title}>
            {displayText}
        </Section>
    )
}

export default memo(TextSection)

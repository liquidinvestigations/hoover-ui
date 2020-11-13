import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Section from './Section'

const useStyles = makeStyles({
    preWrap: {
        whiteSpace: 'pre-wrap'
    },
})

TextSection.propTypes = {
    omitIfEmpty: PropTypes.bool,
}

TextSection.defaultProps = {
    omitIfEmpty: true,
}

export default function TextSection({ text, title, omitIfEmpty }) {
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

import React, { memo, useCallback } from 'react'
import { TextField } from '@material-ui/core'

const RegexTextField = ({ regex, onChange, ...rest }) => {
    const handleChange = useCallback(
        (e) => {
            e.currentTarget.value = e.currentTarget.value.replace(regex, "");
            onChange(e);
        },
        [onChange, regex]
    );

    return <TextField onChange={handleChange} {...rest} />;
};

export default memo(RegexTextField)

import React from "react"
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Fragment } from "react";

const InputDropdown = (props) => {
    const suggestList = props.suggestList;

    return (
        <Fragment>
            <Autocomplete
                id="combo-box-demo"
                options={suggestList.map((item, i) => (
                    <div>{item.name}</div>))}
                getOptionLabel={(item) => item.name}
                debug
                style={{ width: 300 }}
                renderInput={(input) => <TextField {...input} label={`${props.title}...`} variant="outlined" />}
            />
        </Fragment>
    )
}

export default InputDropdown
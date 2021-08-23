import React from 'react'
import { Fragment } from 'react'
import BorderColorOutlinedIcon from '@material-ui/icons/BorderColorOutlined'

const EditBtnUi =(props)=>{
return(
    <Fragment >
        <div className='Editsection' onClick={props.onClick}>
            <label> Edit <i> <BorderColorOutlinedIcon /> </i></label>
        </div>
    </Fragment>
)}


export default EditBtnUi

EditBtnUi.defaultProps = {
    onClick : () => {}
}
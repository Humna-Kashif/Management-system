import React from 'react'
import { Fragment } from 'react'
import { BsCheck, BsX } from "react-icons/bs";


const EditCtrlsBtnUi = (props) => {
    return (
        <Fragment >
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                { props.status==="qualification"? <div className='Editsection' onClick={props.onDone}>
                            <label> Done <i> <BsCheck /> </i></label>
                        </div>:
                    <Fragment>
                        <div className='Editsection' onClick={props.onConfirm}>
                            <label> Confirm <i> <BsCheck /> </i></label>
                        </div>
                        <div className='Editsection' onClick={props.onCancel}>
                            <label> Cancel <i> <BsX /> </i></label>
                        </div>
                    </Fragment>
                }
            </div>
        </Fragment>
    )
}


export default EditCtrlsBtnUi

EditCtrlsBtnUi.defaultProps = {
    onConfirm: () => { },
    onCancel: () => { },
}
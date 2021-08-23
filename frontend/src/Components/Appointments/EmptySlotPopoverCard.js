import React, { useEffect, useState } from "react"
import "../../Styles/Card.scss"
import { Tooltip } from 'antd';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import moment from "moment";

const EmptySlotPopoverCard = (props) => {

    const [show,setShow] = useState(false)

    const onHandleClose = () => {
        // props.closeHandler(false)
    }

    useEffect(() => setTimeout(() => {
        setShow(true)
    }, 50) , [props.val])

    return (
        <div style={{position: "relative"}}>

            <div 
                onClick={(e) => e.stopPropagation()}
                className={show ? "popcard__container popcard--show" : "popcard__container"}>
                <div style={{display: "flex", justifyContent: "flex-end", flexDirection: "row", padding: 5}}>
                    {/* <Tooltip title={"Reset"} placement="bottom" trigger="hover">
                        <IconButton style={styles.closeBtn} >
                            <ReplayIcon onClick={() => changeAppointmentStatusApi(itemData.appointment_id,"upcoming")} fontSize="small"/>
                        </IconButton>
                    </Tooltip> */}
                    <Tooltip title={"Close"} placement="bottom" trigger="hover">
                        <IconButton onClick={onHandleClose} style={styles.closeBtn} >
                            <ClearIcon onClick={onHandleClose} fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </div>
                <div style={{display: "flex", flexDirection: "row", padding: 16,paddingTop: 0, alignItems: "center"}}>
                    Container: {props.slot} {moment(props.date).format("dd DD")}
                </div>
            </div>
        </div>
    )
}

export default EmptySlotPopoverCard

EmptySlotPopoverCard.defaultProps = {
    slot: "",
    date: ""
}

const styles = {
    closeBtn: {
        fontSize: 12,
        color: "#000000a1"
    },
    avatar: { height:"40px", width:"40px", borderWidth: 0.3, borderColor: "#e0004d", borderStyle: "solid"},
}
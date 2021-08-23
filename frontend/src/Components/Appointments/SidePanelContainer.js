import React, { useEffect, useState, useContext } from "react"
import { Modal, message } from 'antd';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import ClearIcon from '@material-ui/icons/Clear';
import { Button } from 'antd';
import { GlobalContext } from '../../Context/GlobalState'
import "./SidePanelContainer.scss"
import { appointmentStatusAPI, deleteEditAppointment } from "../../Hooks/API";
import AppointmentModal from "../AppointmentModal/Modal";
import { getDateOfBirth, getTime } from '../../Hooks/TimeHandling'
import { Tooltip } from "antd";
import PrintIcon from '@material-ui/icons/Print';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import DoneAllIcon from '@material-ui/icons/DoneAll';

export const SidePanelHeader = (props) => {
    const { accountId, accountType,elementDocId } = useContext(GlobalContext);
    const [showFollowupModal, setShowModal] = useState(false);
    const validationStatus = props.values;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => {
        if (validationStatus) {
            setIsModalVisible(true);
        } else {
            message.error(props.validation.map((item) => item[props.itemData.appointment_id]))
        }
    };
    const handleModalClose = () => {
        setShowModal(false);
    };
    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
        changeAppointmentCompleteStatus("completed", props.itemData.appointment_id);
        if (props.itemData.appointment_type === 'telehealth') {
            localStorage.removeItem('link')
            localStorage.removeItem('meetId')
            localStorage.removeItem('password')
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const renderConfirmationModal = () => {
        return <Modal title="Complete Appointment" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <p>Are you sure you want to complete this appointment </p>
        </Modal>
    }

    const changeAppointmentCompleteStatus = (value, key) => {
        if (validationStatus) {
            appointmentStatusAPI(elementDocId, 0, 0, key, "PUT", "doctor", elementDocId, value).then(result => {
                console.log("complete status is:", result)
                if (result) {
                    message.success("Successfully Done! " + props.validation.map((item) => item[key]))
                    props.refreshList();
                    props.closeHandler(false)
                }
            })
        } else {
            message.error(" Sorry Completion Failed! " + props.validation.map((item) => item[key]))
        }

    }

    const changeAppointmentHoldStatus = (value, key) => {
        appointmentStatusAPI(elementDocId, 0, 0, key, "PUT", "doctor", elementDocId, value).then(result => {
            console.log("complete status is:", result)
            if (result) {
                message.success("Successfully Done! ")
                props.refreshList();
                props.closeHandler(false)
            }
        })
    }

    return (
        <div style={{ zIndex: 100, backgroundColor: "#f5f5f5", height: "60px", marginLeft: "60px", display: "flex", alignItems: "center", justifyContent: "flex-start", position: "sticky", top: 0 }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "baseline",
                    textTransform: "capitalize",
                    flex: 1,
                }}
            >
                <div style={{ fontSize: 24, color: "grey" }}>
                    {props.itemData.patientinfo.name}
                </div>
                <div style={{ fontSize: 16, color: "grey" }}>
                    - {getDateOfBirth(props.itemData.patientinfo.dob)} years (
                    {props.itemData.patientinfo.gender})
                </div>
            </div>
            {
                props.appointmentPanel ?
                    <div style={{ marginRight: 40, display: "flex", flexDirection: "row" }}>
                        <div style={{ margin: 4 }}>
                            <Tooltip title={"Set A Follow-up"} placement="bottom" trigger="hover">
                                <IconButton>
                                    <AccessTimeIcon style={{ color: 'grey', fontSize: '24px', padding: 2, cursor: 'pointer' }} onClick={handleShowModal} />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div style={{ margin: 4 }}>
                            <Tooltip title={"Edit Appointment"} placement="bottom" trigger="hover">
                                <IconButton>
                                    <EditIcon style={{ color: 'grey', fontSize: '24px', padding: 2, cursor: 'pointer' }} onClick={() => props.enableEdit(props.itemData)} />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <AppointmentModal show={showFollowupModal} hide={handleModalClose} displayFunction={'followup'} Name={props.itemData.patientinfo.name} appointmentID={props.itemData.appointment_id} time={getTime(props.itemData.date_time_of_appointment)} patient_id={props.itemData.patientinfo.patient_id} />
                    </div>
                    :
                    <div style={{ marginRight: 30 }}>
                        {/* {(props.itemData.appointment_type === 'telehealth' && joinMeeting === false) ?  <Button
                        onClick={()=> {
                            localStorage.setItem('link',meetingLink)
                            setMeetingLink(meetingLink)
                            localStorage.setItem('meetId',idsubArray[0])
                            setMeetingId(idsubArray[0])
                            localStorage.setItem('password',password[1])
                            setMeetingPwd(password[1])
                            // window.open('/ZoomMeet', "_blank")
                            setJoinMeeting(true)}}
                            type='primary'
                            style={{ marginRight: 10 }}>
                            Join Meeting
                            </Button> : ''}
                        <ZoomMeet show={joinMeeting} /> */}
                        {props.editing ?
                            <div style={{ margin: 8 }}>
                                <Tooltip title={"Save Change \& Complete"} placement="bottom" trigger="hover">
                                    <IconButton>
                                        <DoneAllIcon
                                            style={props.confirmEdit ? { color: '#e0004d', fontSize: '24px', padding: 2, cursor: 'pointer' } :
                                                { color: 'lightgrey', fontSize: '24px', padding: 2, cursor: 'pointer' }}
                                            onClick={() => props.confirmEdit && showModal()}
                                            disabled={!props.confirmEdit} />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            // <Button
                            //     disabled={!props.confirmEdit}
                            //     onClick={showModal}
                            //     style={props.confirmEdit ? { backgroundColor: "#e0004d", color: "white", marginRight: 10 } : { backgroundColor: "lightgrey" }}>
                            //     Save Change {"&"} Complete
                            // </Button>
                            :
                            <div style={{ margin: 8 }}>
                                <Tooltip title={"Complete Appointment"} placement="bottom" trigger="hover">
                                    <IconButton>
                                        <DoneAllIcon
                                            style={{ color: '#e0004d', fontSize: '24px', padding: 2, cursor: 'pointer' }}
                                            onClick={showModal} />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            // <Button
                            //     onClick={showModal}
                            //     type='primary'
                            //     style={{ marginRight: 10, width: '180px' }}>
                            //     Complete Appointment
                            // </Button>
                        }
                        {/* {
                            !props.editing &&
                           <Button onClick={() => changeAppointmentHoldStatus("hold", props.itemData.appointment_id)} type='primary' style={{ marginRight: 10,width:'180px' }}>
                                Move to waiting
                        </Button>
                           }  */}
                        {/* {
                            !props.editing &&
                            <Button onClick={() => changeAppointmentHoldStatus("hold", props.itemData.appointment_id)} style={{ backgroundColor: "lightgrey", color: "#4d4d4d" }}>
                                More
                        </Button>
                        } */}
                        {/* <PrintIcon className='PrintPDf' /> */}
                    </div>
            }

            {renderConfirmationModal()}
        </div>
    )
}

SidePanelHeader.defaultProps = {
    itemData: {
        patientinfo: { name: "" }
    },
    refreshList: () => { },
    closeHandler: () => { },
    appointmentPanel: false,
    enableEdit: () => { },
    editing: false,
    confirmEdit: false,
}

const SidePanelContainer = (props) => {
    const { accountId, accountType,elementDocId } = useContext(GlobalContext);
    const handleDiscardAppointment = () => {
        deleteEditAppointment(props.appointmentId)
            .then(result => {
                setSlideIn("SidePanel")
                setTimeout(() =>
                    props.closeHandler(false)
                    , 200)
            })
    }

    const onHandleClose = (value, key) => {
        if (props.deleteAble) {
            handleDiscardAppointment();

        }
        else {
            setSlideIn("SidePanel")
            setTimeout(() =>
                props.closeHandler(false)
                , 200)
        }

    }
    const [slideIn, setSlideIn] = useState("SidePanel");

    useEffect(() => {
        props.show ?
            setTimeout(() =>
                setSlideIn("SidePanel SlideInRight")
                , 100)
            :
            setTimeout(() =>
                setSlideIn("SidePanel")
                , 100)
    }, [props.show])

    return props.show && (
        <div style={{ ...styles.sidePanel, ...props.style }} className={slideIn}>
            <div style={{ position: "sticky", top: 0, backgroundColor: "#f5f5f5", zIndex: 100 }}>
                <Tooltip title={props.deleteAble ? "Discard Edit" : "Close"} placement="bottom" trigger="hover">
                    <IconButton onClick={onHandleClose} style={styles.closeBtn}>
                        <ClearIcon
                            onClick={onHandleClose}
                        />
                    </IconButton>
                </Tooltip>
            </div>
            <div className='SlidePanelContainer'>
                {props.children}
            </div>
        </div>
    )
}

export default SidePanelContainer

SidePanelContainer.defaultProps = {
    show: false,
    closeHandler: () => { },
    style: {},
    deleteAble: false,
    appointmentId: "",
}

const styles = {
    sidePanel: {
        width: "90vw",
        height: "100vh",
        backgroundColor: "#f5f5f5",
        position: "fixed",
        top: 0,
        // right: 0, 
        zIndex: 500,
        overflowY: "scroll"
    },
    closeBtn: {
        position: "absolute",
        left: 5,
        top: 5,
        color: "grey"
    }
}
import React, { useEffect, useState } from "react"
import { getAllAppointmentsWithTrail } from "../../Hooks/API";
import ActivePatientImages from './ActivePatientImages'
import SidePanelContainer, { SidePanelHeader } from './SidePanelContainer'
import { Row, Col, Container } from 'react-bootstrap'
import CurrentTabPatient from '../CurrentTabPatient'
import PatientInfoSection from './PatientInfoSection'
import { Fragment } from "react";

const ActiveListSidePanel = (props) => {
    // console.log("validation ",props.validation)
    const [sidePanel, setSidePanel] = useState(false);
    const [selectedPanelData, setSelectedPanelData] = useState("");
    const [validationVal, setValidationVal] = useState([]);
    const [Val, setVal] = useState(false);
    console.log("validation are ", validationVal);


    const validationCallback = (id, value, msg) => {
        console.log("validation callback: start ", validationVal, "copy", !!validationVal[0] && (74 in validationVal[0]), validationVal.hasOwnProperty(74))

        let valArray = validationVal.slice(0);
        let addIndex = -1;
        if (!value) {
            valArray.map((item, i) => {
                if (id in item) {
                    addIndex = i;
                    return true;
                }
                return false;
            })
            addIndex === -1 ? valArray.push({ [id]: msg }) : valArray.splice(addIndex, 1, { [id]: msg })
            // if (!(id in validationVal)) {
            //   valArray.push({[id] : msg});
            // }
        } else {

            valArray.map((val, i) => id in val && valArray.splice(i, 1))

        }

        console.log("validation callback: ", value, "id", id, "array", valArray)
        setValidationVal(valArray)
        setVal(value)
        console.log("validation callback: start ", validationVal)

    }


    // const initailizeEmptyImages = () => {
    //     // let temp = []
    //     props.patientsList.map((item,i) => (
    //         <ActivePatientImages key={i} item={item} />
    //       ))
    // }

    // useEffect(() => {
    //     // setImages(initailizeEmptyImages())
    //     let isMounted = true;
    //     console.log(" Patients List ", props.patientsList)
    //     isMounted && props.patientsList !==0 && props.patientsList.map((item) => {
    //         let temp = images.slice(0);
    //         temp.push({[item.patientinfo.patient_id]:""})
    //         item.patientinfo.image !== "" &&
    //         getImage('patients', item.patientinfo.patient_id)
    //             .then((json) => { 
    //                 setImages("data:image;charset=utf-8;base64," + json.encodedData);
    //                 // setImages(temp) 
    //             })
    //             .catch((error) => console.error(error))
    //             .finally(() => {
    //             })
    //     })

    //     return () => { isMounted = false };
    // }, [props.patientsList]);

    const [selectedRecentCompleteAppointment, setSelectedRecentCompleteAppointment] = useState("");

    const setTrailforFollowup = (item) => {
        console.log("Copy from followup is: setting trail", item)
        if (!!item)
            getAllAppointmentsWithTrail(item.patientinfo.patient_id, item.parent_appointment_id)
                .then(result => {
                    if (!result.error && result.length !== 0)
                        setSelectedRecentCompleteAppointment(result[0].followups[0]);
                    console.log("Copy from followup is: setting trail result", result)
                })
    }

    const showSidePanel = () => {
        return (
            !!selectedPanelData &&
            <SidePanelContainer holadbale show={sidePanel} closeHandler={setSidePanel} itemData={selectedPanelData} >
                <SidePanelHeader itemData={selectedPanelData}
                    refreshList={props.refreshList}
                    closeHandler={setSidePanel}
                    validation={validationVal} values={Val} />
                <Container fluid>
                    <Row>
                        {/* Controls */}
                        <Col lg={6} style={{ backgroundColor: "none" }}>
                            <CurrentTabPatient
                                copyButton={selectedPanelData.appointment_id !== selectedPanelData.parent_appointment_id}
                                copyingData={selectedRecentCompleteAppointment}
                                patientId={selectedPanelData.patientinfo.patient_id}
                                appointmentId={selectedPanelData.appointment_id}
                                appointment_type={selectedPanelData.appointment_type}
                                validation={validationCallback}
                            />
                        </Col>
                        {/* History */}
                        {/* {selectedPanelData.patientinfo.name} */}
                        <Col lg={6} style={{ maxHeight: "85vh", backgroundColor: "none", overflowY: "scroll" }}>
                            <PatientInfoSection patientID={selectedPanelData.patientinfo.patient_id} />
                            {/* <ActiveAppointment id={1}/> */}
                        </Col>
                    </Row>
                </Container>
            </SidePanelContainer>
        )
    }

    const [autoOpenId, setAutoOpenId] = useState(0);

    useEffect(() => {
        console.log("Blinking: ALSP useEffect")
        if (!!props.patientsList && props.patientsList.length !== 0) {
            console.log("Blinking: ALSP ListChanged")
            props.patientsList.some((item, i) => {
                if (item.appointment_id === props.autoOpenId && props.autoOpenId !== autoOpenId) {
                    console.log("Blinking: ALSP AutoOpen prop:", props.autoOpenId, item.appointment_id)
                    setTimeout(() => {
                        props.autoOpenHandler()
                        setSidePanel(true);
                        setSelectedPanelData("")
                        setSelectedPanelData(item)
                        setTrailforFollowup(item)
                    }, 500)
                    return true;
                }
                return false;
            })
        }
    }, [props.patientsList, props.autoOpenId])

    return (
        <Fragment >
            <div style={{ position: "absolute" }}>
                {showSidePanel()}
            </div>
            <div className={props.patientsList.length === 0 ? "ActiveSidePanelEmpty ActiveSidePanel" : "ActiveSidePanel"}>
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    textOrientation: "mixed",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    padding: 4,
                    marginBottom: 15,
                    fontSize: 30,
                    fontWeight: "bold",
                    textAlign: "left",
                    color: "#d7d7d7",
                }}>
                    In-Progress Appointments
                </div>
                {props.patientsList.map((item, i) =>
                    <div onClick={() => {
                        setSidePanel(true);
                        setSelectedPanelData("")
                        setSelectedPanelData(item)
                        setTrailforFollowup(item)
                    }}>
                        <ActivePatientImages key={i} item={item.patientinfo} />
                        {/* <Tooltip title={item.patientinfo.name} placement="left" trigger="hover">
                        <Avatar src={!!images[item.patientinfo.patient_id] && images[item.patientinfo.patient_id]} style={styles.avatar}/>
                        <Avatar src={images} style={styles.avatar}/>
                    </Tooltip> */}
                    </div>
                )}
            </div>
        </Fragment>
    )
}

export default ActiveListSidePanel

ActiveListSidePanel.defaultProps = {
    patientsList: [],
    validation: () => { },
    refreshList: () => { },
    autoOpenId: 0,
    autoOpenHandler: () => { }
}

// const styles = {
//     sidePanel : {
//         width: "60px", 
//         minHeight: "calc(100vh - 70px)", 
//         backgroundColor: "#f5f5f5", 
//         position: "sticky", 
//         top: 0, 
//         right: 0, 
//         zIndex: 20,
//         boxShadow: "-2px 0px 5px rgba(0, 0, 0, 0.09)"
//         },
//     closeBtn: {
//         position: "absolute",
//         left: 5,
//         top: 5,
//         color: "grey"
//     },
//     avatar: { height: "40px", width: "40px", display: "flex", border: '1px solid #e0004d', margin: 10 },
// }
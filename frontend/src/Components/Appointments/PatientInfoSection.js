import React, { useContext } from 'react'
import { useEffect, useState } from 'react';
import { Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import { GlobalContext } from '../../Context/GlobalState';
import { getVitalsAPI } from '../../Hooks/API';
import HistoryTabPatient from '../HistoryTabPatient';
import VitalTabPatient from '../VitalTabPatient';

const PatientInfoSection = (props) => {
    const { accountId,elementDocId } = useContext(GlobalContext)
    const pat_ID = props.patientID;
    const [tabKey, setTabKey] = useState("History");
    const [vitalsData, setVitalsData] = useState([]);

    useEffect(() => {
        getVitalsAPI(elementDocId, pat_ID, 0, "GET").then(result => {
            console.log("vitals api results active tab", result);
            setVitalsData(result);
        });
    }, [pat_ID]);

    const callBack = () => {
        getVitalsAPI(elementDocId, pat_ID, 0, "GET").then(result => {
            console.log("Back call results", result);
            setVitalsData(result);
        });
    }

    return (
        <div>
            <Container fluid style={{ padding: 20 }}>
                {/* Header */}
                {/* <PatientProfileHeader key={props.key} showDetail={'No'} showInfo={'Yes'} patient_data={props.patientData} info={patientinfo} status={patientStatus} VisibleStatus={'AppointmentBtnHidden'}/>            */}
                {/* Tabs */}
                <Row>
                    <Col>
                        <Tabs
                            id="controlled-tab"
                            activeKey={tabKey}
                            onSelect={(k) => setTabKey(k)}
                            style={{ paddingLeft: 30, marginTop: 20, fontSize: 14 }}
                        >
                            <Tab
                                eventKey="Vitals"
                                title="Vitals">
                                <VitalTabPatient patientID={pat_ID} vitals={vitalsData} backCall={callBack} />
                            </Tab>
                            <Tab
                                eventKey="History"
                                title="History">
                                {/* {`this is ${tabKey} of ${patientName}`} */}
                                <HistoryTabPatient patientID={pat_ID} />
                            </Tab>
                            {/* <Tab
                                eventKey="Profile" 
                                title="Profile">
                                    <PatientProfileUi patientID={pat_ID} />
                                    {console.log("THIS IS PROFILE DATA")}
                            </Tab> */}
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default PatientInfoSection

PatientInfoSection.defaultProps = {
    patientID: 1
}
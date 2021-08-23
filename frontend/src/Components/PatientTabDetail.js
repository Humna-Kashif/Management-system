import React, { useEffect, useState,useContext } from "react"
import { Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import HistoryTabPatient from "../Components/HistoryTabPatient";
import PatientProfileHeader from "../Components/PatientProfileHeader";
import VitalTabPatient from "../Components/VitalTabPatient";
import Archives from "./Archives/Archives";
import {getVitalsAPI} from '../Hooks/API';
import { GlobalContext } from "../Context/GlobalState";

const PatientTabDetail = (props) => {
    const {accountId,elementDocId} = useContext(GlobalContext)
    const patientInfo = props.patientInfo;
    console.log("patient info in patienttabdetail ", patientInfo)
    const [tabKey, setTabKey] = useState("History");
    const [vitalsData,setVitalsData] = useState([]);

    useEffect(() => {
        getVitalsAPI(elementDocId,patientInfo.patient_id,0,"GET").then(result => {
            console.log("vitals api results",result);
            setVitalsData(result);
            
        });
    },[patientInfo.patient_id]);

    const callBack = () => {
        if(patientInfo){
            getVitalsAPI(elementDocId,patientInfo.patient_id,0,"GET").then(result => {
                console.log("Back call results",result);
                setVitalsData(result);
            });
        }
    }

    return (
        <div>
            <Container fluid style={{padding: 20}}>
                {/* Header */}
                 <PatientProfileHeader info={patientInfo} VisibleStatus={'AppointmentBtn'} showInfo={'No'}/>   
                {/* Tabs */}
                <Row>
                    <Col>
                        <Tabs id="controlled-tab" activeKey={tabKey} onSelect={(k) => setTabKey(k)} 
                        style={{paddingLeft: 30, marginTop: 20, fontSize: 14}}
                        >
                            <Tab eventKey="History" title="History">
                                <HistoryTabPatient patientID={patientInfo.patient_id} />
                            </Tab>
                            <Tab eventKey="Vitals" title="Vitals">
                                <VitalTabPatient patientID={patientInfo.patient_id} info={patientInfo} vitals={vitalsData} backCall={callBack} />
                            </Tab>
                            {/* Hide for now */}
                            {/* <Tab eventKey="Profile" title="Profile">
                                <PatientProfileUi info={patientInfo} />
                                {console.log("THIS IS PROFILE DATA", patientInfo)}
                            </Tab> */}
                            <Tab eventKey="Test Results" title="Test Results">
                                <Archives patientID={props.patientInfo.patient_id} info={props.patientInfo}/>
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default PatientTabDetail;

PatientTabDetail.defaultProps = {
    patientData: {
        patient_name : "default",
        image: ""
    }
};
 
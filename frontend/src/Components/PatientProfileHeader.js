import React, { useEffect, useState } from "react";
import { Col, Row } from 'react-bootstrap'
import AppointmentModal from "./AppointmentModal/Modal";
import { downloadFile } from '../Hooks/ImageAPI'
import { Avatar } from "@material-ui/core";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/Calender.css'
import 'react-calendar/dist/Calendar.css';
import '../Styles/PatientProfileHeader.css';
import { getDateOfBirth } from '../Hooks/TimeHandling';
import AddIcon from '@material-ui/icons/Add';

const PatientProfileHeader = (props) => {
    const [image, setImage] = useState(null);
    const [showModalAdd, setShowModalAdd] = useState(false);
    console.log('Patient Profile HEader Info', props.patient_data)

    const titleCase = (str) => {
        return str.toLowerCase().split(' ').map(function (word) {
            return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
    }
    const handleClose = () => {
        setShowModalAdd(false);
    };
    const handleShow = () => {
        setShowModalAdd(true);
    };

    const showImage = () =>{
        if(!!props.info.image){
            let isMounted = true;
            if(!!props.info.patient_id){
                downloadFile('patients', props.info.patient_id, 'profile')
                .then((json) => { isMounted && setImage("data:image;charset=utf-8;base64," + json.encodedData) })
                .catch((error) => console.error(error))
                .finally(() => {
                });
            } else {
                console.log("Downloading Image Failed! id is null")
            }
             return () => { isMounted = false };
        }
    }

    useEffect(() => {
        showImage();
    }, [props.info.patient_id]);

    return (
        <Row style={{ display: "flex" }}>
            <Col lg={8}>
                <div style={styles.header_container}>
                    <Avatar src={image} style={props.info.blood_group?styles.avatar:styles.avatarStyle} />
                    <div style={styles.title_container}>
                        <div style={styles.title__name}>{!!props.info.name && titleCase(props.info.name)}</div>
                        <label style={styles.labelStyle} > {getDateOfBirth(props.info.dob)}  Years ({props.info.gender}) </label>
                        {props.info.blood_group? 
                            <div style={styles.appointment_time} className={props.showDetail}> Blood Group: <label style={{ textTransform: 'uppercase' }}> {props.info.blood_group} </label></div>
                        :''}
                        <div style={styles.title__label} className={props.showInfo} >{props.status ? props.status : 'In Progress'}</div>
                        <div style={styles.title__label} className={props.showInfo} > Appointment Date Time: <label > <label > {props.patient_data.date_time_of_appointment}</label> at {props.patient_data.date_time_of_appointment}</label></div>
                    </div>
                </div>
            </Col>
            <Col lg={4}>
                {/* <Button size="md" variant="primary" className={props.VisibleStatus} onClick={() => handleShow()}>
                    New Appointment +
                </Button> */}
                <div style={{color: "#e0004d", fontSize: 16, textAlign: "right"}} onClick={() => handleShow()}>
                    <label style={{ cursor: "pointer"}}> New Appointment 
                        <i>
                            <AddIcon style={{height:20,width:20,marginLeft: 4, marginBottom:2,  cursor: "pointer"}}/>
                        </i>
                    </label>
                </div>
            </Col>
            <AppointmentModal displayFunction={'new'} show={showModalAdd} hide={handleClose} Name={props.info.name} status={props.status} id={props.info.patient_id} />
        </Row>
    )
}

export default PatientProfileHeader;

PatientProfileHeader.defaultProps = {
    patientName: "Nameee",
    appointmentLabel: "this is awesome",
    info: {
        image: "",
        name: "Sample Patient"
    },
    patient_data: {
        date_time_of_appointment: ''
    },

};

const styles = {
    header_container: { display: "flex", flexDirection: "row", padding: 10, alignItems: "center" },
    avatar: { height: "80px", width: "80px", display: "flex", border: '2px solid #e0004d', marginTop: -4 },
    avatarStyle: { height: "80px", width: "80px", display: "flex", border: '2px solid #e0004d'},
    appointment_time: { fontSize: 13, textAlign: "left", color: '#333333' },
    title_container: { display: "flex", flexDirection: "column", textAlign: "left", marginLeft: 10 },
    title__name: { color: "#e0004d", fontSize: 18, fontWeight: "bold", marginBottom: 0 },
    title__label: { color: "#00000081", fontSize: 14, marginTop: -5, marginBottom: 0 },
    labelStyle: { color: '#847c7e', marginBottom: '0px', fontWeight: '550' },
};
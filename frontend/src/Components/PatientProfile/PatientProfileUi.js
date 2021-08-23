import React, { useState, useEffect, Fragment } from 'react'
import { Container } from "react-bootstrap"
import Chip from '@material-ui/core/Chip';
import { appointmentDetailAPI } from '../../Hooks/API';
import { downloadFile } from '../../Hooks/ImageAPI'
import { getTime, getDate } from '../../Hooks/TimeHandling';

const PatientProfileUi = (props) => {
    console.log('props data in profiel',props.info)
    const patientID = props.info? props.info.patient_id : props.patientID ;
    const [image, setImage] = useState(null);
    const [patientProfile,setPatientProfile] = useState([]);
    const [testList, setTestList] = useState([]);
    const [symptomsList, setSymptomsList] = useState([]);
    const [diagnosisList, setDiagnosisList] = useState([]);
    const [username, setUsername] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [pastLocation, setPastLocation] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [note, setNote] = useState([]);

    useEffect(() => {
        appointmentDetailAPI(patientID).then(result => {
            console.log("Patient Profile Details of", patientID, result)
            if (result) {
                if (result[0]) {
                    setPatientProfile(result[0])
                    console.log('Status of patient profile is',result[0])
                    if (!!result[0].appointment_data.tests) {
                        setTestList(result[0].appointment_data.tests);
                    }
                    else setTestList('')

                    if (result[0].date_time_of_appointment) {
                        setAppointmentTime(result[0].date_time_of_appointment)
                    }
                    else setAppointmentTime('')

                    if (result[0].doctors_note) {
                        setNote(result[0].doctors_note)
                    }
                    else setNote([])

                    if (result[0].appointment_data.symptoms) {
                        setSymptomsList(result[0].appointment_data.symptoms);
                    }
                    else setSymptomsList('')

                    if (result[0].patientinfo.name) {
                        setUsername(result[0].patientinfo.name);
                    }
                    else setUsername('')

                    if (result[0].patientinfo.dob) {
                        setDob(result[0].patientinfo.dob);
                    }
                    else setDob('')

                    if (result[0].patientinfo.gender) {
                        setGender(result[0].patientinfo.gender);
                    }
                    else setGender('')

                    if (result[0].patientinfo.blood_group) {
                        setBloodGroup(result[0].patientinfo.blood_group);
                    }
                    else setBloodGroup('')

                    if (result[0].doctorinfo.appointment_location) {
                        setPastLocation(result[0].doctorinfo.appointment_location.appointment_location_of_doctor);
                    }
                    else setPastLocation('')
                }
            }
            else console.log('Error')
        });
        if(!!props.info && props.info.image!=null){
            downloadFile('patients', patientID, 'profile')
            .then((json) => { setImage("data:image;charset=utf-8;base64," + json.encodedData); console.log("my json is ", json); })
            .catch((error) => console.error(error))
            .finally(() => {
            });
        } else {
            console.log("Downloading Image Failed! image is null")
          }
    }, [patientID]);

    const renderTests = () => {
        return (
            testList.length !== 0 ?
                testList.map((item, i) => (
                    <Fragment>
                        <Chip key={i} label={item.test_name} variant="outlined" /> &nbsp;
                    </Fragment>
                ))
                :
                <div style={{ marginLeft: '10px' }}> No Prescribed Tests Yet</div>
        )
    }
    const renderSymptoms = () => {
        return (
            symptomsList.length !== 0 ?
                symptomsList.map((item, i) => (
                    <Fragment>
                        <Chip key={i} label={item.symptoms} variant="outlined" /> &nbsp;
                    </Fragment>
                ))
                :
                <div style={{ marginLeft: '10px' }}> No Symptoms Yet</div>
        )
    }
    const renderDiagnosis = () => {
        return (
            symptomsList.length !== 0 ?
                symptomsList.map((item, i) => (
                    <Fragment>
                        <Chip key={i} label={item.symptoms} variant="outlined" /> &nbsp;
                    </Fragment>
                ))
                :
                <div style={{ marginLeft: '10px' }}> No Symptoms Yet</div>
        )
    }
    return (
        <div style={styles.containerClass}>
          {(patientProfile.length!==0 && !!patientProfile) ? (
            <Container>
                {/* <Row>
                    <Col md='auto'>
                        <Avatar src={image} style={styles.avatar} />
                    </Col>
                    <Col lg={7}>
                        <h6 style={styles.name_title}>{username}</h6>
                        <label style={styles.labelStyle}> {getDateOfBirth(dob)}  Years ({gender ? gender : 'Not defined'}) </label>
                        <div style={styles.appointment_time}>
                            <b> Appointment Time:  </b> <label> {getDate(appointmentTime)}, {getTime(appointmentTime)}</label>
                        </div>
                    </Col>
                </Row>
                <Divider /> */}

                <div style={{ padding: 15 }}>

                <h6 style={styles.headTag}> Last Appointment: </h6>
                    <p style={styles.pTag}>  {getDate(appointmentTime)} at {getTime(appointmentTime)}  </p>

                    <h6 style={styles.headTag}> Doctor's Note: </h6>
                    <p style={styles.pTag}>  {(note.length !== 0 ? note.map(i => <ul style={{marginLeft:'20px'}}> <li> {i.doctor_note? i.doctor_note : 'Not Added'} </li></ul>):'Not Added ')}   </p>

                    <h6 style={styles.headTag}> Blood Group: </h6>
                    <p style={styles.pTag}>  {bloodGroup ? bloodGroup : 'Not Defined'}  </p>

                    {/* <h6 style={styles.headTag}> Past Medical History: </h6>
                    <p style={styles.pTag}>  No History  </p> */}

                    <h6 style={styles.headTag}> Past Location: </h6>
                    <p style={styles.pTag}>{pastLocation ? pastLocation : 'Not Added Yet'}</p>

                    <h6 style={styles.headTag}> Symptoms: </h6>
                    <div className='SymptomsDiv'>
                        {renderSymptoms()}
                    </div>

                    <h6 style={styles.headTag}> Test: </h6>
                    <div className='SymptomsDiv'>
                        {renderTests()}
                    </div>
                </div>
            </Container> ) : 
            
                <div style={{...styles.card, minHeight: "60vh", flex: 1, flexDirection: "column", display: "flex", justifyContent: "center",alignItems:"center", backgroundColor: "#f5f5f5"}}>
                <div style={{fontSize:48, fontWeight: "300", color:"#0000003a"}}>
                    No Past Medical History
                </div>
                <div style={{fontSize:16, fontWeight: "bold", color:"#00000048"}}>
                   Complete an appointment to see patient profile 
                </div>
            </div>
}

        </div>
    )
}
export default PatientProfileUi

const styles = {
    containerClass: { borderRadius: '0px 0px 4px 4px', border: '1px solid rgb(226 223 223)', padding: 20, textAlign: 'left', borderTop: 'none' },
    label: { fontSize: 14, textAlign: "Left", margin: "20px", backgroundColor: "whtiesmoke", padding: 20, borderRadius: "0.5em", border: "solid", borderColor: "gray", borderWidth: 1 },
    input: { fontSize: 14, padding: 8, borderRadius: "5px" },
    labelStyle: { color: '#847c7e', marginBottom: '0px', fontWeight: '550' },
    avatar: { height: "80px", width: "80px", display: "flex", border: '2px solid #e0004d' },
    add_photo: { color: "black", cursor: "pointer", display: "flex" },
    name_title: { color: "#e0004d", fontWeight: "bold", fontSize: 22, textAlign: "left", marginTop: "10px", marginBottom: '0px' },
    appointment_time: { fontSize: 13, textAlign: "left", color: '#333333' },
    pTag: { textIndent: 10, fontSize: '14px', color: '#333333' },
    headTag: { fontSize: '14px', color: '#e0004d', fontWeight: 'bold', marginTop: '5px' },
    reschedule_btn: {
        background: "#91DB92",
        color: "#096A0B ",
        height: "25px",
        borderRadius: "0.5em",
        border: "#91DB92",
        margin: "10px",
        width: "100px"
    },
    checkIn_btn: {
        background: "#8EDAD8 ",
        color: "#29A9A7",
        height: "25px",
        borderRadius: "0.5em",
        border: "#8EDAD8",
        margin: "10px",
        width: "100px"
    },
    card: { backgroundColor: "#fff", boxShadow: "#00000018 2px 2px 10px", padding: 8, paddingRight: 12, paddingLeft: 12 }
}
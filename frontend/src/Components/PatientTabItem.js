import React, { useContext, useEffect, useState } from 'react'
import { Avatar } from "@material-ui/core";
import {Col, Row, Button, Modal} from "react-bootstrap";
import {Select,Radio, Input,DatePicker} from 'antd';
import { downloadFile } from '../Hooks/ImageAPI'
import {editPatientInfoAPI} from '../Hooks/API'
import EditIcon from '@material-ui/icons/Edit';
import Divider from '@material-ui/core/Divider';
import { Fragment } from 'react';
import moment from 'moment'
import '../Styles/PatientList.css'
import { GlobalContext } from '../Context/GlobalState';
const { Option } = Select;

const PatientTabItem = (props) => {
  const {accountId,elementDocId} = useContext(GlobalContext)
    const [showEditPatientModal, setEditPatientModal] = useState(false);
    const [ patientName, setPatientName] = useState(props.info.name);
    const [ genderValue, setGenderValue] = useState(props.info.gender);
    const [patientAge, setPatientAge]=useState(props.info.dob);
    const [ number, setNumber] = useState(props.info.number);
    const [countryCode,setCountryCode]= useState('');
    function titleCase(str) {
        return str.toLowerCase().split(' ').map(function (word) {
            return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
    }
    const [image, setImage] = useState(null);
    useEffect(() => {
        if (!!props.info.image) {
            downloadFile('patients', props.info.patient_id, 'profile')
                .then((json) => { setImage("data:image;charset=utf-8;base64," + json.encodedData)})
                .catch((error) => console.error(error))
                .finally(() => {
                });
        } else {
            console.log("Downloading Image Failed! image is null")
        }
    }, [props.info]);

    const handleEditPatient = () => {
        setEditPatientModal(true);    
      };
      const handleModalClose = () => {
        setEditPatientModal(false);
      };
  
    
      const handleConfirmEditPatient = (id) => {
            if(id!==null){
              editPatientInfoAPI(elementDocId,id,patientName,patientAge,genderValue,number).then((result)=>{
                console.log("Edit patient result ",result);
               props.callBack();
              })
              handleModalClose();
            }
            else{
              console.log("edit patient function values are   id ",id)
              editPatientInfoAPI(elementDocId,id,patientName,patientAge,genderValue,number).then((result)=>{
                console.log("Edit patient result ",result);
                props.callBack();
                
                // // renderPatientsList();
                // getPatientFromAPI(input);
              })
              handleModalClose();
            }
      
      };
      const onChangeGender = e => {
        console.log('gender is', e.target.value);
        setGenderValue(e.target.value);
      };

    return (
        <Fragment>
            <div className={`PatientListItem ${props.AccessStatus}`} >
                <div style={props.selected ? styles.header_container_selected : styles.header_container} onClick={() => { props.handleItem(props.info); props.handleAccess(props.access) }}>
                    <Avatar src={image} style={styles.avatar} />
                    <div style={styles.title_container}>
                        <div style={{display:'flex',display:'flex'}}> 
                        <div>
                        <h6 style={props.selected ? styles.title__name_selected : styles.title__name}>{props.info.name? titleCase(props.info.name): 'Name'}</h6>
                        <div style={styles.title__label}>{props.info.number?props.info.number:'not added'}</div>
                        </div>
                        <div className='EditPatient'> 
                            {props.session === null && <EditIcon onClick={handleEditPatient}/>}
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            <Divider />
            <Modal
                show={showEditPatientModal}
                onHide={handleModalClose}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title className='ModalTitle'>
                        Edit Patient Details
                    </Modal.Title>
                </Modal.Header>
        
                <Modal.Body>
                <Row className={"modal-input"}>
                <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                  Phone Number:
                </Col>
                <Col lg={8} >
                    <Input name='number' rules={[{required: true}]} placeholder='+923001234567' onChange={(e) => {setNumber(e.target.value);}} defaultValue={number}/> 
                </Col>
              </Row>
              <Row className={"modal-input"}>
                  <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                    Name:
                  </Col>
                  <Col lg={8} >
                        <Input
                          placeholder="Enter Patient Name..."
                          name='name' rules={[{required: true}]}
                          type="text"
                          defaultValue={patientName}
                          onChange={(e) => {
                            setPatientName( e.target.value);
                          }}
                        />
                    
                  </Col>
              </Row>
              <Row className={"modal-input"}>
                  <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                    Date of Birth:
                  </Col>
                  
                  <Col lg={8} className={"modal-input__value"}>
                    <DatePicker style={{width:'100%'}}  placeholderText={"YYYY-MM-DD"} placeholderText={"YYYY-MM-DD"} defaultValue={moment(patientAge, 'YYYY-MM-DD')} format={'YYYY-MM-DD'} 
                            onChange={(date, dateString) => {
                            console.log('dob value is',date, dateString )
                            setPatientAge(dateString);
                            }} />
                 
                  </Col>
              </Row>
              <Row className={"modal-input"}>
                  <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                    Gender:
                  </Col>
                  
                  <Col lg={8} >
                      <Radio.Group  onChange={onChangeGender} defaultValue={genderValue}>
                        <Radio value='male'>Male</Radio>
                        <Radio value='female'>Female</Radio>
                        <Radio value='other'>Other</Radio>
                      </Radio.Group>
                  </Col>
              </Row>
            
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={handleModalClose}
                        style={{ marginLeft: "10px" }}
                        
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        onClick={() => handleConfirmEditPatient(props.info.patient_id)}
                        style={{ marginLeft: "10px" }}
                        
                    >
                        Save
                    </Button>
                   
                    </Modal.Footer>
                    
            </Modal>
        </Fragment>

    )
}

export default PatientTabItem;

PatientTabItem.defaultProps = {
    imageURL: "",
    patientName: "Nameee",
    appointmentLabel: "this is awesome",
    info: {
        image: "",
        name: "Sample Patient"
    }
};

const styles = {
    header_container: { display: "flex", flexDirection: "row", padding: 10, alignItems: "center", backgroundColor: "white", cursor: 'pointer' },
    header_container_selected: {
        display: "flex", flexDirection: "row", padding: 10, alignItems: "center"
        , backgroundColor: "#f6f6f6", borderColor: "#e0e0e0", borderStyle: "solid", borderWidth: 0.3
    },
    avatar: { height: "50px", width: "50px", borderWidth: 0.3, borderColor: "#e0004d", borderStyle: "solid" },
    title_container: { display: "flex", flexDirection: "column", textAlign: "left", marginLeft: 10, marginTop: 2 },
    title__name: { color: "#3a3b3c", fontSize: 15, fontWeight: "bold", marginBottom: 0 },
    title__name_selected: { color: "#e0004d", fontSize: 15, fontWeight: "bold", marginBottom: 0 },
    title__label: { color: "#00000081", fontSize: 14 }
};
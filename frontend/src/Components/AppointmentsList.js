import React, { useEffect, useState, useContext } from "react";
import { Button, Col, Row, Card, Container, Modal } from "react-bootstrap";
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TimelineDot from '@material-ui/lab/TimelineDot';
import { Avatar, Divider } from "@material-ui/core";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment";
import {getDateOfBirth,getTime,getSlot,getDatetoSet} from '../Hooks/TimeHandling'
import { Select } from 'antd';
import {
  appointmentStatusAPI,
  availableSlotsAPI,
  rescheduleAppointmentAPI,
  locationsAPI,
  searchReasonsAPI
} from "../Hooks/API";
import { downloadFile } from '../DB/API'
import Calender from "react-calendar";
import { Fragment } from "react";
import FeeModal from "./AppointmentModal/FeeModal";
import {GlobalContext} from '../../Context/GlobalState'
const { Option } = Select;

const AppointmentsList = (props) => {
  const {accountId,accountType} = useContext(GlobalContext);
  const [open, setOpen] =useState(false);
  const data = props.itemData;
  console.log("reschdule data is ",data);
  const appointment_Time = data.date_time;
  var years = getDateOfBirth(data.patient.dob);
  const [slots, setSlots] = useState([]);
  const [timeSlot, setTimeSlot] = useState(getSlot(appointment_Time));
  const [date, setDate] = useState(appointment_Time);
  const [showRescheduleModal, setRescheduleModal] = useState(false);
  const [showFeeModal, setFeeModal] = useState(false);
  const [image, setImage] = useState(null);
  const [docAppointmentType,setDocAppointmentType]=useState('');
  const [patAppointmentType,setPatAppointmentType]=useState(props.itemData.appointment_type);
  const [suggestList, setSuggestionList] =useState(props.SuggestionList);

  const onValueChange = (statusVal) => {
    if (statusVal == "upcoming") {
      return "Checked In";
    } else if (statusVal == "waiting") {
      return "Start";
    } else
    return "Done"
  };
  const [status, setStatus] = useState(data.appointment_status);
  const [value, setValue] = useState(onValueChange(data.appointment_status));
  console.log("Appoitnemtn status check ",data.appointment_status)

  const onStatusChange = () => {
    if (value == "Checked In") {
      setFeeModal(true);
      changeAppointmentStatusApi(data.appointment_id, "waiting");
      // console.log("Status API",result);
    } else if (value == "Start") {
      changeAppointmentStatusApi(data.appointment_id, "inprogress");
     
      // setStatus("inprogress");
    } else {
      changeAppointmentStatusApi(data.appointment_id, "cancelled");
      // setStatus("upcoming");
    }
  };

  function titleCase(str) {
    if(str!==null)
    {
    return str.toLowerCase().split(" ").map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
    }
    else
    return "";
  }

  const onChange = (date) => {
    setDate(date);
    availableSlots(data.doctors_hospital_location_id, date);
    console.log("my date ",date);
  };

  const handleModalClose = () => {
    setRescheduleModal(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const changeAppointmentStatusApi = (app_id, status) => {
    appointmentStatusAPI(accountId, 0, 0, app_id, "PUT", status).then(
      (result) => {
        setStatus(status);
        setValue(onValueChange(status));
        props.callback(status, data.appointment_id);
        console.log(
          "StatusAPI : ",
          result,
          "Status: ",
          status,
          "Value: ",
          value
        );
      }
    );
  };

  const [locationID, setLoactionID] = useState(
    data.doctors_hospital_location_id
  );

  const getLocDays = (value) => {
    for (var i = 0; i < locationData.length; i++) {
      if (locationData[i].location == value) {
        setLoactionID(locationData[i].doctors_hospital_location_id);
        setDocAppointmentType(locationData[i].appointment_type);
        return locationData[i].days;
      }
    }
    return [];
  };

  const [disabledDays, setDisabledDays] = useState([]);

  const collectDisabledDays = (docData, index) => {
    let a = [];
    let d1 = docData;
    console.log("d1,", d1);
    let d2 = d1.split("-");
    let days2 = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    let days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    for (var k = 0; k < 7; k++) {
      days = days.filter((item) => item !== d2[k]);
    }
    console.log("doc data is ", days);

    for (var j = 0; j < days.length; j++) {
      for (var i = 0; i < days2.length; i++) {
        if (days[j].toLowerCase() == days2[i].toLocaleLowerCase()) {
          console.log("i is ", i);

          a.push(i);
        }
      }
    }
    setDisabledDays(a);
  };

  const handleReschedule = () => {
    setSelectedValue(data.appointment_location.appointment_location_of_doctor);
    setRescheduleModal(true);
    setPatAppointmentType(data.appointment_type);
    console.log("this is happening: ", patAppointmentType, "data:", data, "type", data.appointment_type);
  };

  const handleConfirmReschedule = (appointment_id) => {
    const newdate = getDatetoSet(date);
    console.log("location id : ",locationID,"appointment_id ",appointment_id, "time ", timeSlot, " patAppointmentType ",
    patAppointmentType ," date ", newdate);
  appointmentType
    rescheduleAppointmentAPI(
      0,locationID,0,
      appointment_id,
      "PUT","doctor",
      accountId,
      newdate,
      timeSlot,
      patAppointmentType
    ).then((result) => {
      console.log("reschdule ", result);
      handleModalClose();
      props.callback(status, data.appointment_id);
      collectDisabledDays(data.appointment_location.days, 0);
    });
  };

  const availableSlots = (location_id, date) => {
    const newdate = getDatetoSet(date);
    availableSlotsAPI(accountId, location_id, "PUT", newdate).then((result) => {
      console.log("available", result);
      if(result[0])
      setSlots(result[0].time_slots);
    });
  };

  const renderAvailableSlots = () => {
    return (
      <div style={{ flexDirection: "row", flexWrap: "wrap" }}>
           <div className='SlotsHead'> <b> Available Slots </b></div>
           <Divider className='AppointmentDivder'/>
           <Fragment>
        {slots.map((item) => (
          <input
          className='SlotsInput'
            onClick={() =>setTimeSlot(getSlot(item.available_time_slot))}
            type="button"
            value={getSlot(item.available_time_slot)}
          ></input>
        ))}
        </Fragment>
      </div>
    );
  };

  const [locationData, setLocationData] = useState([]);
  const [selectValue, setSelectedValue] = useState();

  const handleChange1 = (e) => {
    setSelectedValue(e.target.value);
    collectDisabledDays(getLocDays(e.target.value));
  };

  useEffect(() => {
    locationsAPI(accountId).then((result) => {
      console.log("location api results", result);
      setLocationData(result);
      setSelectedValue(
        data.appointment_location.appointment_location_of_doctor
      );
      collectDisabledDays(data.appointment_location.days);
    }); 
    if(!!data.patient.patient_id){
      downloadFile('patients',data.patient.patient_id, 'profile')
        .then((json) => {setImage("data:image;charset=utf-8;base64,"+json.encodedData); console.log("my json is ", json);})
        .catch((error) => console.error(error))
        .finally(() => {
        });
    } else {
      console.log("Downloading Image Failed! Id is null");
    }
    searchReasonsAPI(0,0,0).then(result => {
        console.log("Search result: ",result);
        setSuggestionList(result);
      });
  }, [accountId]);

  const renderReasons = () => {
    return suggestList.map((item, i) => (
      <Option value={item.discount_reason} key={i}>
        {item.discount_reason}
      </Option>
    ));
  };

  const renderItem = () => {
    console.log("locationData is ", locationData);
    return locationData.map((item, i) => (
      <option value={item.location} days={item.days} key={i}>
        {item.location}
      </option>
    ));
  };

  const AppointmentTypeRadioButton = ({ value }) => {
    console.log("radio status:", patAppointmentType)
    return (
      <input
        style={{ width: 20 }}
        type="radio"
        value={value}
        name="appointment_type"
        checked={value === patAppointmentType}
        onChange={(e) => {setPatAppointmentType(e.target.value); console.log("type selected:", e.target.value)}}
      />
    );
  };

  const renderAppointmentType = (value) =>{
    if(value === "both"){
    console.log("radio status render:", patAppointmentType)
      return(
      <Fragment key={patAppointmentType}>
        <AppointmentTypeRadioButton value={"inperson"} />  <span>Inperson</span>
        &nbsp;   &nbsp;   &nbsp;   &nbsp;  &nbsp;   &nbsp;   &nbsp;   &nbsp;
        <AppointmentTypeRadioButton value={"telehealth"} />  <span>Telehealth </span>
    </Fragment>) 
    }
  else
  return(<div>{patAppointmentType}</div>)
  }

    const handleCancelledAppointment = () =>{
      changeAppointmentStatusApi(data.appointment_id, "cancelled");
      setOpen(false);
    }

    const renderDialog=()=>{
      return(
        <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"You really want to cancel this appointment ?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Selecting Yes, will cancel the appointment. 
          </DialogContentText>
        </DialogContent>
        <Divider/>
        <DialogActions>
          <Button onClick={handleClose} color="default">
           No
          </Button>
          <Button onClick={handleCancelledAppointment} color="secondary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      )
    }
  const renderModal = () => {
    return (
      <Modal
        show={showRescheduleModal}
        onHide={handleModalClose}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
        <Modal.Title className='ModalTitle'>Reschedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Row>
          <div style={styles.header_container}>
              <Avatar src={image} style={styles.avatar}/>   
              <div style={styles.title_container}>
                  <div style={styles.title__name}>  {titleCase(data.patient.name)}</div>
                  <div style={styles.title__label}>Current Time: {getTime(appointment_Time)}</div>
              </div>
          </div>
        </Row>
            <Divider className='AppointmentDivder'/>
            <div className='SelectBox'>
                    <h6 className='optionHeading'>Select Location  </h6>
  
                    <select value={selectValue} onChange={handleChange1}>
                    <option value="">Please Select a Location</option>
                      {renderItem()}
                    </select>
                  </div>
                  <div className='SelectBox mtt-10'>
                    <h6 className='optionHeading'>Appointment Type </h6>
                    {renderAppointmentType(docAppointmentType)}
                  </div>
                  <Divider className='AppointmentDivder'/>
                  <Row className='mtt-20'>
            <Col lg={6} style={{borderRight:'1px solid #efefef'}}>
            <Calender
                minDate={new Date()}
                maxDate={new Date(moment().add(3, "months"))}
                value={date}
                tileDisabled={({ date, view }) =>
                  view === "month" && // Block day tiles only
                  disabledDays.some(
                    (disabledDay) =>
                      date.getDay() === disabledDay
                  )
                }
                onChange={onChange}
                value={new Date(data.date_time)}
              />
            </Col>
            <Col lg={6}>
              {renderAvailableSlots()}
            </Col>
          </Row>
         
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {handleConfirmReschedule(data.appointment_id);handleModalClose();}}
            style={{ marginLeft: "10px" }}
          >
            Reschedule
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  
  return (
    <Container fluid> 
    {showFeeModal && <FeeModal itemData={data} accountId={accountId} closeModal={setFeeModal} onStatusChange={onStatusChange}/>}
    {renderModal()}
      {/* {renderFEEModal()} */}
      {renderDialog()}
        { 
        (value == 'Done') ? '' :
        <Timeline align="alternate">
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot color="secondary"  />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
        <Row style={styles.label}>
       <Card style={styles.cards}>
          <Card.Text
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              margin: 10,
            }}
          >
          <Avatar src={image} style={styles.avatar} />
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }} onClick={() => props.onClick()}>
              <span
                style={{
                  paddingLeft: 10,
                  fontWeight: "bold",
                  color: "#e0004d",
                }}
              >
                {titleCase(data.patient.name)}
              </span>
              <span style={{ paddingLeft: 10, color: "black" }}>
                {" "}
                Age: {years} &nbsp; Gender: {titleCase(data.patient.gender)}
              </span>
              <span style={{ paddingLeft: 10 }}>
                Appointment Time: {getTime(appointment_Time)}
              </span>
            </div>
            { (value == 'Checked In') ?  
            <span
            style={{
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "#e0004d",
              padding: "2px",
              color: "#e0004d",
              height:'25px'
            }}
            >
            <label style={{cursor:"pointer"}} onClick={handleClickOpen}> cancelled </label>
          </span> :
            
            <span
            style={{
              display:'',
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "#e0004d",
              padding: "2px",
              color: "#e0004d",
              height:'25px'
            }}
            >
                {data.appointment_status}
              </span>        
              }
          
          </Card.Text>
          { (value == 'Checked In') ?
          <footer style={{ display: "flex", flex: 1, flexDirection: "row" }}> 
              <input
                style={styles.reschedule_btn}
                onClick={(e) => {
                  handleReschedule();
                  e.stopPropagation();
                  availableSlots(data.doctors_hospital_location_id, date);
                }}
                type="button"
                value="Reschedule"
              >
              </input>
              <input
                style={styles.checkIn_btn}
                onClick={(e) => {
                  onStatusChange();
                  e.stopPropagation();
                }}
                type="button"
                value={value}
              ></input>
          </footer>
          :
          <footer className="text-center"> 
          <input
            style={styles.checkIn_btn}
            onClick={(e) => {
              // onStatusChange();
              setFeeModal(true);
              e.stopPropagation();
            }}
            type="button"
            value={value}
          ></input>
      </footer>
}
        </Card>      
      </Row>  
      </TimelineContent>
      </TimelineItem>
      </Timeline>}
      
    </Container>
  );
};

export default AppointmentsList;

const styles = {
  label: {
    fontSize: 13,
    color: "grey",
    textAlign: "Left",
    marginLeft: "10px",
    marginTop: "10px",
  },
  input: { fontSize: 14, padding: 8, borderRadius: "5px" },
  header_container: {display: "flex", flexDirection: "row", padding: 10, alignItems:"center"},
  avatar: { height:"55px", width:"55px", borderWidth: 0.3, borderColor: "#e0004d", borderStyle: "solid"},
  title_container: {display: "flex", flexDirection: "column", textAlign: "left", marginLeft: 10},
  title__name: {color: "#e0004d", fontSize: 18, fontWeight: "bold"},
  title__label: {color: "#00000081", fontSize:14, marginTop:-5},
  reschedule_btn: {
    background: "#A1EBA2",
    color: "#096A0B ",
    height: "35px",
    borderRadius: "6px",
    border: "#91DB92",
    margin: "10px",
    marginLeft: "20px",
    width: "130px",
    textAlign: "center",
    fontSize:'14px',
    padding:'5px'
  },
  checkIn_btn: {
    background: "#9EEAE8 ",
    color: "#096967",
    height: "35px",
    borderRadius: "6px",
    border: "#8EDAD8",
    marginLeft: "20px",
    margin: "10px",
    width: "130px",
    fontSize:'14px',
    padding:'5px'
  },
  cards: {
    backgroundColor: "#f9f9f9",
    width: "330px",
  },

};

AppointmentsList.defaultProps = {
  SuggestionList:[
    {
      id: 1,
      discount_reason: "Doctor Family Discount"
    },
    {
      id: 3,
      discount_reason: "Regular Patient"
    }
  ],
};

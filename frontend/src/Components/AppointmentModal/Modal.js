import React,{ useState,Fragment,useContext,useEffect } from 'react';
import {Modal,Row,Col} from 'react-bootstrap';
import { Avatar, Divider, } from "@material-ui/core";
import moment from 'moment';
import { getDatetoSet,setSlot} from '../../Hooks/TimeHandling'
import LocationDropdown from '../LocationDropdown';
import AvailableSlots from '../AvailableSlots';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Calender from "react-calendar";
import { Form,Button,message } from 'antd';
import AppointmentMethods from '../AppointmentMethods';
import {rescheduleAppointmentAPI,scheduleFollowupAPI,addAppointmentAPI} from '../../Hooks/API';
import {GlobalContext} from '../../Context/GlobalState'


const AppointmentModal=(props)=>{
    const {accountId,accountType,elementDocId} = useContext(GlobalContext);
    const displayFunction=props.displayFunction;
    const appointmentID = props.appointmentID;
    const patientId=props.id;
    const [myLocation,setMyLocation] = useState(props.itemData.doctors_hospital_location_id);
    const [open, setOpen] = useState(false);
    const [openFollowup, setOpenFollowup] = useState(false);
    const [openReschedule, setOpenReschedule] = useState(false);
    const [timeSlot,setTimeSlot] = useState("");
    const [enableBtn, setEnableBtn] = useState(false);
    const [date, setDate] = useState('');
    const [disabledDays, setDisabledDays] = useState([
        {day_of_week: "monday", is_open: false, start_time:'', end_time:''},
        {day_of_week: "tuesday", is_open:  false,start_time:'', end_time:''},
        {day_of_week: "wednesday", is_open:  false,start_time:'', end_time:''},
        {day_of_week: "thursday", is_open:  false, start_time:'', end_time:''},
        {day_of_week: "friday", is_open:  false, start_time:'', end_time:''},
        {day_of_week: "saturday", is_open:  false, start_time:'', end_time:''},
        {day_of_week: "sunday", is_open:  false, start_time:'', end_time:''}
    ]);
    const [docAppointmentType,setDocAppointmentType]=useState(props.itemData.appointment_type);
    const [appointmentTypeSelected,SetAppointmentTypeSelected] = useState(props.itemData.appointment_type === "both" ? "inperson" : props.itemData.appointment_type );
    const [error, setError] = useState(false);

    const displayTitle = (displayFunction === "new") && 'New Appointment' ||
    (displayFunction === "followup") && 'Schedule Followup' ||
    (displayFunction === "reschedule") && 'Reschedule';
    
    function onPanelChange(value, mode) {
        console.log(value, mode);
      }

      useEffect(() => {
        if(
            (myLocation !== "") && 
            (timeSlot !== "") && 
            (appointmentTypeSelected !== "" ) &&
            (date !== "")){
            setEnableBtn(true);         
        }
       
      }, [myLocation,timeSlot,appointmentTypeSelected,date]);

    const handleConfirmReschedule = () => {
        if(
            (myLocation !== "") && 
            (timeSlot !== "") && 
            (appointmentTypeSelected !== "" ) &&
            (date !== "")){
            setOpenReschedule(true);         
        }
        else {
            setError(true)  
            message.error('Please select all fields first')
        }
        
      };

      const handleConfirmFollowUp = () => {   
        if(
            (myLocation !== "") && 
            (timeSlot !== "") && 
            (appointmentTypeSelected !== "" ) &&
            (date !== "")){
            setOpenFollowup(true);         
        }
        else {
            setError(true)  
            message.error('Please select all fields first')
        }

      };

      const handleAddAppointment = () =>{
        console.log("location id : ",myLocation, "time ", patientId, setSlot(timeSlot), " patAppointmentType ", appointmentTypeSelected," date",getDatetoSet(date));
        if(
            (myLocation !== "") && 
            (timeSlot !== "") && 
            (appointmentTypeSelected !== "" ) &&
            (date !== "")){
            setOpen(true);         
        }
        else {
            setError(true) 
            message.error('Please select all fields first')
        }
    };
  
    function titleCase(str) {
        return str.toLowerCase().split(' ').map(function(word) {
            return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
    }

    const onChange = (date) => {
        setDate(date);
        console.log("my date ",date);
    };
    
    const collectDisabledDays = (docSchedule, index) => {
        setDisabledDays([
            {day_of_week: "monday", is_open: false, start_time:'', end_time:''},
            {day_of_week: "tuesday", is_open:  false,start_time:'', end_time:''},
            {day_of_week: "wednesday", is_open:  false,start_time:'', end_time:''},
            {day_of_week: "thursday", is_open:  false, start_time:'', end_time:''},
            {day_of_week: "friday", is_open:  false, start_time:'', end_time:''},
            {day_of_week: "saturday", is_open:  false, start_time:'', end_time:''},
            {day_of_week: "sunday", is_open:  false, start_time:'', end_time:''}
        ]);
        let a = [];
        
        disabledDays.forEach(day => {
            let valueItem = "";
            docSchedule.map(item => {
                if(day.day_of_week === item.day_of_week)
                    valueItem = item;
            })
            if(valueItem === "")
                valueItem = {day_of_week: day.day_of_week, is_open: false, start_time:'', end_time:''};
            
            a.push(valueItem)
        })

        setDisabledDays(a);
    };
     //Dialog Functions
     const handleClose = () => {
        setOpen(false);
        setOpenFollowup(false);
        setOpenReschedule(false);
      };

       //onClickedAgree
       const handleAgree=()=>{
           console.log('creating appointment results are', elementDocId,myLocation,patientId,0,"POST",accountType,elementDocId,getDatetoSet(date),setSlot(timeSlot),appointmentTypeSelected)


           addAppointmentAPI(elementDocId,myLocation,patientId,0,"POST","doctor",elementDocId,getDatetoSet(date),setSlot(timeSlot),appointmentTypeSelected).then((result)=>{
            console.log('Succesfully created',result);
            props.hide();
            setOpen(false);
            if(result === "New Appointment Inserted Successfully!") {
                message.success('Appointment created succesfully')
            }
            else{
                message.error("Appointment not created")
            }
           
        });
    }

    //onClickedFollowup
    const handleFollowup=(appointment_ID)=>{
        console.log(
            "this is happening appointment ID ",
            appointment_ID,
            "location id : ",
            myLocation,
            "time ",
            timeSlot,
            " date ",
            getDatetoSet(date),
            " appointment_type ",
            appointmentTypeSelected
          );
        scheduleFollowupAPI(elementDocId,myLocation,props.patient_id,appointment_ID,"POST","doctor",elementDocId,getDatetoSet(date),setSlot(timeSlot),appointmentTypeSelected
        ).then((result) => {
            props.hide();
            setOpenFollowup(false);
        });
        
     }

     //onClickReschedule 
     const Reschedule = (appointment_ID) =>{
        rescheduleAppointmentAPI(
            elementDocId,myLocation,props.patient_id,
            appointment_ID,
            "PUT","doctor",
            elementDocId,
            getDatetoSet(date),
            setSlot(timeSlot),
            appointmentTypeSelected
          ).then((result) => {
              props.callback(0,0)
              props.hide();
          });
          

     }
     const returnTimeSlot=(slotValue)=>{
        setTimeSlot(slotValue);
        let newSlot = moment(slotValue,"h:mm").utc().format("HH:mm a")
        console.log('slotValue onClick return', slotValue, moment(slotValue,"H:mm A").utc().format("H:mm A"))
     }

    const modalHead=()=>{
        return(
            <Fragment>
                <div style={styles.header_container}>
                    <Avatar src={props.image} style={styles.avatar}/>   
                    <div style={styles.title_container}>
                    <div style={styles.title__name}>  {!!props.Name && titleCase(props.Name)}</div>
                    {displayFunction === "new" && 
                        (<Fragment>
                            <div style={styles.title__label} > {props.status? props.status:'New Appointment'} </div>
                        </Fragment>)
                     ||displayFunction === "followup" && (<div style={styles.title__label}>Current Time: {props.time}</div> )
                     ||displayFunction === "reschedule" && (<div style={styles.title__label}>Current Time: {props.time}</div>)}
                    </div>
                </div>
            </Fragment>
        )
    }
    const renderCalendar=()=>{
        return(
            <Calender
            minDate={new Date()}
            maxDate={new Date(moment().add(3, "months"))}
            tileDisabled={({ date, view }) =>
              view === "month" && // Block day tiles only
              disabledDays.some(
                (disabledDay) => {
                    console.log("disable day format : ",disabledDays[date.getUTCDay()].is_open," of ", date.getUTCDay(), "on", date.getDate(), "and", disabledDay)
                    // date.getDay() === disabledDay
                    return !(disabledDays[date.getUTCDay()].is_open)
                }
              )
            }
            onChange={onChange}
            value={date}
          />
        )
    }

    return(
        <Modal
            show={props.show}
            onHide={props.hide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
                <Modal.Header closeButton>
                    <Modal.Title className='ModalTitle'>
                        {displayTitle}
                    </Modal.Title>
                </Modal.Header>
            <Form>
            <Modal.Body>
                {modalHead()}
                <Divider className='AppointmentDivder'/>
                <LocationDropdown returnHook={setMyLocation} defaultLoc={myLocation} disableDays={collectDisabledDays} 
                 defaultDocType={docAppointmentType} returnDocType={setDocAppointmentType} />
                <Divider className='AppointmentDivder'/>
               
                <div className='SelectBox'>
                 <h6 className='optionHeading'>Appointment Type </h6> 
                   <AppointmentMethods displayMode={"choice"} methodsValue={docAppointmentType} methodsChoice={docAppointmentType} returnHook={SetAppointmentTypeSelected} style={{justifyContent: "flex-start", color: "#000000"}}/>
                    {error==true  && appointmentTypeSelected === '' ? <h6 style={{color: '#ff4d4f',fontSize:'12px'}}> Select appointment type </h6> : ''}
                </div>
                <Divider className='AppointmentDivder'/>
                <Row className='mtt-20'>
                    <Col lg={6} className='ModalCalendar'>
                    {error==true  && date === '' ? <h6 style={{color: '#ff4d4f',fontSize:'12px'}}> Select appointment date </h6> : ''}
                            {renderCalendar()}
                    </Col>
                    <Col lg={6}>

                    { error==true  && timeSlot === '' ? <h6 style={{color: '#ff4d4f',fontSize:'12px'}}> Select appointment time </h6> : ''}
                        <AvailableSlots locationID={myLocation} date={date} returnTimeSlot={returnTimeSlot} defaultTimeSlot={timeSlot}/> 
                    </Col>
                    </Row>
            </Modal.Body>
            <Modal.Footer>
            <Button
                variant="outline-secondary"
                onClick={props.hide}
                style={{ marginLeft: "10px" }}>
                   Cancel
            </Button>
            {displayFunction === "new" && 
             (<Button
                disabled={enableBtn === false}
                type='primary'
                htmlType="submit"
                // disabled={error && true}
                onClick={()=> handleAddAppointment()}>
                Add Appointment
                </Button>) ||
            displayFunction === "followup" &&  
                (<Button
                type="primary"
                disabled={enableBtn === false}
                htmlType="submit"
                onClick={()=> handleConfirmFollowUp(appointmentID)}>
                Confirm Followup </Button> ) ||
            displayFunction === "reschedule" &&  
                (<Button
                disabled={enableBtn === false}
                type="primary"
                onClick={()=> handleConfirmReschedule()}>
                Confirm Reschedule </Button>)}
           
            </Modal.Footer>

           {/* Adding Dialog */}
            <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">{"Are you sure you want to add an appointment?"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You are trying to add an appointment of patient <b> {!!props.Name && titleCase(props.Name)}</b> at {timeSlot} 
            </DialogContentText>
          </DialogContent>
          <DialogActions>
              <Button autoFocus onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleAgree} color="primary" autoFocus>
                Yes
              </Button>
          </DialogActions>
      </Dialog>
          
            {/* Followup Dialog */}
            <Dialog
                open={openFollowup}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
                >
                <DialogTitle id="responsive-dialog-title">{"Are you sure you want to schedule a followup?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    You are trying to schedule a followup of patient <b> {!!props.Name && titleCase(props.Name)}</b> at {timeSlot} 
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleFollowup(appointmentID)} color="primary" autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reschedule Dialog */}

            <Dialog
                open={openReschedule}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
                >
                <DialogTitle id="responsive-dialog-title">{"Are you sure you want to reschedule this appointment?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    You are trying to reschedule an appointment of patient <b> {!!props.Name && titleCase(props.Name)}</b> at {timeSlot} 
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => Reschedule(appointmentID)} color="primary" autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
       </Form>
        </Modal>
    )
}

export default AppointmentModal

AppointmentModal.defaultProps = {
    displayFunction: 'new',
    methodsValue: '',
    methodsChoice: '',
    itemData: {
        doctors_hospital_location_id: '',
        appointment_type: ''
    },
    callback : () => {}
}

const styles = {
    header_container: {display: "flex", flexDirection: "row", padding: 10, alignItems:"center"},
    avatar: { height:"55px", width:"55px", borderWidth: 0.3, borderColor: "#e0004d", borderStyle: "solid"},
    title_container: {display: "flex", flexDirection: "column", textAlign: "left", marginLeft: 10},
    title__name: {color: "#e0004d", fontSize: 18, fontWeight: "bold"},
    title__label: {color: "#00000081", fontSize:14, marginTop:-5},
};
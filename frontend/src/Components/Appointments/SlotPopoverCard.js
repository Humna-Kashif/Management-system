import React, { useEffect, useState, useContext } from "react"
import "../../Styles/Card.scss"
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import { Button } from 'antd';
import { appointmentStatusAPI,cancelAppointment } from "../../Hooks/API";
import { useLocation } from "react-router-dom";
import { Avatar, Divider } from "@material-ui/core";
import moment from 'moment';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import AppointmentMethods from "../AppointmentMethods";
import RestoreIcon from '@material-ui/icons/Restore';
import {GlobalContext} from '../../Context/GlobalState'
import { Tooltip } from 'antd';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FeeModal from "../AppointmentModal/FeeModal";
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import AppointmentModal from "../AppointmentModal/Modal";
import AddVitals from "../Vitals/AddVitals";

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


const SlotPopoverCard = (props) => {
    const {accountId,accountType} = useContext(GlobalContext);
    const doc_ID = useLocation().state.userId;
    const [show,setShow] = useState(false)
    const itemData = props.itemData;
    console.log('Appointment Data results are', props.itemData)
    const patientData = props.itemData.patient;
    const status = props.itemData.appointment_status;
    const [feeModal, setFeeModal] = useState(false);
    const [openDialog, setOpenDialog] =useState(false);
    const [alertDialog, setAlertDialog] = useState(false);
    const [showModal,setShowModal]=useState(false);
    const [addVitals, setAddVitals] = useState(false)

    const showVitalModal = () =>{
      setAddVitals(true)
    }
    const hideModal = () =>{
        setAddVitals(false)
    }


    useEffect(() => setTimeout(() => {
        setShow(true)
    }, 50) , [props.val])

    const onHandleClose = () => {
        props.closeHandler(false)
    }

    const onValueChange = (statusVal) => {
        console.log("Checking onValue Change")
        if (statusVal === "upcoming") {
          return "Check In";
        } else if (statusVal === "waiting") {
          return "Start";
        } else if (statusVal === "hold"){
          return "Continue"
        }else
        return "Done"
      };

    // const [value, setValue] = useState(onValueChange(props.itemData.appointment_status));
    const value = onValueChange(props.itemData.appointment_status);

    const changeAppointmentStatusApi = (key,value) => {
        appointmentStatusAPI(doc_ID,0,props.itemData.patient.patient_id,key,"PUT","doctor",accountId,value).then(result=>{  
            if(value==="inprogress"){
              props.autoOpen(key);
            }
            console.log("complete status is:", result)
            props.refreshList();
            props.closeHandler(false)
          })
    }
    

    const onStatusChange = () => {
        if (value === "Check In") {
          handleModalClose();
          setFeeModal(true);
        } else if (value === "Start" || value === "Continue") {
            console.log("Active lists popover", props.currentlyActive)
          let ActiveExist = [];
          if(!!props.currentlyActive)
          ActiveExist = props.currentlyActive.filter(item => item.patientinfo.patient_id === props.itemData.patient.patient_id )
          console.log("Already Active: ", ActiveExist.length===0, "val", ActiveExist, "data: ", props.itemData)
          if(ActiveExist.length===0 ){
            changeAppointmentStatusApi(props.itemData.appointment_id,"inprogress");
            // if (itemData.appointment_type==='telehealth'){
            //   localStorage.setItem('link',meetingLink)
            //   setMeetingLink(meetingLink)
            //   localStorage.setItem('meetId',idsubArray[0])
            //   setMeetingId(idsubArray[0])
            //   localStorage.setItem('password',password[1])
            //   setMeetingPwd(password[1])
            //   // window.open('/ZoomMeet', "_blank")
            // }
          }
        
          else
            setAlertDialog(true)
        } else {
          changeAppointmentStatusApi(props.itemData.appointment_id, "cancelled");
        }
        console.log("Checking status: ", value, " of", status)
        console.log("Checking onStatus Change")
      };

      const renderAlertDialog=()=>{
        console.log("Checking render dialog")
        if (alertDialog)
        return(
          <Dialog
          open={alertDialog}
          onClose={() => setAlertDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          >
        <DialogTitle id="alert-dialog-title">{`Same Patient Alert`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`${props.itemData.patient.name}'s another appointment is currently open, Please completed it to start this appointment`} 
          </DialogContentText>
        </DialogContent>
        <Divider/>
        <DialogActions>
          <Button onClick={() => setAlertDialog(false)} color="default">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      )
      else
        return ""
    }

    const renderDialog=()=>{
        console.log("Checking render dialog")
        if (openDialog)
        return(
          <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
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
          <Button onClick={() => setOpenDialog(false)} color="default">
           No
          </Button>
          <Button onClick={handleCancelledAppointment} color="secondary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      )
      else
       return ""
    }

    const handleFeeCloseModal = () => {
        console.log("Checking handleFeeClose")
        // changeAppointmentStatusApi(props.itemData.appointment_id, "waiting");
        setFeeModal(false);
      };

    const handleFeeConfirmed = (feeAdded) => {
      console.log("Fee is Added", feeAdded)
      if (feeAdded){
        changeAppointmentStatusApi(props.itemData.appointment_id, "waiting");
        setFeeModal(false);
      }else{
        setFeeModal(false);
      }
    }

      const handleCancelledAppointment = () =>{
        console.log("Checking cancel Appointment")
        cancelAppointment(accountId,props.itemData.patient.patient_id,props.itemData.appointment_id,accountId,"doctor").then((result)=>{
          console.log('Appointment Cancelled', result )
          setOpenDialog(false);
          changeAppointmentStatusApi(props.itemData.appointment_id, "cancelled");
          //   if(result){
          //       setLocationList(result);
             
          //   }
        })

       
      }

    const renderFeeModal =  () => {
        if (feeModal) 
            return ""
        else
            return ""
    }

    const handleModalClose = () => {
      console.log("Checking handleCloseModal")
      setShowModal(false);
    };
      
    return (
        <div 
            style={{...props.style}}
            onClick={(e) => e.stopPropagation()}
            className={show ? "popcard__container popcard--show" : "popcard__container"}>
            {renderDialog()}
            {renderAlertDialog()}
            {renderFeeModal()}
            <AppointmentModal show={showModal} hide={handleModalClose} displayFunction={'reschedule'} 
            Name={patientData.name} appointmentID={props.itemData.appointment_id} 
            itemData={props.itemData} callback={props.refreshList}/>
            <FeeModal show={feeModal} itemData={props.itemData} doc_ID={props.itemData.doctor_id} closeModal={handleFeeCloseModal} feeAdded={handleFeeConfirmed} />
            <div style={{display: "flex", justifyContent: "flex-end", flexDirection: "row", padding: 5}}>
                {/* <Tooltip title={"Reset"} placement="bottom" trigger="hover">
                    <IconButton style={styles.closeBtn} >
                        <ReplayIcon onClick={() => changeAppointmentStatusApi(itemData.appointment_id,"upcoming")} fontSize="small"/>
                    </IconButton>
                </Tooltip> */}
                { itemData.appointment_status !== "completed" &&
                  itemData.appointment_status !== "waiting" &&
                  itemData.appointment_status !== "inprogress" &&
                  <Tooltip title={"Reschedule"} placement="bottom" trigger="hover">
                    <IconButton style={styles.closeBtn} >
                        <RestoreIcon onClick={() => setShowModal(true)} fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                }
                { !(moment(itemData.date_time).diff(new Date().setHours(0,0,0,0)) < 0) &&
                  itemData.appointment_status === "upcoming" &&
                  <Tooltip title={"Cancel Appointment"} placement="bottom" trigger="hover">
                    <IconButton style={styles.closeBtn} >
                        <DeleteOutlineIcon onClick={() => setOpenDialog(true)} fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                }
                <Tooltip title={"Close"} placement="bottom" trigger="hover">
                    <IconButton onClick={onHandleClose} style={styles.closeBtn} >
                        <ClearIcon onClick={onHandleClose} fontSize="small"/>
                    </IconButton>
                </Tooltip>
            </div>
            <div style={{display: "flex", flexDirection: "row", padding: 16,paddingTop: 0, alignItems: "center"}}>
                <Avatar src={props.patientImage} style={styles.avatar} />
                <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1}}>
                    <div
                        style={{
                            paddingLeft: 10,
                            fontSize: 22,
                            fontWeight: "lighter",
                            color: "#e0004d",
                        }}
                        >
                        {titleCase(patientData.name)}
                    </div>
                    <div style={{ paddingLeft: 10, color: "#0000007f", fontWeight: 'bold', fontSize: 12 }}>
                        {moment().diff(patientData.dob,'years')}  Years ({titleCase(patientData.gender)})
                    </div>
                </div>
            </div>
            <div style={{ paddingLeft: 24,paddingTop: 18, display: "flex", flexDirection: "row", color: "#0000007f"}}>
                <CalendarTodayIcon fontSize="small" style={{marginRight: 16}}/> {moment(itemData.date_time).utc().format("dddd, MMM DD, YYYY")} 
            </div>
            <div style={{ paddingLeft: 24,paddingTop: 6, display: "flex", flexDirection: "row", color: "#0000007f"}}>
                <AccessTimeIcon fontSize="small" style={{marginRight: 16}}/> 
                {/* {moment(itemData.date_time).utc().format("MMM DD hh:mm A")} and 
                {moment(itemData.date_time).format("MMM DD hh:mm A")} and  */}
                {moment(itemData.date_time).local().format("MMM DD hh:mm A")}
            </div>
            <div style={{ paddingLeft: 24,paddingTop: 6, display: "flex", flexDirection: "row", color: "#0000007f"}}>
                <AppointmentMethods displayMode={"view"} methodsValue={itemData.appointment_type} style={{justifyContent: "flex-start", color: "#000000"}}/>
            </div>
            {/* <div style={{height: 50}}>
              {moment(new Date(itemData.date_time).setHours(0,0,0,0)).local().format("MMM DD hh:mm A")}
            </div>
            <div style={{height: 50}}>
              {moment(new Date().setHours(0,0,0,0)).local().format("MMM DD hh:mm A")}

            </div>
            <div style={{height: 50}}>
            {moment(itemData.date_time).diff(new Date().setHours(0,0,0,0))} and {moment(itemData.date_time).diff(itemData.date_time)} and {moment(new Date()).diff(itemData.date_time)}
            

            </div>
            <div style={{height: 50}}>
              {itemData.appointment_status}

            </div> */}
            <div style={{height: 50}}>

            </div>
            
            {/* <Button onClick={() => changeAppointmentStatusApi(itemData.appointment_id,"inprogress")} type='primary' 
                style={{marginRight: 10, marginBottom: 10, bottom: 0, position: "absolute", right: 0, minWidth: 100}}>
               Start
            </Button> */}
            {/* {(props.itemData.appointment_status === 'waiting' && itemData.appointment_type==='telehealth') ? 
            
           <Button danger onClick={()=> window.open('/ZoomMeet', "_blank")}
           style={{marginRight: 10, marginBottom: 10, bottom: 0, position: "absolute", right: 108, minWidth: 100}}>
              Join Meeting
           </Button> : ''} */}
           {((accountType === 'fd' || accountType === 'nurses' || accountType === 'pa') && props.itemData.appointment_status === 'waiting') &&
           <Button danger onClick={showVitalModal}
           style={{marginRight: 10, marginBottom: 10, bottom: 0, position: "absolute", right: 108, minWidth: 100}}>
              Add Vitals
           </Button>
           }
            {
                   (moment(itemData.date_time).utc().format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD'))  ? 
                    value !== "Done" &&
                    <Button onClick={() => onStatusChange()} type='primary' 
                        style={{marginRight: 10, marginBottom: 10, bottom: 0, position: "absolute", right: 0, minWidth: 100}}>
                        {value}
                    </Button>
                    : 
                    <div></div>
                  }

                  <AddVitals show={addVitals} hide={hideModal} patientID={props.itemData.patient.patient_id} onCallBAck={handleModalClose}/>
        </div>
    )
}

export default SlotPopoverCard

SlotPopoverCard.defaultProps = {
    val: false,
    closeHandler: () => {},
    refreshList: () => {},
    patientImage: "",
    style: {},
    autoOpen: () => {}
}

const styles = {
    closeBtn: {
        fontSize: 12,
        color: "#000000a1"
    },
    avatar: { height:"40px", width:"40px", borderWidth: 0.3, borderColor: "#e0004d", borderStyle: "solid"},
}
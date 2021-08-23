import React, { useCallback, useContext, useEffect, useState} from "react"
import { Col, Container, Row } from "react-bootstrap";
import HistoryPatientItem from "./HistoryPatientItem";
import HistoryPatientDetail from "./HistoryPatientDetail";
import {getPatientCompletedAppoinmtmentProfileAPI,getAllAppointmentsWithTrail, initiateEditAppointment} from "../Hooks/API"
import Empty from '../Styles/Assets/empty.png';
import SidePanelContainer, { SidePanelHeader } from "./Appointments/SidePanelContainer";
import { GlobalContext } from "../Context/GlobalState";
import HistoryTrailItem from "./HistoryTrails/HistoryTrailItem";
import { getDate, getTime } from "../Hooks/TimeHandling";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import CurrentTabPatient from "./CurrentTabPatient";
import PatientInfoSection from "./Appointments/PatientInfoSection";

const HistoryTabPatient = (props) => {
    const pat_ID = props.patientID;
    const appointment_id = props.id;
    const {accountId,elementDocId} = useContext(GlobalContext)
    // console.log("Data from back side is ",pat_ID);
    const [completedAppointments , setCompletedAppointments] = useState([]);
    const [showTrail, setShowTrail] = useState(true);
    const [clickedItem,setClickedItem] = useState();
    const [selectedHistory, setSelectedHistory] = useState(0);
    const [sidePanel,setSidePanel] = useState(false);
    const [sideEditPanel,setSideEditPanel] = useState(false);
    const [selectedPanelData, setSelectedPanelData] = useState("");
    const [validationVal,setValidationVal] = useState([]);
    const [Val,setVal] = useState(false);
    const [editOfAppointment,setEditOfAppointment] = useState();
    
    const [trailList, setTrailList] = useState([]);

    const validationCallback = (id, value, msg) => {
        console.log("validation callback: start ", validationVal, "copy", !!validationVal[0] && (74 in validationVal[0]), validationVal.hasOwnProperty(74))
  
        let valArray = validationVal.slice(0);
        let addIndex = -1;
        if(!value){
          valArray.map((item, i) => {
            if(id in item){
              addIndex = i;
            }
          })
          addIndex === -1 ? valArray.push({[id] : msg}) : valArray.splice(addIndex, 1, {[id] : msg})
          // if (!(id in validationVal)) {
          //   valArray.push({[id] : msg});
          // }
        }else{
          
            valArray.map((val,i) => id in val && valArray.splice(i, 1))
          
        }
  
        console.log("validation callback: ", value, "id", id, "array", valArray)
        setValidationVal(valArray)
        setVal(value)
        console.log("validation callback: start ", validationVal)
  
      }  

    const handleCompletedAppointmentProfileItem = useCallback((item) =>{
        setSidePanel(true);
        console.log("appointmentclicked",item.appointment_id)
        setSelectedHistory(item.appointment_id);
        getPatientCompletedAppoinmtmentProfileAPI(elementDocId,0,pat_ID,item.appointment_id)
        .then(result => {
            console.log("patient info api clicked Result",result);
            // setClickedItem(result[0]);
        });   
    },[elementDocId,pat_ID])

    const getPatientCompletedAppoinmtmentHistory = useCallback(() =>{
        console.log("Appointment Trails: ",pat_ID)
        getAllAppointmentsWithTrail(pat_ID,0).then(
            result => {
               if(!!result){
                console.log("Appointment Trails: ",pat_ID, result)
                setTrailList(!!result && result.reverse());
               }
                
            }
        )
        // getPatientCompletedAppoinmtmentHistoryAPI(0,0,pat_ID,"GET").then(result => {
        //     console.log("completed Appointments history tab",result);
        //     console.log('Appointmentmmmmmm result',result.appointment_id);
        //     if (result.length !== 0) {
        //         setCompletedAppointments(result.reverse());
        //         handleCompletedAppointmentProfileItem(result[0])
        //         setSidePanel(false);
        //     }
        // });
    },[elementDocId,pat_ID,handleCompletedAppointmentProfileItem])
   
    const [itemTrailData, setItemTrailData] = useState({});

    const onTrailItemSelected = (trailData, trailItem) => {
        console.log("Trails Item Id is ",trailData, trailItem)
        setClickedItem(trailItem)
        setItemTrailData(trailData)
        // handleCompletedAppointmentProfileItem(trailItem.appointment_id)
        setSidePanel(true);

    }

    const renderTrailList = () => {
        if(itemTrailData !== {} && !!itemTrailData.followups)
        return itemTrailData.followups.length > 1 && (
              <div style={{...styles.item_container_bg, position: "sticky", top: 200}} >
                <div style={
                    itemTrailData.followups[0].appointment_id === clickedItem.appointment_id ? 
                    {...styles.main_item_selected,...styles.selected_trail_item}:
                    styles.main_item_selected
                    } onClick={() => setClickedItem(itemTrailData.followups[0])}> 
                        <h6 style={styles.dateLabel}> {getDate(itemTrailData.followups[0].date_time_of_appointment)} </h6> 
                        <h6 style={styles.timeLabel}> {getTime(itemTrailData.followups[0].date_time_of_appointment)} </h6>
                        {
                        itemTrailData.followups.length > 1 &&
                        <div style={{ color: "#e0004d", cursor: "pointer", textAlign: "right" }} onClick={(e) => {
                        setShowTrail(!showTrail); e.stopPropagation();
                            }}>
                        {showTrail ? <div style={{fontSize:'12px'}}>Hide Trail<BsChevronUp /></div> : <div style={{fontSize:'12px'}}>Follow-up Trail<BsChevronDown /></div>}</div>
        }

                </div>
              {
                 showTrail && itemTrailData.followups.map( (item, key) => 
                    key !==0 &&
                    <div style={
                        item.appointment_id === clickedItem.appointment_id ?  
                        {...styles.trail_item,...styles.selected_trail_item} :
                        styles.trail_item 
                        } onClick={() => setClickedItem(item)}> 
                       <h6 style={styles.dateLabel}> {getDate(item.date_time_of_appointment)} </h6>
                       <h6 style={styles.timeLabelSm}> {getTime(item.date_time_of_appointment)} </h6>
                    </div>
                    )
              }
            </div>
            )
        else
        return "no value"

      }

      const [confirmEdit, setConfirmEdit] = useState(false)
    
      const showSideEditPanel = () => {
        return (
            !!selectedPanelData && selectedPanelData!=="" &&
            <SidePanelContainer deleteAble show={sideEditPanel} closeHandler={setSideEditPanel} appointmentId={selectedPanelData.appointment_id}>
                <SidePanelHeader 
                editing
                confirmEdit={confirmEdit}
                itemData={selectedPanelData} 
                refreshList={getPatientCompletedAppoinmtmentHistory}
                closeHandler={setSideEditPanel}
                validation={validationVal} values={Val}/>
                <Container fluid>
                    <Row>
                        {/* Controls */}
                        <Col lg={6} style={{backgroundColor: "none"}}>    
                            <CurrentTabPatient 
                                editing
                                setConfirmEditing={setConfirmEdit}
                                copyingData={editOfAppointment}
                                patientId={selectedPanelData.patientinfo.patient_id} 
                                appointmentId={selectedPanelData.appointment_id}
                                appointment_type={selectedPanelData.appointment_type}
                                validation={validationCallback}
                                />
                        </Col>
                        {/* History */}
                        {/* {selectedPanelData.patientinfo.name} */}
                        <Col lg={6} style={{maxHeight: "85vh", backgroundColor: "none", overflowY: "scroll"}}>   
                            <PatientInfoSection patientID={selectedPanelData.patientinfo.patient_id}/> 
                            {/* <ActiveAppointment id={1}/> */}
                        </Col>
                    </Row>
                </Container>
            </SidePanelContainer>
        )
    }

    const handleEnableEdit = (editOfAppointmentData) => {
        // setSelectedPanelData(editResponse);
        console.log("on Edit Click Appointment ID", editOfAppointmentData.appointment_id)
        // setSideEditPanel(true);
        initiateEditAppointment(editOfAppointmentData.appointment_id).then(
            result => {
                console.log("on Edit Click Appointment Result", result)
                if(!result.error){
                    console.log("on Edit Click Appointment Result OPen", result)
                    setEditOfAppointment(editOfAppointmentData);
                    setSelectedPanelData(result[0])
                    setSideEditPanel(true);
                }
            }
        )
    }
    

    const showHistory = (value) =>{
        if(value.length === 0)
            return (
                <div className ='text-center'> 
                <img src={Empty} className='EmptyImg' alt='no details' style={{marginBottom:20}}/>
                <div> 
                    <label className='EmptyLabel'> No Details Found </label>
                </div>
                </div>
            )
        else
            return(
                <Row>
                    <Col>
                        <div className='PreviousHistory'>
                            {/* <div className='HistList-Container' >
                                <div className='scrollbox '> */}
                            {/* {renderHistoryList()} */}
                            {trailList.map( (item,i) => <HistoryTrailItem trailData={item} key={i} onSelectItem={onTrailItemSelected}/>)}
                        </div>
                    </Col>
                    <SidePanelContainer show={sidePanel} closeHandler={setSidePanel} style={{maxWidth: 1000}}>
                    <SidePanelHeader appointmentPanel itemData={!!itemTrailData.followups && itemTrailData.followups[0]} enableEdit={handleEnableEdit}/>
                            <div style={{display: "flex", flexDirection: "row"}}>
                                <div style={{position: "relative"}}>
                                    {renderTrailList()}
                                </div>
                                    <Container fluid>
                                        <Col>
                                            {clickedItem ?
                                            <div style={itemTrailData.followups.length !== 1 ? {marginRight: 100} : {marginRight: 0}}>
                                                    <HistoryPatientDetail itemData={clickedItem} style={{maxWidth: 600}} itemTrailData={itemTrailData}/>
                                            </div>
                                            :
                                                <div className ='text-center'> 
                                                    <img src={Empty} className='EmptyImg' alt='no details' style={{marginBottom:20}}/>
                                                    <div>
                                                        <label className='EmptyLabel'> No Details Found </label>
                                                    </div>
                                                        
                                                </div>
                                            } 
                                        </Col>
                                    </Container>
                            </div>
                    </SidePanelContainer>
                    {showSideEditPanel()}
                </Row> 
            )
    }

    useEffect(() => {
        getPatientCompletedAppoinmtmentHistory();
    },[getPatientCompletedAppoinmtmentHistory]);

    const renderHistoryList = () => {
        return(
            completedAppointments.map((item,i)=>(
                <HistoryPatientItem 
                id={elementDocId} key={i} 
                itemData={item} 
                selected={item.appointment_id===selectedHistory} onClick={()=>handleCompletedAppointmentProfileItem(item)}/>
            ))
        )
    }

    return (
      <Container fluid style={{paddingTop: 10}}> 
        {showHistory(trailList)}
      </Container>
    )
}

export default HistoryTabPatient

const Colors = {
    primaryColor: "#e0004d",
    baseColorDarker2: "#e0e0e0"
  }

const styles = {
    textRight: {
      textAlign: "right",
    },
    section: { paddingTop: 5, paddingBottom: 5 },
    sectionHeading: { color: Colors.primaryColor, fontWeight: "bold", paddingLeft: 10, paddingTop: 10 },
    priscriptionsStyle: { fontWeight: "bold", paddingLeft: 10, paddingTop: 10 },
    timelineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primaryColor },
    avatar: { height: "50px", display: 'flex', width: "50px", borderWidth: 0.3, borderColor: "#e0004d", borderStyle: "solid" },
    main_item: {
      backgroundColor: "white",
      padding: 10,
      borderRadius: 10,
    },
    main_item_selected: {
      backgroundColor: "white",
      padding: 10,
      borderRadius: 10,
      marginBottom: 10,
      boxShadow: "#00000036 0px 2px 4px",
    },
    trail_item: {
        backgroundColor: "white",
        padding: 10,
        borderWidth: 1.6,
        borderStyle: "solid",
        borderColor: "#e0e0e0",
        borderRadius: 10,
        margin: 10,
    },
    item_container_bg: {
      backgroundColor: "#f0f0f0",
      borderWidth: 0.6,
      borderStyle: "solid",
      borderColor: "#e0e0e0",
      borderRadius: 10,
      margin: 15,
      marginRight: 0,
      marginLeft: 24,
      maxWidth: 400,
      minWidth:180
    },
    selected_trail_item: {
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "#e0004d",
      borderRadius: 10,
    },
    dateLabel:{
        textAlign: "right",
        fontSize: "14px",
        color: "grey",
    },
    timeLabel:{
        fontSize: "26px",
        fontWeight: "200",
        color: "#616161"
    },
    timeLabelSm:{
        fontSize: "22px",
        fontWeight: "200",
        color: "#616161"
    },
  }
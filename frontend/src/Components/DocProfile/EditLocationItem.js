import React, { useState ,useEffect, useContext} from "react"
import { Col, Row, Button } from "react-bootstrap";
import {TimePicker} from 'antd'
import {editLocationAPI,deleteLocationAPI} from "../../Hooks/API"
import {downloadFile} from '../../Hooks/ImageAPI'
import { Fragment } from "react";
import {message, Divider} from 'antd';
import BorderColorOutlinedIcon from '@material-ui/icons/BorderColorOutlined'
import { BsCheck, BsX,BsTrash } from "react-icons/bs";
import CheckBoxOutlineBlankRoundedIcon from '@material-ui/icons/CheckBoxOutlineBlankRounded';
import StopRoundedIcon from '@material-ui/icons/StopRounded';
import Checkbox from '@material-ui/core/Checkbox';import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Chip from '@material-ui/core/Chip';
import AppointmentMethods from "../AppointmentMethods";
import Avatar from 'antd/lib/avatar/avatar';
import moment from 'moment'
import { getTimeString,setTime} from '../../Hooks/TimeHandling'
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { GlobalContext } from "../../Context/GlobalState";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';

const EditLocationItemUi=(props)=>{

    const itemData = props.itemData;
    const itemSchedule = props.itemSchedule;
    const [onEdit, setOnEdit] = useState(false);
    const [feeValue,setFeeValue] = useState(itemData.fees);
    const [appointmentTypeValue, setAppointmentTypeValue]=useState(itemData.appointment_type);
    const [image, setImage] = useState(null);
    const [indeterminate, setIndeterminate] = useState(true);
    const [checkAll, setCheckAll] = useState(false);
    const [open, setOpen] = useState(false);
    const {accountId,accountType,elementDocId} = useContext(GlobalContext)
    const sorter = {
        "monday": 1,
        "tuesday": 2,
        "wednesday": 3,
        "thursday": 4,
        "friday": 5,
        "saturday": 6,
        "sunday": 7
      };
      let DayData = itemSchedule.sort(function sortByDay(a, b) {
        let day1 = a.day_of_week.toLowerCase();
        let day2 = b.day_of_week.toLowerCase();
        return sorter[day1] - sorter[day2];
        })

        console.log('Updated schedule data is',  DayData)
    const intializeSchedule = () =>{
        const initialValue = [
            {day_of_week: "monday", is_open: false, start_time:'', end_time:''},
            {day_of_week: "tuesday", is_open: false,start_time:'', end_time:''},
            {day_of_week: "wednesday", is_open: false,start_time:'', end_time:''},
            {day_of_week: "thursday", is_open: false, start_time:'', end_time:''},
            {day_of_week: "friday", is_open: false, start_time:'', end_time:''},
            {day_of_week: "saturday", is_open: false, start_time:'', end_time:''},
            {day_of_week: "sunday", is_open: false, start_time:'', end_time:''}
        ];
        let value = [];
        initialValue.map((item,i) => {
           let isDay = item;
            if(itemSchedule){
                itemSchedule.map((val,j)=>{
                    if (val.day_of_week === item.day_of_week)
                        isDay = val
                })
            }
                value.push(isDay)
        })

            return value

    }
    const [plainOptions, setPlainOptions] = useState(intializeSchedule());


    //Selecting All Time SLot
    const rangeAll = (time,timeString) => {
        console.log('time All,', timeString[0], timeString[1])
        let tempArray = [];
        if(checkAll){
            plainOptions.forEach((item)=>{
                item.start_time = setTime(timeString[0])
                item.end_time = setTime(timeString[1])
                return tempArray.push(item);
            });
            
            setPlainOptions(tempArray);
            console.log('Temp Araay value is', tempArray)
        }

    }
    //Set Individual Range
    const onRangeChange = (dayValue, timeString) => {
        console.log(dayValue, timeString);
        console.log('Time value is',timeString[0], timeString[1])

        let days = []
            plainOptions.forEach(day => {
            if (day.day_of_week === dayValue){
                day.start_time = setTime(timeString[0])
                day.end_time = setTime(timeString[1])
            
            }
                return  days.push(day);
            })
            setPlainOptions(days)
            console.log('Dayss ', days)
    }

      //Selecting All Days
    const chooseAllDays = (e) => {
        let tempArray = [];
        plainOptions.forEach((item)=>{
            item.is_open = e.target.checked;
            return tempArray.push(item);
        });
        console.log('Choose All Value is', tempArray)
        if(e.target.checked){
            setCheckAll(true)
        }
        else  setCheckAll(false)

        setIndeterminate(false)
        setPlainOptions(tempArray);
    }
    //On Select Custom Days
    const onChangeCheck = (e) => {
            let days = []
            plainOptions.forEach(day => {
                
               if (day.day_of_week === e.target.value){
                day.is_open =  e.target.checked
              
               }
               console.log('Daysss are : day', day.day_of_week, e.target.value, day.day_of_week === e.target.value, day.is_open)
                  return  days.push(day);
            })
            setIndeterminate(true)
            setCheckAll(false)
            setPlainOptions(days)
            console.log('Daysss are : ', days)
      };

    const showImage = (hospital_id) => {
        downloadFile('hospitals', hospital_id, 'profile')
            .then((json) => { 
              if(json.encodedData)
              {
                setImage("data:image;charset=utf-8;base64,"+json.encodedData);
                // console.log("data:image;charset=utf-8;base64,",json); 
              }
            })
            .catch((error) => console.error(error))
            .finally(() => {
          });
      }
    useEffect(() => {
        if(itemData.hospital_info.image){
        showImage(itemData.hospital_info.hospital_id);
        }
    }, [itemData.hospital_info.hospital_id]);

    //on Edit
    const handleLocationEdit = () => {
        setOnEdit(true);
    }  
    //on Delete
    const error = () => {
        message
        .loading('Deleting Location', 1.5)
        .then(() => message.success('Location Deleted Successfully', 2.5))
    };

    //render Facilities
    const renderFacilities = (facilitiesData) => !!facilitiesData && facilitiesData.map((data)=>
        <Fragment>
            {!!(data.facility)? 
             <Chip label={data.facility}/>  :  <div>No Facilities</div>  }
            <Divider type="vertical"  />
        </Fragment>
    )
    //onConfirmEdit
    const handleConfirmEdit = (id,loc) => {
        console.log('Handle Edit',elementDocId,id,loc,feeValue,appointmentTypeValue,plainOptions)
        editLocationAPI(elementDocId,id,loc,feeValue,appointmentTypeValue,plainOptions).then(result => {
            console.log("Location Updated",result);
            if(result === 'Operation Successful'){
                props.callback();
                setOnEdit(false);   
                message.success('Location Updated')
            }
            else{
                message.error('Cannot update location')
            }
         
        });
    }
    //onConfirmEdit
    const handleConfirmDel = (id) => {
          setOpen(true)
    }
 //Dialog Functions
 const handleClose = () => {
    setOpen(false);
};
const handleAgree=(id)=>{
    console.log("delete location",id);
        deleteLocationAPI(elementDocId,id).then(result => {
            props.callback();
            setOnEdit(false);
            console.log('location deleted')  
            setOpen(false)
        });
        props.callback();
        setOnEdit(false);
        setOpen(false)
        error();   
}
    return (
        <Fragment>
                {onEdit ?
                    <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
                        <div className='Editsection' onClick={()=>handleConfirmEdit(itemData.doctors_hospital_location_id,itemData.location)}>
                            <label> Confirm <i> <BsCheck /> </i></label>
                        </div>
                        <div className='Editsection' onClick={() => setOnEdit(false)}>
                            <label> Cancel <i> <BsX /> </i></label>
                        </div>
                        <div className='Editsection' onClick={handleConfirmDel}>
                            <label> Delete <i> <BsTrash/> </i></label>
                        </div>
                    </div>  
                :
                    accountType==="doctors" &&
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
                            <div className='Editsection' onClick={handleLocationEdit}>
                                <label> Edit <i> <BorderColorOutlinedIcon /> </i></label>
                            </div>
                        </div>
                }
                
            <div style={{textAlign: "left"}}>
                {
                    onEdit ? 
                        (
                        <Fragment>  
                        <Row> 
                            <Col lg='4' className='SectionList'>
                                <label> Hospital: </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                                <h6 style={{marginTop:-10}}><Avatar src={image} ><LocationOnIcon/> </Avatar> <b> {itemData.hospital_info.name} </b></h6>
                            </Col>
                        </Row>
                        <Row> 
                            <Col lg='4' className='SectionList'>
                                <label> Address: </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                                <h6> {itemData.location} </h6>
                            </Col>
                        </Row>
                        <Row> 
                            <Col lg='4' className='SectionList'>
                                <label> Fee: </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                                <input
                                    className='EditInput'
                                    placeholder="Fee"
                                    type="text"
                                    value={feeValue}
                                    noValidate
                                    onChange={e => setFeeValue(e.target.value)}
                                /> 
                            </Col>
                        </Row>
                        <FormGroup>
                            <Row> 
                                <Col lg='4' className='SectionList'>
                                    <label>Select Days : </label>
                                </Col>
                                <Col lg='3' className='SectionInfo'>
                                    <FormControlLabel
                                        control={ 
                                        <Checkbox icon={<CheckBoxOutlineBlankRoundedIcon />}
                                        checkedIcon={<StopRoundedIcon/> }
                                        name="Days"
                                        onChange={e => chooseAllDays(e)} 
                                        value="checkedall" 
                                        indeterminate={indeterminate}
                                        />
                                        
                                        }
                                        label="Choose All"  
                                    />
                                </Col>
                                <Col lg='4' className='SectionInfo'>
                                    {checkAll && <TimePicker.RangePicker  use12Hours minuteStep={30} getPopupContainer={trigger => trigger.parentNode} format="HH:mm" onChange={rangeAll}/> }
                                </Col>
                            </Row>
                            {plainOptions.map((item,i)=>{
                            return( <Row key={i}> 
                                <Col lg='4' className='SectionList'>
                                </Col>
                                <Col lg='3' className='SectionInfo'>
                                    <FormControlLabel
                                        control={
                                                <Checkbox 
                                                    icon={<CheckBoxOutlineBlankRoundedIcon />} 
                                                    checked={item.is_open} 
                                                    checkedIcon={<StopRoundedIcon/>} 
                                                    value={item.day_of_week}
                                                    onChange={e=> onChangeCheck(e)} />
                                                }
                                        label={item.day_of_week} 
                                    />
                                </Col>
                                <Col lg='4' className='SectionInfo' key={item.start_time}>
                                    {item.is_open == false || checkAll ?  '' :  <TimePicker.RangePicker use12Hours minuteStep={30} getPopupContainer={trigger => trigger.parentNode} onChange={(time, timeString) => onRangeChange(item.day_of_week, timeString)} format="HH:mm" defaultValue={item.start_time !== '' && [moment.utc(item.start_time,"HH:mm").local(), moment.utc(item.end_time,"HH:mm").local()]}/>}
                                </Col>
                            </Row>
                            )
                            })}
                        </FormGroup>
                        <Row>  
                            <Col lg='4' className='SectionList'>
                                <label>Treatment Method: </label>
                            </Col>
                            <Col lg='8' className='SectionInfo'>
                                <AppointmentMethods displayMode={"set"} methodsValue={appointmentTypeValue} returnHook={setAppointmentTypeValue} style={{justifyContent: "flex-start", color: "#000000"}}/>
                            </Col>
                        </Row>
                        <br/>
                    </Fragment>)
                    :( 
                        <Fragment>
                            <Row> 
                                <Col lg='1'></Col>
                                <Col lg='4' className='SectionList'>
                                    <label> Hospital: </label>
                                </Col>
                                <Col lg='6' className='SectionInfo'>
                                    <h6 style={{marginTop:-10}}><Avatar src={image}>
                                        {/* <Spin size='small'/> */}
                                        </Avatar> <b> {itemData.hospital_info.name} </b></h6>
                                </Col>
                            </Row>
                            <Row> 
                                <Col lg='1'></Col>
                                <Col lg='4' className='SectionList'>
                                    <label> Address: </label>
                                </Col>
                                <Col lg='6' className='SectionInfo'>
                                    <h6> {itemData.location} </h6>
                                </Col>
                            </Row>

                            <Row> 
                                <Col lg='1'></Col>
                                <Col lg='4' className='SectionList'>
                                    <label> Fees : </label>
                                </Col>
                                <Col lg='6' className='SectionInfo'>
                                    <h6> {itemData.fees} PKR </h6>
                                </Col>
                            </Row>

                            <Row> 
                                <Col lg='1'></Col>
                                <Col lg='4' className='SectionList'>
                                <label> Days: </label>
                                </Col>
                                <Col lg='6' className='SectionInfo'>    
                                    {DayData && DayData.map((item,i)=>{
                                        return(
                                            item.is_open === true &&
                                            <Row key={i}> 
                                            <Col lg={4}>
                                                <h6 style={{textTransform:'capitalize'}}> <b> {item.day_of_week}  </b></h6> 
                                            </Col>
                                            <Col lg={6}>
                                                <label style={{color:'grey'}}> ( {getTimeString(item.start_time)}  - {getTimeString(item.end_time)} ) </label>
                                            </Col>
                                         </Row>
                                        )
                                    })}  
                                </Col>
                            </Row>
                            
                            <Row className='mtt-10'>
                                <Col lg='1'></Col>
                                <Col lg='4' className='SectionList'>
                                    <label> Facilities: </label>
                                </Col>
                                <Col lg='6' className='SectionInfo'>
                                    {(!!itemData.facilities && itemData.facilities !== 0)? renderFacilities(itemData.facilities) :  <Chip label={'None'}/>}
                                </Col>
                            </Row>

                            <Row className='mtt-10'>
                                <Col lg='1'></Col>
                                <Col lg='4' className='SectionList'>
                                    <label> Treatment Methods: </label>
                                </Col>
                                <Col lg='6' className='SectionInfo'>
                                    <AppointmentMethods displayMode={"view"} methodsValue={itemData.appointment_type}  style={{justifyContent: "flex-start", color: "#000000"}}/>
                                </Col>
                            </Row>
                           
                        </Fragment>
                    )
                } 
            </div>
            <br/>
            <Divider/>
            <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title">
            <DialogTitle id="responsive-dialog-title">{"Are you sure you want to delete this location?"}</DialogTitle>
            <DialogActions>
                <Button autoFocus onClick={handleClose} color="primary">
                    Disagree
                </Button>
                <Button onClick={()=>handleAgree(itemData.doctors_hospital_location_id)} color="primary" autoFocus>
                    Agree
                </Button>
            </DialogActions>
      </Dialog>
            <br/>
        </Fragment>
    )
}

export default EditLocationItemUi

EditLocationItemUi.defaultProps = {
    locationData : [{
        doctor_Location_id: "1",
        location: "cmh",
        days: "mon-fri",
        fees: "500",
        start_time: "13:00",
        end_time: "19:00",
    }]
}

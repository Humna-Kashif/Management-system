import React,{Fragment} from 'react'
import { Popover } from 'antd';
import {getDateTime} from './../../Hooks/TimeHandling'
import moment from 'moment'
import '../../Styles/AppointmentItem.css';
import Avatar from '@material-ui/core/Avatar';

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


const ActivityLogItem = (props) => {

    //Dont have privious date of appoointment for follow up and reschdule
    //vital value require
    //Error in comments
    //Delete diagnosis, Symptom, Test not working
    //No Activity Log for Diagnosis
    //No medicine name which is upadated while in other cases update item name is exist in json
    //No phone number info
    //No hospital info for location
    const renderActions = (value) => {
        var action = value;
        if (action.includes("add_nurse")) {
            return <Fragment>Nurse <b>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}</b> added </Fragment>
        } else if (action.includes("update_nurse")) {
            return <Fragment>Nurse <b>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}</b>'s contact information updated </Fragment>
        } else if (action.includes("delete_nurse")) {
            return <Fragment>Nurse deleted </Fragment>
        } else if (action.includes("add_pa")) {
            return <Fragment>Personal assistant <b>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}</b> added </Fragment>
        } else if (action.includes("update_pa")) {
            return <Fragment>Personal assistant <b>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}</b>'s contact information updated </Fragment>
        } else if (action.includes("delete_pa")) {
            return <Fragment>Personal assistant deleted </Fragment>
        } else if (action.includes("add_fd")) {
            return <Fragment>Front desk staff <b>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}</b> added </Fragment>
        } else if (action.includes("update_fd")) {
            return <Fragment>Front desk staff <b>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}</b>'s contact information updated </Fragment>
        } else if (action.includes("delete_fd")) {
            return <Fragment>Front desk staff deleted </Fragment>
        } else if (action.includes("add_admin")) {
            return <Fragment>Admin <b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b> added </Fragment>
        } else if (action.includes("update_admin")) {
            return <Fragment>Admin <b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b>'s contact information updated </Fragment>
        } else if (action.includes("delete_admin")) {
            return <Fragment>Admin deleted </Fragment>
        } else if (action.includes("add_doctor")) {
            return <Fragment>Doctor <b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b> added </Fragment>
        } else if (action.includes("update_doctor")) {
            return <Fragment>Doctor <b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b>'s contact information updated </Fragment>
        } else if (action.includes("delete_doctor")) {
            return <Fragment>Doctor deleted </Fragment>
        } else if (action.includes("add_hospital")) {
            return <Fragment>New hospital <b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b> added </Fragment>
        } else if (action==="update_hospital") {
            return <Fragment><b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b> name/image updated </Fragment>
        } else if (action.includes("delete_hospital")) {
            return <Fragment>Hospital deleted </Fragment>
        } else if (action.includes("add_location")) {
            return <Fragment>New location <b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b> added </Fragment>
        } else if (action.includes("update_location")) {
            return <Fragment><b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b> information updated </Fragment>
        } else if (action.includes("delete_location")) {
            return <Fragment>Location deleted </Fragment>
        } else if (action.includes("add_symptom")) {
            return <Fragment>New symptom added </Fragment>
        } else if (action.includes("update_symptom")) {
            return <Fragment>Symptom <b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b> updated </Fragment>
        } else if (action.includes("delete_symptom")) {
            return <Fragment>Symptom deleted </Fragment>
        } else if (action.includes("add_diagnosis")) {
            return <Fragment>New diagnosis added </Fragment>
        } else if (action.includes("update_diagnosis")) {
            return <Fragment>Diagnosis <b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b> updated </Fragment>
        } else if (action.includes("delete_diagnosis")) {
            return <Fragment>Diagnosis deleted </Fragment>
        } else if (action.includes("add_test")) {
            return <Fragment>New test added </Fragment>
        } else if (action.includes("update_test")) {
            return <Fragment>Test <b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b> updated </Fragment>
        } else if (action.includes("delete_test")) {
            return <Fragment>Test deleted </Fragment>
        }  else if (action.includes("add_medicine")) {
            return <Fragment>New medicine added </Fragment>
        } else if (action.includes("update_medicine")) {
            return <Fragment>Medicine <b>{!!props.ActivityItem.activity_on && titleCase(props.ActivityItem.activity_on.name)}</b> updated </Fragment>
        } else if (action.includes("delete_medicine")) {
            return <Fragment>Medicine deleted </Fragment>
        } else if (action.includes("add_comment")) {
            return <Fragment>Commented on an appointment of {!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)} dated <b>{getDateTime(!!props.ActivityItem.activity_info && props.ActivityItem.activity_info.date_time)}</b></Fragment>
        } else if (action.includes("reschedule_appointment")) {
            return <Fragment>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}'s appointment moved to <b>{getDateTime(!!props.ActivityItem.activity_info && props.ActivityItem.activity_info.date_time)}</b></Fragment>
        } else if (action.includes("add_vital")) {
            return <Fragment><b>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.vital_name)} {!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.current_value)}</b> added for {!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}</Fragment>
        } else if (action.includes("upload_image")) {
            return "Profile image uploaded"
        } else if (action.includes("upload_test")) {
            return "New test uploaded"
        } else if (action.includes("update_contact")) {
            return <Fragment>Profile information updated</Fragment>
        } else if (action.includes("set_appointment")) {
            return <Fragment>New appointment for {!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)} added on <b>{getDateTime(!!props.ActivityItem.activity_info && props.ActivityItem.activity_info.date_time)}</b></Fragment>
        } else if (action.includes("cancel_appointment")) {
            return "cancelled an appointment of patient "
        } else if (action.includes("set_followup")) {
            return <Fragment>Follow up of {!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}'s appointment created on <b>{getDateTime(!!props.ActivityItem.activity_info && props.ActivityItem.activity_info.date_time)}</b></Fragment>
        } else if (action.includes("set_hospital_location")) {
            return <Fragment>New location <b>{!!props.ActivityItem.activity_info && props.ActivityItem.activity_info.location}</b> added</Fragment>
        } else if (action==="update_hospital_location") {
            return <Fragment>Location <b>{!!props.ActivityItem.activity_info && props.ActivityItem.activity_info.location}</b> timing/fee updated</Fragment>
        } else if (action.includes("update_staff")) {
            return "updated your staff "
        } else if (action.includes("delete_staff")) {
            return "deleted a staff "
        } else if (action.includes("add_qualification")) {
            return <Fragment>Qualification <b>{!!props.ActivityItem.activity_info && props.ActivityItem.activity_info.qualification}</b> added</Fragment>
        } else if (action.includes("update_contact")) {
            return <Fragment>Profile information updated</Fragment>
        } else if (action.includes("delete_qualification")) {
            return <Fragment>Qualification deleted</Fragment>
        } else if (action.includes("create_patient")) {
            return <Fragment>New patient <b>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}</b> added</Fragment>
        } else if (action.includes("completed_appointment")) {
            return <Fragment><b>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}</b>'s appointment {!!props.ActivityItem.activity_info && getDateTime(props.ActivityItem.activity_info.date_time)} completed</Fragment>
        } else if (action.includes("edit_appointment")) {
            return <Fragment><b>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)}</b>'s appointment {!!props.ActivityItem.activity_info && getDateTime(props.ActivityItem.activity_info.date_time)} edited</Fragment>
        } else if (action.includes("start_appointment")) {
            return <Fragment>Appointment <b>{!!props.ActivityItem.activity_info && getDateTime(props.ActivityItem.activity_info.date_time)}</b> started for {!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)} </Fragment>
        } else if (action.includes("check_in")) {
            return <Fragment>{!!props.ActivityItem.activity_info && titleCase(props.ActivityItem.activity_info.name)} was checked in forappointment <b>{!!props.ActivityItem.activity_info && getDateTime(props.ActivityItem.activity_info.date_time)}</b> </Fragment>
        } else return action
    }

    return (
        <div style={{ marginBottom: "10px", display: "flex", flex: 1 }}>
            <div>
                <Avatar src={props.image} style={{ float: "left", marginRight: "5px" }}></Avatar>
                <span>
                    {renderActions(props.ActivityItem.activity)}
                </span>
                {/* {props.ActivityItem.activity === "delete_staff" ? "" : " named "} <b>{!!props.ActivityItem.activity_info && (titleCase(props.ActivityItem.activity_info.name) ? titleCase(props.ActivityItem.activity_info.name)
                    : props.ActivityItem.activity_info.location)}</b>
                {!!props.ActivityItem.activity_info && (props.ActivityItem.activity_info.vital_name ? " and the vital is " + props.ActivityItem.activity_info.vital_name : " ")} */}
            </div>
            <div style={{ marginBottom: "10px", display: "flex", flex: 3, flexDirection: "row-reverse", marginRight: "15px" }}>
                <span className='statusLogout'> <Popover content={` ${moment(props.ActivityItem.time_stamp).format("dddd, Do MMM, YYYY, h:mm:ss a")}`} placement='top' >
                    {moment(props.ActivityItem.time_stamp).month(0).from(moment().month(0))}
                </Popover>
                </span>
            </div>
        </div>
    )
}
export default ActivityLogItem
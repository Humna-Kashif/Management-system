import React, { useState, useEffect, useContext } from 'react'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Col, Row } from "react-bootstrap";
import moment from 'moment'
import { Badge } from 'antd';
import Avatar from '@material-ui/core/Avatar';
import CardActions from '@material-ui/core/CardActions';
import './Notifications.css';
import { Fragment } from 'react';
import { downloadFile } from '../../Hooks/ImageAPI';
import { GlobalContext } from '../../Context/GlobalState';

const NotificationsList = (props) => {
    const notificationItemPatient = !!props.data.patient_info && props.data.patient_info;
    const {accountType} = useContext(GlobalContext)
    const [image, setImage] = useState(null);
 
    const showImage = (patient_id) => {
        console.log("rendering get image of notification list", "patients", patient_id, 'profile')
        downloadFile("patients", patient_id, 'profile')
            .then((json) => { 
                    setImage("data:image;charset=utf-8;base64," + json.encodedData) ;
            })
            .catch((error) => console.error(error))
            .finally(() => {
            });
    }

    const formateNotificationText = (notificationType, initiatorType) => {
        if (notificationType === 'reschedule_appointment' && initiatorType === 'doctor') {
            return <label style={props.data.notification_status === false ? styles.unread_status : styles.read_status}>
                <b>{notificationItemPatient.name}</b> rescheduled his appointment on <b>{!!props.data.appointment_info && moment(props.data.appointment_info.date_time).format("dddd, MMMM Do YYYY, h:mm:ss a")}</b>
            </label>
        } else if (notificationType === 'set_appointment' && initiatorType === 'doctor') {
            return <label style={props.data.notification_status === false ? styles.unread_status : styles.read_status}>
                <b>{notificationItemPatient.name}</b> scheduled an appointment with you on <b>{!!props.data.appointment_info && moment(props.data.appointment_info.date_time).format("dddd, MMMM Do YYYY, h:mm:ss a")}</b>
            </label>
        } else if (notificationType === 'cancel_appointment' && initiatorType === 'doctor') {
            return <label style={props.data.notification_status === false ? styles.unread_status : styles.read_status}>
                <b>{notificationItemPatient.name}</b> cancelled an appointment with you on <b>{!!props.data.appointment_info && moment(props.data.appointment_info.date_time).format("dddd, MMMM Do YYYY, h:mm:ss a")}</b>
            </label>
        } else if (notificationType === 'set_followup' && initiatorType === 'doctor') {
            return <label style={props.data.notification_status === false ? styles.unread_status : styles.read_status}>
                <b>{notificationItemPatient.name}</b>  scheduled a follow of an appointment on <b>{!!props.data.appointment_info && moment(props.data.appointment_info.date_time).format("dddd, MMMM Do YYYY, h:mm:ss a")}</b>
            </label>
        } else if (notificationType === 'give_access' && initiatorType === 'doctor') {
            return <label style={props.data.notification_status === false ? styles.unread_status : styles.read_status}>
                <b>{notificationItemPatient.name}</b> accept your access request
            </label>
        } else if (notificationType === 'add_comment' && initiatorType === 'doctor') {
            return <label style={props.data.notification_status === false ? styles.unread_status : styles.read_status}>
                <b>{notificationItemPatient.name}</b> commented on an appointment dated at <b>{!!props.data.appointment_info && moment(props.data.appointment_info.date_time).format("dddd, MMMM Do YYYY, h:mm:ss a")}</b>
            </label>
        } else if (notificationType === 'add_favourite_doctor' && initiatorType === 'doctor') {
            return <label style={props.data.notification_status === false ? styles.unread_status : styles.read_status}>
                <b>{notificationItemPatient.name}</b> added you to his favourite list
            </label>
        } else {
            return <label style={props.data.notification_status === false ? styles.unread_status : styles.read_status}>
                <b>{notificationItemPatient.name}</b> perform {notificationType} action
            </label>
        }
    }


    useEffect(() => {
        if (!!notificationItemPatient.patient_id) {
            showImage(notificationItemPatient.patient_id);
        }
    }, [props.data.notification_status,notificationItemPatient.patient_id]);

    return (
        <Fragment>
            <Card className='Cards' onClick={() => { props.NotificationStatus(props.data.notification_id, "true") }}>
                <CardContent>
                    <Row >
                        <Col lg={2}>
                            <Avatar
                                src={image}
                            />
                        </Col>
                        <Col lg={10}>
                            <span className='cardTitle'>
                                {formateNotificationText(props.data.notification_type, props.data.notification_user_type)}
                            </span>
                        </Col>
                    </Row>
                </CardContent>
                <CardActions>
                    {props.data.notification_status === false ? <Badge status='processing' /> : ''}
                    <label className='Moment'> {moment(!!props.data && props.data.notification_time_stamp).month(0).from(moment().month(0))}</label>
                </CardActions>
            </Card>
            <br />
        </Fragment>
    )
}

export default NotificationsList

const styles = {
    unread_status: {
        fontWeight: "bold"
    },
    read_status: {
        fontWeight: "normal"
    }
};
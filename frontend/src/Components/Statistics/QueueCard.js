import React, { Fragment } from 'react';
import { Col, Row } from 'react-bootstrap';
import Avatar from '@material-ui/core/Avatar';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import { getDate, getDateOfBirth, getTime } from '../../Hooks/TimeHandling'

const QueueCard = (props) => {
    const patientData = props.patientData;
    return patientData !== '' && (
        <Fragment>
            <Card className='ProgressCard' variant="outlined" id={patientData.patient_id}>
                <CardContent>
                    <label className='patientStatus'> {props.status} - {patientData.appointment_id}</label>
                    <Row id={patientData.patient_id}>
                        <Col lg={2}>
                            <Avatar alt="patient-image" src={patientData.patient_info.image} />
                        </Col>
                        <Col lg={10}>
                            <div className='mll-15'>
                                <h4 className='NameLabel'> {patientData.patient_info.name} </h4>
                                <h6 className='AgeLabel'> Age:{getDateOfBirth(patientData.patient_info.dob)}</h6>
                                <h6 className='GenderLabel'> Gender: {patientData.patient_info.gender}</h6>
                            </div>
                        </Col>
                    </Row>
                </CardContent>
                <CardActions>
                    <h6 style={{ fontSize: 13 }}> Appointment: <label>{getDate(patientData.date_time)}</label> at 
                    <label>{getTime(patientData.date_time)}</label></h6>
                </CardActions>
            </Card>
        </Fragment>
    )
}

export default QueueCard
QueueCard.defaultProps = {
    patientData: '',
    status: ''
}
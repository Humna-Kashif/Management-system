import React,{useEffect,useState,Fragment,useCallback, useContext} from 'react';
import {Link} from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import QueueCard from './QueueCard';
import {getAppointmentsStats}from '../../Hooks/API';
import moment from 'moment';
import {Skeleton} from 'antd';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import NoPatients from '../../Styles/Assets/NoPatients.jpeg';
import { GlobalContext } from '../../Context/GlobalState';

const TodaysQueue=(props)=>{
    const {accountId} = useContext(GlobalContext)
    const [nextPatient,setNextPatient]=useState('');
    const [currentPatient,setCurrentPatient]=useState('');

    const displayPatientQue =useCallback(()=>{
       return getAppointmentsStats(accountId,0,moment(new Date()).format("YYYY-MM-DD")).then(result => {
            console.log("appointment patient stats is: ",result[0]);
            if(result[0]){
                if(result[0].next_patient){
                    setNextPatient(result[0].next_patient)}
                else setNextPatient('')

                if(result[0].current_patient){
                    setCurrentPatient(result[0].current_patient[0]);}
                else setCurrentPatient('')      
            }     
            else console.log('No Queue'); 
        });
        
    },[accountId]);

    useEffect(() =>{
        displayPatientQue(); 
    },[displayPatientQue]);

    // Empty Cards
    const renderSkeleton=()=>{
        return(
            <Card className='ProgressCard NextCard' variant="outlined" style={{minHeight:'166px',maxHeight:'166px'}}>
                <CardContent>
                 <Skeleton avatar paragraph={{ rows: 3}} />
                </CardContent>
            </Card>
        )
    }

    const renderQueueCard = (status,patientData) => <QueueCard patientData={patientData} status={status}/> 
        
    return(
        <Fragment>
            <label className='StatsTitle'>Today's Queue</label>
            {(nextPatient.length && currentPatient.length)!==0 ?
                <Row className='m-0'>
                    <Col lg={props.ColSize}>
                    {!!currentPatient?  renderQueueCard('Current Patient', currentPatient) :renderSkeleton()}
                    </Col>
                    <Col lg={props.ColSize}>
                        {!!nextPatient? renderQueueCard('Next Patient', nextPatient) :renderSkeleton()}
                    </Col>
                 </Row>
            : 
                <div className ='text-center' style={{marginTop:-5,marginBottom:10}}> 
                    <img src={NoPatients} alt='No patients to show' className='NoacessImg' />
                    <div style={{marginTop:10,marginBottom:10}}>
                     <Link to='/Patients' className='ApoointBtn'>Schedule Appointments </Link>  
                    </div>
                 </div>
             }   
         </Fragment>
    )
}

export default TodaysQueue
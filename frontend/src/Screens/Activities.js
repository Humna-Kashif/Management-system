import React from 'react'
import { Tab,Tabs,Container } from 'react-bootstrap'
import ActivityLogs from '../Components/AuditTrails/ActivityLogs' 
import SessionsLogs from '../Components/AuditTrails/SessionsLogs' 
const Activities = (props) =>{
    return(
        <Container fluid>
            <Tabs defaultActiveKey="Sessions Logs" id="uncontrolled-tab-example">
                <Tab eventKey="Sessions Logs" title="Sessions Logs">
                    <SessionsLogs/>
                </Tab>
                <Tab eventKey="Activity Logs" title="Activity Logs">
                    <ActivityLogs/>
                </Tab>
            </Tabs>
        </Container>
    )
}

export default Activities
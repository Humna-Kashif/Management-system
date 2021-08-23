import React,{Fragment} from 'react';
import { Row,Col } from 'react-bootstrap';
import TopMedicine from './TopMedicine';
import TopTests from './TopTests';
import TopSymptoms from './TopSymptoms';
import TopDiagnosis from './TopDiagnosis';

const TreatmentStats=(props)=>{
    const location = props.location;
    const range = props.range;
    const interval = props.interval;
    return(
        <Fragment>
             <h6 className='ColHeader'> TREATMENT STATISTICS</h6>
              <Row >
               <Col lg={6}>
                    <TopMedicine location={location} range={range} interval={interval}/>
               </Col> 
               <Col lg={6}>
                    <TopTests location={location} range={range} interval={interval}/>
               </Col> 
               <Col lg={6} className='mtt-20'>
                    <TopSymptoms location={location} range={range} interval={interval}/>
               </Col> 
               <Col lg={6} className='mtt-20'>
                    <TopDiagnosis location={location} range={range} interval={interval}/>
               </Col> 
              </Row>
              <br/>    
        </Fragment>
    )
}


export default TreatmentStats
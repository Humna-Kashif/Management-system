import React, { useState } from "react"
import { Col, Row } from "react-bootstrap";
import moment from 'moment';
const Locations = (props) => {
    const doc_Id = props.id;
    const itemData = props.itemData;
    const Enabled = props.isEnableEdit;
    const [data, setData] = useState(itemData);
    const [enableEdit, setEnableEdit] =  useState(true);      
    const [editCtrl, setEditCtrl] = useState(false);
    const [deleteCtrl, setDeleteCtrl] = useState(false);
    const [selectedValue, setSelectedValue] = useState(itemData.location);
    const [searchLocList, setSearchLocList]=useState([]);
    const [inputValue, setValue] = useState('null');
    const [startTimePick, setstartTimePick] = useState(itemData.start_time);
    const [endTimePick, setendTimePick] = useState(itemData.end_time);
    const [feeValue,setFeeValue] = useState(itemData.fees);
    const [daysData, setDaysData] = useState(itemData.days); 

    return(
        <div >
        <Row> 
            <Col lg='4' className='SectionList'>
                <label> Address: </label>
            </Col>
            <Col lg='8' className='SectionInfo'>
                <h6> <b> {itemData.location} </b></h6>
            </Col>
        </Row>
        <Row> 
            <Col lg='4' className='SectionList'>
                <label> Visiting Hours: </label>
            </Col>
            <Col lg='8' className='SectionInfo'>
    
                <h6> {moment(itemData.start_time,'LTT').format('LT')} -  {moment(itemData.end_time,'LTT').format('LT')} </h6>
            </Col>
        </Row>
        <Row> 
    <Col lg='4' className='SectionList'>
    <label> Checkup Fee (PKR): </label>
    </Col>
    <Col lg='8' className='SectionInfo'>
        <h6> {itemData.fees}</h6>
    </Col>
    {/* {itemData.days} */}
</Row>
</div>

    
    )
}



export default Locations
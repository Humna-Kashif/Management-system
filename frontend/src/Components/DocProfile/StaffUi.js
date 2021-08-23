import React, { useEffect, useState, useContext } from 'react';
import { Fragment } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Popover, Empty } from 'antd';
import { getProfileAllInfo, getStaff } from '../../DB/API';
import { useLocation } from "react-router-dom";
import { Divider } from '@material-ui/core';
import { getDateOfBirth } from '../../DB/TimeHandling'
import { GlobalContext } from '../Context/GlobalState';

const StaffUi = (props) => {
    const doc_ID = useLocation().state.userId;
    const [staffData, setStaffData] = useState([]);
    const { accountType, accountId, accountCId, info, staffDocId } = useContext(GlobalContext)


    useEffect(() => {
        getProfileAllInfo(doc_ID).then(result => {
            console.log("about data in profile ui is ", result[0]);

        });
        getStaff(doc_ID).then(result => {
            console.log("Staff is ", result);
            if (result)
                setStaffData(result);
        });
    }, []);

    const renderStaff = () => {
        return staffData.map((data) =>

            <Fragment>
                <Row>
                    <Col lg='4' className='SectionList'>
                        <label> Name: </label>
                    </Col>
                    <Col lg='8' className='SectionInfo'>
                        <Popover content='Click to view staff details'>  <h6> <b> {data.name} </b></h6>  </Popover>

                    </Col>
                </Row>
                <Row>
                    <Col lg='4' className='SectionList'>
                        <label> Age: </label>
                    </Col>
                    <Col lg='8' className='SectionInfo'>
                        <h6>{getDateOfBirth(data.dob)} years </h6>

                    </Col>
                </Row>

                <Row>
                    <Col lg='4' className='SectionList'>
                        <label> Gender: </label>
                    </Col>
                    <Col lg='8' className='SectionInfo'>
                        <h6>  {data.gender} </h6>

                    </Col>
                </Row>
                <Row >
                    <Col lg='4' className='SectionList'>
                        <label> Role : </label>
                    </Col>
                    <Col lg='8' className='SectionInfo'>
                        <h6> {data.role ? data.role : '----'} </h6>
                    </Col>
                </Row>

                <Row >
                    <Col lg='4' className='SectionList'>
                        <label> Contact: </label>
                    </Col>
                    <Col lg='8' className='SectionInfo'>
                        <h6> {data.number}</h6>
                    </Col>
                </Row>
                <br />
                <Divider />
                <br />
            </Fragment>

        )
    }

    return (
        <Fragment>
            <div className='DetInfoSection'>
                <h6 className='DetHead'> Staff </h6>
                {staffData.length !== 0 ?
                    <Fragment>
                        {renderStaff()}
                    </Fragment>
                    : <div><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Staff Added'} /></div>}

            </div>

        </Fragment>
    )
}



export default StaffUi

StaffUi.defaultProps = {
    staffData:
    {
        doctor_facility_id: 10,
        name: "Staff Name",
        role: 'Staff Role',
        contact_no: 'Satff Contact'
    },

}
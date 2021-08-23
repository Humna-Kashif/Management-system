import React, { useEffect, useState, useContext } from 'react';
import { Fragment } from 'react'
import { Col, Row } from 'react-bootstrap';
import { getProfileAllInfo, locationsAPI } from '../../DB/API';
import { useLocation } from "react-router-dom";
import * as moment from 'moment/moment';
import Locations from './gettingLocations';
import { Chip, Divider } from '@material-ui/core';
import { Empty } from 'antd';
import '../../Styles/DocProfile.css';
import AppointmentMethods from '../AppointmentMethods';
import Avatar from 'antd/lib/avatar/avatar';
import { GlobalContext } from '../Context/GlobalState';
import LocationOnIcon from '@material-ui/icons/LocationOn';

const LocationsUi = (props) => {
    const doc_ID = useLocation().state.userId;
    const location = useLocation().state.location;
    const [locationData, setLocationData] = useState([]);
    const [startTimePick, setstartTimePick] = useState([]);
    const [endTimePick, setendTimePick] = useState([]);
    const [data, setData] = useState([]);
    const [editing, setEditing] = useState(false);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const { accountType, accountId, accountCId, info, staffDocId } = useContext(GlobalContext)



    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(() => {
        getProfileAllInfo(accountType, accountId).then(result => {
            console.log("about data ", result[0]);
            if (result[0]) {
                if (result[0].location) {
                    setLocationData(result[0].location);
                    console.log('Location Data', result[0].location);
                    setstartTimePick(result[0].location);
                    setendTimePick('1:00');
                }
            }
        })
    }, []);

    const refresh = () => {
        locationsAPI(doc_ID).then(result => {
            if (result) {
                console.log("location data is ", result)
                setData(result);
            }
        });
    }

    const renderItem = () => {
        return (
            data.map((item, i) => (<Locations callback={refresh} id={doc_ID} key={i} itemData={item} isEnableEdit={editing} />))
        )
    }

    const renderFacilities = (facilitiesData) => !!facilitiesData && facilitiesData.map((data) =>
        <Fragment>
            {!!(data.facility) ? <span>  <Chip label={data.facility} /> &nbsp;</span> : <div>No Facilities</div>}
        </Fragment>
    )

    const renderLocation = () => {
        return !!locationData && locationData.map((data) =>

            <Fragment>
                {!!(data) &&
                    <div>
                        <Row>
                            <Col lg='4' className='SectionList'>
                                <label> Hospital: </label>
                            </Col>
                            <Col lg='8' className='SectionInfo'>
                                <h6 style={{ marginTop: -10 }}>
                                    <Avatar src={data.hospital_info.image} style={{ borderRadius: '4px' }}>
                                        <LocationOnIcon /></Avatar>
                                    <b> {data.hospital_info.name}
                                    </b></h6>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg='4' className='SectionList'>
                                <label> Address: </label>
                            </Col>
                            <Col lg='8' className='SectionInfo'>
                                <h6> <b> {data.hospital_location} </b></h6>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg='4' className='SectionList'>
                                <label> Visiting Hours: </label>
                            </Col>
                            <Col lg='8' className='SectionInfo'>

                                <h6> {moment(data.start_time, 'LTT').format('LT')} -  {moment(data.end_time, 'LTT').format('LT')} </h6>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg='4' className='SectionList'>
                                <label> Checkup Fee (PKR): </label>
                            </Col>
                            <Col lg='8' className='SectionInfo'>
                                <h6> {data.fees}</h6>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg='4' className='SectionList'>
                                <label> Days: </label>
                            </Col>
                            <Col lg='8' className='SectionInfo'>
                                <h6> {data.days}</h6>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg='4' className='SectionList'>
                                <label> Treatment Methods: </label>
                            </Col>
                            <Col lg='8' className='SectionInfo'>
                                <AppointmentMethods displayMode={"view"} methodsValue={data.appointment_type} style={{ justifyContent: "flex-start", color: "#000000" }} />
                            </Col>
                        </Row>
                        <Row>
                            <Col lg='4' className='SectionList'>
                                <label> Facilities: </label>
                            </Col>
                            <Col lg='8' className='SectionInfo'>
                                {!!data.facilities && data.facilities !== 0 ? renderFacilities(data.facilities) :
                                    <label> No Facilities Currently Available </label>}
                            </Col>
                        </Row>
                        <Divider className='Dividers' />
                    </div>}
                <br />
            </Fragment>
        )

    }

    return (
        <Fragment>
            <div className='DetInfoSection'>
                <h6 className='DetHead'> Locations </h6>
                {renderLocation()}
                {locationData.length === 0 && (<div><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Locations Added'} /></div>)}
            </div>
        </Fragment>
    )
}


export default LocationsUi

LocationsUi.defaultProps = {
    location:
    {
        doctor_facility_id: 10,
        location: "KRL Hospital Islamabad",
        start_time: '11 AM',
        end_time: '6 PM',
        fees: '1000'
    },

}
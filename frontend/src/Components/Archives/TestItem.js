import React, { Fragment, useState } from 'react';
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { Avatar } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import PictureAsPdfTwoToneIcon from '@material-ui/icons/PictureAsPdfTwoTone';
import GetAppIcon from '@material-ui/icons/GetApp';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { Card, Divider, Empty } from 'antd';
import { getDate, getTime } from '../../Hooks/TimeHandling';

const TestItem = (props) => {
    const [expandTestList, setExpandTestList] = useState(true);

    const ExpandTests = (i) => {
        setExpandTestList(!expandTestList)
    }
    return (
        <Fragment >
            <h6 onClick={(e) => { setExpandTestList(!expandTestList); e.stopPropagation() }} style={{ cursor: 'pointer' }}> Appointment Date: <b>{getDate(props.data.date)} </b> {props.data.tests.length > 1 ? <span> {expandTestList ? <BsChevronUp style={{ fontSize: 12 }} /> : <BsChevronDown style={{ fontSize: 12 }} />} </span> : ''}</h6>
            <Divider className='mtt-2' />
            {expandTestList && props.data.tests.map((item, i) => (
                <div key={i} className='listContainer' style={{ marginBottom: '20px', padding: 10, borderRadius: '4px', border: '1px solid #cecece', position: 'relative', boxShadow: 'rgb(0 0 0 / 9%) 0px 1px 2px -2px, 0 3px 6px 0 rgba(0,0,0,.12), 0 5px 12px 4px rgba(0,0,0,.09)', height: 70 }}>
                    <Avatar style={{ float: 'left', borderRadius: '4px', marginRight: '10px', height: '50px', width: '50px', color: '#6c757d' }}><PictureAsPdfTwoToneIcon /> </Avatar>
                    <h6 style={{ marginBottom: 0, marginTop: 6, color: '#333333', textTransform: 'capitalize' }}> <b> {item.test_name ? item.test_name : 'Prescribed Test'} </b> </h6>
                    <div style={styles.appointment_time}>
                        Prescribed on:
                        <label >
                            {getDate(item.test_date_time)} at {getTime(item.test_date_time)}
                        </label>
                    </div>
                    {item.test_result === null ?
                        <Button
                            style={{ position: "absolute", top: 17, right: 10 }}
                            variant="contained" disabled
                            startIcon={<HighlightOffIcon />}
                        >
                            Not Uploaded
                        </Button>
                        :
                        <Button
                            variant="contained"
                            color="secondary"
                            style={{ position: "absolute", top: 17, right: 10 }}
                            startIcon={<GetAppIcon />}
                            onClick={() => { props.downloadItem(item.patient_id, item.appointment_id, item.test_id) }}
                        >
                            Download
                        </Button>
                    }
                </div>
            ))}
        </Fragment>
    )
}


export default TestItem
const styles = {
    appointment_time: { fontSize: 13, textAlign: "left", color: 'rgb(109 107 107)' },
}
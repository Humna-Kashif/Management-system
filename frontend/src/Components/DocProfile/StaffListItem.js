import React, { useContext, useState, } from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import { Radio, Input, DatePicker, Select, message } from 'antd';
import { deleteStaff, editStaff } from '../../Hooks/API';
import BorderColorOutlinedIcon from '@material-ui/icons/BorderColorOutlined'
import { BsCheck, BsX, BsTrash } from "react-icons/bs";
import { getDateOfBirth } from '../../Hooks/TimeHandling';
import moment from 'moment';
import { Divider } from '@material-ui/core';
import { GlobalContext } from '../../Context/GlobalState';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';

const { Option } = Select;

const StaffListItem = (props) => {
    const item = props.itemData;
    console.log('Front Desk', props.itemData)
    const locationData = props.locations
    const staffID = item.doctor_staff_fd_id;
    const contactId = item.fd_info.contact_id;
    const [onEdit, setOnEdit] = useState(false);
    const [staffName, setStaffName] = useState(item.fd_info.name);
    const [age, setAge] = useState(item.fd_info.dob);
    const [contact, setContact] = useState(item.fd_info.number);
    const [genderValue, setGenderValue] = useState(item.fd_info.gender);
    const [role, setRole] = useState('front desk');
    const [nurseRole, setNurseRole] = useState(false);
    const [fdRole, setFDRole] = useState(true);
    const [paRole, setPARole] = useState(false);
    const [open, setOpen] = useState(false);
    const [location, setLocation] = useState(item.doctors_hospital_location_id);
    const { accountId, accountType, staffDocId, elementDocId } = useContext(GlobalContext);
    const options = [
        { label: 'Nurse', value: 'Nurse' },
        { label: 'Front Desk', value: 'Front Desk' },
        { label: 'Personal Assistant', value: 'Personal Assistant' },
    ];


    //on Edit Staff
    const success = () => {
        message.success('Staff Edited Successfully');
    };
    //Dialog Functions
    const handleClose = () => {
        setOpen(false);
    };
    const handleAgree = () => {
        console.log("deleted id is ", elementDocId, location, 0, staffID, 0)
        deleteStaff(elementDocId, location, staffID, "DELETE").then((result) => {
            if (result.code === 404) {
                message.error('Staff not deleted ', 2.5)
                setOpen(false)
            }
            else {
                console.log("delete staff result is ", result)
                error();
                setOnEdit(false);
                props.refreshList();
                setOpen(false)
            }
        });
    }
    //onCheckedRole
    const chooseRole = (value) => {
        setRole(value)
        console.log('checked = ', value);
        if (value === 'nurse') {
            setNurseRole(true)
            setPARole(false)
            setFDRole(false)
        }
        if (value === 'personal assistant') {
            setNurseRole(false)
            setPARole(true)
            setFDRole(false)
        }
        if (value === 'front desk') {
            setNurseRole(false)
            setPARole(false)
            setFDRole(true)
        }

    }

    //On Edit
    const handleStaffEditConfrim = () => {
            editStaff(elementDocId, location, staffID, "PUT", staffName, age, genderValue).then(result => {
                console.log("Staff Edit result secondary ", result);
                success()
                setOnEdit(false)
                props.refreshList()
            });
        setOnEdit(false)
    }
    //on Delete
    const error = () => {
        message
            .loading('Deleting Staff', 1.5)
            .then(() => message.success('Staff Deleted Successfully', 2.5))
    };

    const handleDeleteStaff = () => {
        setOpen(true)
    }

    return (
        <div style={{ textAlign: 'left' }}>
            {onEdit ?
                <div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                        <div className='Editsection' onClick={handleStaffEditConfrim}>
                            <label> Confirm <i> <BsCheck /> </i></label>
                        </div>
                        <div className='Editsection' onClick={() => setOnEdit(false)}>
                            <label> Cancel <i> <BsX /> </i></label>
                        </div>
                        <div className='Editsection' onClick={() => handleDeleteStaff()}>
                            <label> Delete <i> <BsTrash /> </i></label>
                        </div>
                    </div>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className='SectionList'>
                            <label> Name: </label>
                        </Col>
                        <Col lg='6' className='SectionInfo'>
                            <Input
                                className='EditInput'
                                placeholder="Add Staff Name ..."
                                type="text"
                                value={staffName}
                                onChange={(e) => setStaffName(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className='SectionList'>
                            <label> Gender: </label>
                        </Col>
                        <Col lg='6' className='SectionInfo'>
                            <Radio.Group name="gender" value={genderValue} onChange={e => setGenderValue(e.target.value)} >
                                <Radio value='male'>Male</Radio>
                                <Radio value='female'>Female</Radio>
                                <Radio value='other'>Other</Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className="SectionList">
                            <label> Dob: </label>
                        </Col>
                        <Col lg='6' className='SectionInfo'>
                            <DatePicker style={{ width: '100%' }} getPopupContainer={trigger => trigger.parentNode} defaultValue={moment(age, 'YYYY-MM-DD')} onChange={date => { setAge(date); console.log("check date format", date); }} format={'YYYY-MM-DD'} />
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className='SectionList'>
                            <label> Role: </label>
                        </Col>
                        <Col lg='6' className='SectionInfo'>

                            {/* <Checkbox.Group options={options} defaultValue={role} onChange={chooseRole} /> */}
                            <Select defaultValue={role} getPopupContainer={trigger => trigger.parentNode} onChange={chooseRole} style={{ width: '100%' }} disabled>
                                <Option value="Front Desk" >Front Desk</Option>
                                <Option value="Nurse" >Nurse</Option>
                                <Option value="Personal Assistant" >Personal Assistant</Option>
                            </Select>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className='SectionList'>
                            <label> Contact Number: </label>
                        </Col>
                        <Col lg='6' className='SectionInfo'>
                            <Input
                                className='EditInput'
                                placeholder="Add Staff Number ..."
                                type="text"
                                disabled
                                value={contact}
                                onChange={e => {
                                    const re = /^[0-9\b]+$/;
                                    console.log("Number changed: ", e.target.value)
                                    if (e.target.value === '' || re.test(e.target.value)) {
                                        console.log("Number changed after if condition: ", e.target.value)
                                        setContact(e.target.value)
                                    }
                                }} />
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className='SectionList'>
                            <label> Location: </label>
                        </Col>
                        <Col lg='6' className='SectionInfo'>
                            <Select value={location} onChange={value => { setLocation(value); console.log('loc value,', value) }} style={{ width: '100%' }} >
                                {locationData.map((item, i) => (
                                    <Option value={item.doctors_hospital_location_id} key={i} label={item.location}> {item.location} </Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Divider />
                </div>
                :
                <div >
                    <Row>
                        <Col lg='7' className='SectionList'> </Col>
                        <Col lg='4' className='SectionInfo'>
                            {accountType === "doctors" &&
                                <div className='Editsection' onClick={() => setOnEdit(true)}>
                                    <label> Edit <i> <BorderColorOutlinedIcon /> </i></label>
                                </div>}
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className='SectionList'>
                            <label> Name: </label>

                        </Col>
                        <Col lg='6' className='SectionInfo Captalize'>
                            {item.fd_info.name}
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className='SectionList'>
                            <label> Gender: </label>
                        </Col>
                        <Col lg='6' className='SectionInfo genderVal'>
                            {item.fd_info.gender}
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className='SectionList'>
                            <label> Age: </label>
                        </Col>
                        <Col lg='6' className='SectionInfo'>
                            {getDateOfBirth(item.fd_info.dob)} years
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className='SectionList'>
                            <label> Role: </label>
                        </Col>
                        <Col lg='6' className='SectionInfo'>
                            Front Desk
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className='SectionList'>
                            <label> Contact Number: </label>
                        </Col>
                        <Col lg='6' className='SectionInfo'>
                            {item.fd_info.number}
                            {/* {(item.number).includes('+92') ?  item.number :  `+92${item.number}`} */}

                        </Col>
                    </Row>
                    <Row>
                        <Col lg='1'></Col>
                        <Col lg='4' className='SectionList'>
                            <label> Location: </label>
                        </Col>
                        <Col lg='6' className='SectionInfo Captalize'>
                            {item.location}
                        </Col>
                    </Row>
                    <Divider />
                </div>
            }
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title">
                <DialogTitle id="responsive-dialog-title">{"Are you sure you want to delete this staff?"}</DialogTitle>
                <DialogActions>
                    <Button autoFocus onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAgree} color="primary" autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </div>

    )
}

export default StaffListItem
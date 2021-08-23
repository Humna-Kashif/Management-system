import React, { useContext, useState } from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { addStaff } from "../../Hooks/API";
import { capitalize, numberFormat } from '../../Hooks/TextTransform';
import { Form, Input, Select, Radio, DatePicker, message } from 'antd';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { GlobalContext } from '../../Context/GlobalState';
import CountryCodes from '../Country Codes/CountryCodes';
import codes from 'country-calling-code';
const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';

const AddStaff = (props) => {
  const [location, setLocation] = useState('')
  const locationData = props.locations
  const [open, setOpen] = useState(false);
  const [staffName, setStaffName] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [role, setRole] = useState('');
  const [genderValue, setGenderValue] = useState('');
  const [number, setNumber] = useState([]);
  const [countryCode, setCountryCode] = useState(`+${codes[159].countryCodes[0]}`);
  const { accountId } = useContext(GlobalContext)

  //Dialog Functions
  const handleClose = () => {
    setOpen(false);
  };
  //Gender Value Change
  const onGenderChange = (e) => {
    console.log("gender value is ", e.target.value);
    setGenderValue(e.target.value);
  }
  //Location Value Change
  const onLocationChange = (value) => {
    console.log('Selected Location Value is', value)
    setLocation(value)
  }
  //Dob Selection
  const onDateChange = (date, dateString) => {
    console.log('date', dateString);
    setStartDate(dateString)
  }
  //Role Selection
  const onChange = (value) => {
    console.log(`selected ${value}`);
    setRole(value)
  }
  //Validate Messages
  const validateMessages = {
    required: '${name} required!',
  };
  //Adding Staff
  const handleAddStaff = (number, location, name, dob, role, gender) => {
    let regex = /^\s$/;
    if (
      (number.length !== 0 && !number.match(regex)) &&
      (location !== "") &&
      (name.length !== 0 && !name.match(regex)) &&
      (dob !== "") &&
      (role !== "") &&
      (gender !== "")) {
      setOpen(true);
    }
  }

  const handleDuplicateStaff = (role,phoneNumber,location) => {
    let roleArray = [];
    roleArray = role === 'front desk' ? props.StaffList.staff_fd :
      role === 'nurse' ? props.StaffList.staff_nurse :
        props.StaffList.staff_pa
    for(let i=0;i<roleArray.length;i++){
      if(role === 'nurse'){
        if(roleArray[i].nurse_info.number === phoneNumber && roleArray[i].doctors_hospital_location_id == location)
        return true
      } else if(role === 'front desk'){
        if(roleArray[i].fd_info.number === phoneNumber && roleArray[i].doctors_hospital_location_id == location)
        return true
      } else if(role === 'personal assistant'){
        if(roleArray[i].pa_info.number === phoneNumber && roleArray[i].doctors_hospital_location_id == location)
        return true
      } else return false
    }
    // console.log("Staff list in addStaff ", props.StaffList, roleArray, role);
  }

  //onClickedAgree
  const handleAgree = () => {
    console.log('results areeee', accountId, location, "POST", staffName, startDate, genderValue, number, role)
    let phoneNumber = countryCode + number;
    if(handleDuplicateStaff(role,phoneNumber,location))
       message.error("Failed ! This staff number is already exsist on this location")
    else{
      addStaff(accountId,location,"POST",staffName,startDate,genderValue,countryCode + number,role).then(result => {
        console.log("Staff added result ", result);
          if(result.code === 404){
            message.error('Staff not added');
            setStaffName('');
            setStartDate('')
            setGenderValue('');
            setRole('');
            setNumber('');
          }
          else{
            props.refreshList();
            success();
            setStaffName('');
            setStartDate('');
            setGenderValue('');
            setRole('');
            setNumber('');
          }
        });
    }
    setOpen(false);
    props.hide();
  }
  //On Success Message
  const success = () => {
    message.loading('Adding Staff', 1.5)
      .then(() => message.success('Staff Added Successfully', 2.5))
  };
  return (
    <Modal
      show={props.show}
      onHide={props.hide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className='ModalTitle'>
          Add New Staff
        </Modal.Title>
      </Modal.Header>
      <Form validateMessages={validateMessages}>
        <Modal.Body>
          <div>
            <Row>
              <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                Phone Number:
              </Col>
              <Col lg={8} className='SectionInfo'>
                <Form.Item name={'Contact Number'} rules={[{ required: true, type: 'string', whitespace: true }]}>
                  <Input addonBefore={<CountryCodes returnHook={setCountryCode} defaultCode={countryCode} data={codes} />} name='number' rules={[{ required: true }]} placeholder='3001234567' onChange={(e) => setNumber(numberFormat(e.target.value))} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                Location:
              </Col>
              <Col lg={8} className='SectionInfo'>
                <Form.Item name={'Location'} rules={[{ required: true }]}>
                  <Select
                    showSearch
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Staff Location"
                    onChange={onLocationChange}
                    optionLabelProp="label"
                    notFoundContent={
                      <div className='text-center' style={{ padding: 8 }}>
                        No Result Found
                      </div>
                    }
                    filterOption={(input, option) =>
                      option.children.toString().toLowerCase().indexOf(input.toString().toLowerCase()) >= 0
                    }>
                    {locationData.map((item, i) => (
                      <Option value={item.doctors_hospital_location_id} key={i} label={item.location}> {item.location} </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                Name:
              </Col>
              <Col lg={8} className='SectionInfo'>
                <Form.Item name={'Name'} rules={[{ required: true, type: 'string', whitespace: true }]}>
                  <Input
                    className='EditInput'
                    placeholder="Add Staff Name ..."
                    value={staffName}
                    noValidate
                    onChange={(e) => setStaffName(capitalize(e.target.value))} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                Dob:
              </Col>
              <Col lg={8} className='SectionInfo'>
                <Form.Item name={'Dob'} rules={[{ required: true }]}>
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    onChange={onDateChange}
                    format={dateFormat}
                    style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                Role:
              </Col>
              <Col lg={8} className='SectionInfo'>
                <Form.Item name={'Role'} rules={[{ required: true }]}>
                  <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Select a role"
                    optionFilterProp="children"
                    onChange={onChange}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    <Option value="front desk">Front Desk</Option>
                    <Option value="nurse">Nurse</Option>
                    <Option value="personal assistant">Personal Assistant</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                Gender:
              </Col>
              <Col lg={8} className='SectionInfo'>
                <Form.Item name={'Gender'} rules={[{ required: true }]}>
                  <Radio.Group name="gender" onChange={onGenderChange}>
                    <Radio value='male'>Male</Radio>
                    <Radio value='female'>Female</Radio>
                    <Radio value='other'>Other</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Form.Item >
            <Button variant="outline-secondary" onClick={props.hide} style={{ marginRight: "10px" }}>
              Cancel
            </Button>
          </Form.Item>
          <Form.Item >
            <Button variant="primary" type="submit" onClick={() => { handleAddStaff(number, location, staffName, startDate, role, genderValue) }}>
              Add Staff
            </Button>
          </Form.Item>
        </Modal.Footer>
      </Form>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">{"Are you sure you want to add staff?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are trying to add staff named: <b>{staffName}</b>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAgree} color="primary" autoFocus> Yes </Button>
        </DialogActions>
      </Dialog>
    </Modal>
  )
}

export default AddStaff;
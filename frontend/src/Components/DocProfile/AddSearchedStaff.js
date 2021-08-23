import React, { useContext, useState } from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { addStaff} from "../../Hooks/API";
import { Form,Select,message} from 'antd';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import moment from 'moment';
import { GlobalContext } from '../../Context/GlobalState';
const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';

const AddSearchedStaff = (props) => {
  console.log('Values to be added are for modal', props.data)
  const [location, setLocation] = useState('')
  const locationData = props.locations
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('');
  const { accountId } = useContext(GlobalContext)

  //Dialog Functions
  const handleClose = () => {
    setOpen(false);
  };
  //On Adding
  const success = () => {
    message.loading('Adding Staff', 1.5)
      .then(() => message.success('Staff Added Successfully', 2.5))
  };

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

  //On Agree
    const handleAgreeNewStaff = () => {
      if(handleDuplicateStaff(role,props.data.number,location)){
        message.error("Failed ! This staff number is already exsist on this location")
      } else {
        console.log('results areeee', accountId, location, "POST", props.data.name, moment(props.data.dob, dateFormat), props.data.gender, props.data.number, role)
        addStaff(accountId, location, "POST", props.data.name, moment(props.data.dob, dateFormat), props.data.gender, props.data.number, role).then(result => {
          console.log("Staff added result ", result);
          if (result.code === 404) {
            message.error('Staff not added');
            setRole('')
            setLocation('')
          }
          else {
            props.refreshList();
            success();
            setRole('')
            setLocation('')
          }
        });
      }
      setOpen(false);
      props.hide();
    }
  //On Location Selection
  const onLocationChange = (value) => {
    console.log('Selected Location Value is', value)
    setLocation(value)
  }

  

  //Adding Staff
  const handleAddStaff = (location, role) => {
      console.log('values to be validated', location, role)
      if (
        (location !== "") &&
        (role !== "")) {
        setOpen(true);
      }
  }
  //On Role Selection
  const onChange = (value) => {
    console.log(`selected ${value}`);
    setRole(value)
  }
  //Validate Messages
  const validateMessages = {
    required: '${name} required!',
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
          Add Existing Staff
        </Modal.Title>
      </Modal.Header>
      <Form validateMessages={validateMessages} initialValues={{ Number: props.data.number, Name: props.data.name, Dob: moment(props.data.dob, dateFormat), Gender: props.data.gender }}>
        <Modal.Body>
          {props.data !== null && <div>
            <Row>
              <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                Name:
              </Col>
              <Col lg={8} className='SectionInfo'>
                <h6> {props.data.name}</h6>
              </Col>
            </Row>
            <Row>
              <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                Number:
              </Col>
              <Col lg={8} className='SectionInfo'>
                <h6>  {props.data.number} </h6>
              </Col>
            </Row>
            <Row>
              <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                Gender:
              </Col>
              <Col lg={8} className='SectionInfo'>
                <h6 style={{ textTransform: 'capitalize' }}>{props.data.gender}</h6>
              </Col>
            </Row>
            <Row>
              <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                Dob:
              </Col>
              <Col lg={8} className='SectionInfo'>
                <h6>{props.data.dob && (props.data.dob).split("T")[0]} </h6>
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


          </div>
          }
        </Modal.Body>
        <Modal.Footer>
          <Form.Item >
            <Button variant="outline-secondary" onClick={props.hide} style={{ marginRight: "10px" }}>
              Cancel
            </Button>
          </Form.Item>
          <Form.Item >
            <Button variant="primary" type="submit" onClick={() => {handleAddStaff(location,role) }}>
              Add Staff
            </Button>
          </Form.Item>
        </Modal.Footer>
      </Form>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">{"Are you sure you want to add staff?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are trying to add staff named: <b>{props.data.name}</b>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAgreeNewStaff} color="primary" autoFocus> Yes </Button>
        </DialogActions>
      </Dialog>
    </Modal>
  )
}

export default AddSearchedStaff;

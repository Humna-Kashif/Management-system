import React, { Fragment, useState, useEffect, useContext } from 'react';
import { Modal, Form, Input, Spin, message, Avatar } from 'antd';
import { Col, Row } from 'react-bootstrap';
import AddIcon from '@material-ui/icons/Add';
import '../../../Styles/AdminPanel.css';
import { getAllDoctorsAPI, addDoctorAPI, deleteDoctorAPI, editDoctorAPI } from '../../../Hooks/API';
import { BsFillTrashFill } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { GlobalContext } from '../../../Context/GlobalState'

const Doctors = () => {
  const { accountId } = useContext(GlobalContext);
  const [addDoctor, setAddDoctor] = useState(false);
  const [doctorList, setDoctorList] = useState([]);
  const [loader, setLoader] = useState(true);
  const [editDoctor, setEditDoctor] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [form] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = (doctor_id, name) => {
    setIsModalVisible(true);
    setId(doctor_id);
    setName(name);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    deleteDoctor(id)
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderConfirmationModal = () => {
    return <Modal title="Delete Doctor" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <p>Are you sure you want to delete this doctor named <b>{name}</b></p>
    </Modal>
  }
  //showModals
  const handleShow = () => {
    setAddDoctor(true)
  }
  //hideModal
  const handleHide = () => {
    setAddDoctor(false)
  }

  //showModal
  const handleEditShow = (id, name, number) => {
    setId(id);
    setName(name);
    setNumber(number);
    setEditDoctor(true)
  }
  //hideModal
  const handleEditHide = () => {
    setName("");
    setEditDoctor(false)
  }

  //Add Doctor
  const handleAdd = (values) => {
    let count = 0;
    for (let i = 0; i < doctorList.length; i++) {
      if (doctorList[i].number === "+92" + values.contact) {
        count++;
      }
    }
    if (count === 1) {
      message.error("Failed! Doctor Already Exist");
    }
    else if (count === 0) {
      if (values.number !== "") {
        addDoctorAPI(accountId, values.doctor_name, "+92" + values.contact).then(result => {
          console.log("Add Doctor result", result);
          if (result === "Doctor Added Successfully!") {
            message.success("New Doctor Added Successfully");
            doctorInfo();
          }
          else message.error("Doctor Addition Failed " + result.message)
        });
      }
    }
    else {
      alert(count);
    }
    setAddDoctor(false)
  }

  const deleteDoctor = (doc_id) => {
    console.log("doctor id is ", doc_id)
    if (doc_id !== null) {
      deleteDoctorAPI(accountId, doc_id).then(result => {
        console.log("Delete doctor result is ", result);
        if (result === "Operation Successful") {
          message.success("Doctor deleted successfully")
          doctorInfo();
        }
        else message.error("Deletion Failed")
      })
    }
    else message.error("Deletion Failed! Doctor id can't b null");
  }

  const editDoctorData = () => {
    console.log("parameters are ", accountId, id, name, number);
    if (id !== null || name !== "" || number !== "") {
      editDoctorAPI(accountId, id, name, number).then(result => {
        console.log("edit doctor result is ", result);
        if (result === "Doctor Updated Successfully!") {
          message.success("doctor edited successfully")
          doctorInfo();
          setEditDoctor(false);
        }
        else message.error("Editing Failed")
      })
    }
    else message.error("Editing Failed! All parameters should be filled");
  }

  //Get Doctor List
  const doctorInfo = () => {
    getAllDoctorsAPI(accountId).then(result => {
      console.log("Doctors list", result);
      setDoctorList(result);
      setLoader(false);
    });
  }

  const OnNameChange = (e) => {
    setName(e.target.value);
  }

  const OnNummberChange = (e) => {
    setNumber(e.target.value);
  }

  const editDoctorModal = () => {
    return <Modal title="Edit Doctor" visible={editDoctor} onOk={editDoctorData} onCancel={handleEditHide}>
      <Row>
        <Col lg='3' className='SectionList'>
          <label> Name: </label>
        </Col>
        <Col lg='8' className='SectionInfo'>
          <Input
            name="Name"
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={OnNameChange} />
        </Col>
        <Col lg='3' className='SectionList'>
          <label> Number: </label>
        </Col>
        <Col lg='8' className='SectionInfo'>
          <Input
            name="Number"
            type="text"
            placeholder="Enter number"
            value={number}
            onChange={OnNummberChange} />
        </Col>
      </Row>
    </Modal>
  }

  useEffect(() => {
    doctorInfo();
  }, []);

  return (
    <Fragment>
      <h6 className='ColHeader'> MANAGE DOCTORS </h6>
      <div className='MainCont' >
        <div className='Editsection' onClick={handleShow}>
          <label> Add New Doctor
            <i>
              <AddIcon style={{ height: 20, width: 20, marginBottom: 4 }} />
            </i>
          </label>
        </div>
        {loader ? <Spin /> : <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <label className="list-label"> Doctors List </label>
          {doctorList.map((item, i) => (
            <div className='AdminCont' key={i}>

              <Avatar
                width={200}
                height={200}
                style={{
                  borderRadius: '50%',
                  float: 'left',
                  marginRight: '10px',
                  marginTop: '2px',
                  width: '40px',
                  height: '40px'
                }}
              />

              <h5 className="NameHead" style={{ marginTop: '4px' }}> {item.name} </h5>
              <label className='listPrice'>  {item.number} </label>
              <div className='listIcon'>
                <BsFillTrashFill onClick={() => { showModal(item.doctor_id, item.name) }} />
                <FaEdit className='EditIconList' onClick={() => { handleEditShow(item.doctor_id, item.name, item.number) }} />
              </div>

            </div>

          ))}
        </div>
        }
        {renderConfirmationModal()}
        {editDoctorModal()}
        <Modal
          visible={addDoctor}
          title="Add a new doctor"
          okText="Add"
          cancelText="Cancel"
          onCancel={() => {
            handleHide();
            form.resetFields();
          }}
          onOk={() => {
            form
              .validateFields()
              .then((values) => {
                form.resetFields();
                handleAdd(values);
              })
              .catch((info) => {
                console.log('Validate Failed:', info);
              });
          }}
        >
          <Form
            form={form}
            layout="vertical"
            name="form_in_modal"
            initialValues={{
              modifier: 'public',
            }}
          >
            <Form.Item
              name="doctor_name"
              label="Name"
              rules={[
                {
                  required: true,
                  message: 'Please input doctor name!',
                },
              ]}
            >
              <Input placeholder='Enter Doctor Name' />
            </Form.Item>
            <Form.Item
              name="contact"
              label="Contact"
              rules={[
                {
                  required: true,
                  message: 'Please input doctor contact number!',
                },
              ]}
            >
              <Input addonBefore='+92' placeholder='Enter Contact Number' />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Fragment>
  )
}

export default Doctors;
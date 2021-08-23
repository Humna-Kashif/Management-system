import React, { Fragment, useState, useEffect, useContext } from 'react';
import { Modal, Form, Input, Spin, message, Avatar,Select } from 'antd';
import { Col, Row } from 'react-bootstrap';
import AddIcon from '@material-ui/icons/Add';
import { getAllAdminsAPI, addAdminAPI, deleteAdminAPI, editAdminAPI } from '../../../Hooks/API'
import {numberFormat,capitalize} from '../../../Hooks/TextTransform';
import { BsFillTrashFill } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { GlobalContext } from '../../../Context/GlobalState'
import '../../../Styles/AdminPanel.css'
import "../../../Styles/txtStyles.scss"
import "../../../Styles/Avatars.scss"
import "../../../Styles/IconStyles.scss"
import CountryCodes from '../../Country Codes/CountryCodes';
import codes from 'country-calling-code';
const {Option} = Select
const Admins = (props) => {
  const { accountId } = useContext(GlobalContext)
  const [addAdmin, setAddAdmin] = useState(false);
  const [editAdmin, setEditAdmin] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [adminList, setAdminList] = useState([]);
  const [loader, setLoader] = useState(true);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countryCode,setCountryCode] = useState(`+${codes[159].countryCodes[0]}`)

  const showModal = (admin_id, name) => {
    setIsModalVisible(true);
    setId(admin_id);
    setName(name);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    deleteAdmin(id);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderConfirmationModal = () => {
    return <Modal title="Delete Admin" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <p>Are you sure you want to delete this admin named <b>{name}</b></p>
    </Modal>
  }
  //showModal
  const handleShow = () => {
    setAddAdmin(true)
  }
  //hideModal
  const handleHide = () => {
    setAddAdmin(false)
  }

  //showModal
  const handleEditShow = (id, name, number) => {
    setId(id);
    setName(name);
    setNumber(number);
    setEditAdmin(true)
  }
  //hideModal
  const handleEditHide = () => {
    setName("");
    setEditAdmin(false)
  }

  //AddAdmin
  const handleAdd = (values) => {
    let count = 0;
    for (let i = 0; i < adminList.length; i++) {
      if (adminList[i].number === countryCode + values.contact) {
        count++;
      }
    }
    if (count === 1) {
      message.error("Failed! Admin Already Exsist");
    }
    else if (count === 0) {
      if (values.number !== "") {
        addAdminAPI(accountId, capitalize(values.admin_name), countryCode + numberFormat(values.contact)).then(result => {
          console.log("Add Admin result", result);
          if (result === "Admin Added Successfully!") {
            message.success("New Admin Added Successfully");
            adminInfo();
          }
          else message.error("Admin Addition Failed " + result.message)
        });
      }
    }
    setAddAdmin(false)
  }

  //Get Admin List
  const adminInfo = () => {
    console.log("accountId is ", accountId);
    getAllAdminsAPI(0).then(result => {
      console.log("Admins list", result);
      setAdminList(result);
      setLoader(false)
    });
  }

  const deleteAdmin = (admin_id) => {
    if (admin_id !== accountId && admin_id !== "") {
      deleteAdminAPI(admin_id).then(result => {
        console.log("Delete admin result is ", result);
        if (result === "Operation Successful") {
          message.success("Admin deleted successfully")
          adminInfo();
        }
        else message.error("Deletion Failed")
      })
    }
    else message.error("Deletion Failed! User is logedIn");
  }

  const editAdminData = () => {
    console.log("parameters are ", id, name, number);
    if (id !== null || name !== "" || number !== "") {
      editAdminAPI(id, name, number).then(result => {
        console.log("edit admin result is ", result);
        if (result === "Admin Updated Successfully!") {
          message.success("Admin edited successfully")
          adminInfo();
          setEditAdmin(false);
        }
        else message.error("Editing Failed")
      })
    }
    else message.error("Editing Failed! All parameters should b filled");
  }

  const addNewAdminModal = () => {
    return <Modal
      visible={addAdmin}
      title="Add a new admin"
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
          name="admin_name"
          label="Name"
          rules={[
            {
              required: true,
              message: 'Please input admin name!',
            },
          ]}
        >
          <Input placeholder='Enter Admin Name' />
        </Form.Item>
        <Form.Item
          name="contact"
          label="Contact"
          rules={[
            {
              required: true,
              message: 'Please input admin contact number!',
            },
          ]}
        >
          <Input addonBefore={<CountryCodes returnHook={setCountryCode} defaultCode={countryCode} data={codes}/>} placeholder='Enter Contact Number' />
        </Form.Item>
      </Form>

    </Modal>
  }

  const OnNameChange = (e) => {
    setName(capitalize(e.target.value));
  }

  const OnNummberChange = (e) => {
    setNumber(e.target.value);
  }


  const editAdminModal = () => {
    return <Modal title="Edit Admin" visible={editAdmin} onOk={editAdminData} onCancel={handleEditHide}>
      <Row>
        <Col lg='3' className='SectionList'>
          <label> Name: </label>
        </Col>
        <Col lg='8'>
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
    adminInfo();
  }, []);

  return (
    <Fragment>
      <h6 className='ColHeader'> MANAGE ADMINS </h6>
      <div className='MainCont' >
        <div className='Editsection' onClick={handleShow}>
          <label> Add New Admin
            <i>
              <AddIcon className={"AddIconBtn"}/>
            </i>
          </label>
        </div>
        {loader ? <Spin /> : <div className='ListingsCont'>
          <label className="list-label"> Admin List </label>
          {adminList.map((item, i) => (
            <div className='AdminCont' key={i}>
              <Avatar width={200} height={200} className="ListAvatars"/>
              <h5 className="NameHead mtt-4"> {item.name}  </h5>
              <label className='listPrice'> {item.number} </label>
              <div className='listIcon'>
                {item.admin_id === accountId ? "" : <BsFillTrashFill onClick={() => { showModal(item.admin_id, item.name) }} />}
                <FaEdit className='EditIconList' onClick={() => { handleEditShow(item.admin_id, item.name, item.number) }} />
              </div>
            </div>
          ))}
        </div>}
        {renderConfirmationModal()}
        {addNewAdminModal()}
        {editAdminModal()}
      </div>
    </Fragment>
  )
}

export default Admins;
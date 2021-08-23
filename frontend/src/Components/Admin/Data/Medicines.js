import React, { Fragment, useState, useEffect, useContext } from 'react';
import { Modal, Form, Input, Button, Divider, Spin, message } from 'antd';
import { Col, Row } from 'react-bootstrap';
import { BsFillTrashFill } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import CheckIcon from '@material-ui/icons/Check';
import AddIcon from '@material-ui/icons/Add';
import '../../../Styles/AdminPanel.css'
import { searchMedicinesAPI, addNewMedicineAPI, deleteMedicineItemAPI, editMedicineItemAPI, verifiyRandomMedicine } from '../../../Hooks/API'
import { GlobalContext } from '../../../Context/GlobalState'

const Medicines = () => {
  const { accountId } = useContext(GlobalContext);
  const [addMedicine, setAddMedicine] = useState(false);
  const [medicineList, setMedicineList] = useState([]);
  const [list, setList] = useState([]);
  const [hasMore, setHasMore] = useState("");
  const [loader, setLoader] = useState(true);
  const [search, setSearch] = useState("");
  const [medicine, setMedicine] = useState([]);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [grams, setGrams] = useState("");
  const [editMedicine, setEditMedicine] = useState(false);
  const [searchMore, setSearchMore] = useState("");
  const [form] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = (id, name) => {
    setIsModalVisible(true);
    setId(id);
    setName(name);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    deleteMedicine(id);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderConfirmationModal = () => {
    return <Modal title="Delete Medicine" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <p>Are you sure you want to delete this Medicine named <b>{name}</b></p>
    </Modal>
  }
  //showModal
  const handleShow = () => {
    setAddMedicine(true)
  }
  //hideModal
  const handleHide = () => {
    setAddMedicine(false)
  }

  //showeditModal
  const handleEditShow = (id, name, type, price, gram) => {
    setId(id);
    setName(name);
    setType(type);
    setPrice(price);
    setGrams(gram);
    setEditMedicine(true);
  }
  //hideEditModal
  const handleEditHide = () => {
    setName("");
    setEditMedicine(false);
  }

  //AddMedicine
  const handleAdd = (values) => {
    let count = 0;
    for (let i = 0; i < medicineList.length; i++) {
      if (medicineList[i].name.toLowerCase() === values.medicine_name.toLowerCase()) {
        count++;
      }
    }
    if (count === 1) {
      message.error("Failed! Medicine Already Exsist");
    }
    else if (count === 0) {
      console.log("count value is ", count)
      addNewMedicineAPI(accountId, values.medicine_name, values.type, values.price, values.strength).then(result => {
        console.log("Add Medicine result", result);
        if (result === "Operation Successful") {
          message.success("New Medicine Added Successfully");
          medicineInfo();
        }
        else message.error("Medicine Addition Failed " + result.message)
      });
    }
    else {
      alert(count);
    }
    setAddMedicine(false)
  }

  const deleteMedicine = (id) => {
    deleteMedicineItemAPI(accountId, id).then(result => {
      console.log("Delete Medicine result ", result)
      if (result.message === "API Error") {
        message.error("Failed! API error");
      } else {
        message.success("Delete Medicine successfully");
        medicineInfo();
      }

    });
  }

  const OnNameChange = (e) => {
    setName(e.target.value);
  }

  const OnTypeChange = (e) => {
    setType(e.target.value);
  }

  const OnPriceChange = (e) => {
    setPrice(e.target.value);
  }

  const OnGramsChange = (e) => {
    setGrams(e.target.value);
  }

  const editMedicineData = () => {
    console.log("id is ", accountId, id);
    editMedicineItemAPI(accountId, id, name, type, price, grams).then(result => {
      console.log("Edit Medicine result ", result)
      if (result) {
        message.success("Medicine edit successfully");
        medicineInfo();
      }
    });
    setEditMedicine(false);
  }
  const verify = (value) => {
    verifiyRandomMedicine(accountId, value).then(result => {
      medicineInfo();
      // if(result.code === "404"){
      console.log("Status Updated Succesfully", result);
      // }
    });
  }

  const editMedicineModal = () => {
    return <Modal title="Edit Test" visible={editMedicine} onOk={editMedicineData} onCancel={handleEditHide}>
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
          <label> Type: </label>
        </Col>
        <Col lg='8' className='SectionInfo'>
          <Input
            name="Type"
            type="text"
            placeholder="Enter type"
            value={type}
            onChange={OnTypeChange} />
        </Col>
        <Col lg='3' className='SectionList'>
          <label> Price: </label>
        </Col>
        <Col lg='8' className='SectionInfo'>
          <Input
            name="Price"
            type="text"
            placeholder="Enter price"
            value={price}
            onChange={OnPriceChange} />
        </Col>
        <Col lg='3' className='SectionList'>
          <label> Grams: </label>
        </Col>
        <Col lg='8' className='SectionInfo'>
          <Input
            name="Grams"
            type="text"
            placeholder="Enter gram"
            value={grams}
            onChange={OnGramsChange} />
        </Col>
      </Row>
    </Modal>
  }

  //Get Medicines List
  const medicineInfo = () => {
    searchMedicinesAPI(0, 0, 0, "").then(result => {
      console.log("Medicines list", result);
      setMedicineList(result);
      setMedicine(result);
      let List = [...result.slice(0, 60)]
      setList(List);
      setLoader(false);
      setHasMore(result.length > 60)
      setSearchMore(result.length > 60);
    });
  }

  const loadMore = () => {
    if (hasMore) {
      const currentLength = list.length;
      const isMore = currentLength < medicine.length;
      const nextResult = isMore ? medicine.slice(currentLength, currentLength + 60) : [];
      setList([...list, ...nextResult]);
    }
    setHasMore(list.length < medicine.length);
  }

  useEffect(() => {
    medicineInfo();
  }, []);
  return (
    <Fragment>
      <h6 className='ColHeader'> MANAGE MEDICINES </h6>
      <div className='MainCont' >
        <div className='Editsection' onClick={handleShow}>
          <label> Add New Medicine
        <i>
              <AddIcon style={{ height: 20, width: 20, marginBottom: 4 }} />
            </i>
          </label>
        </div>
        {loader ? <Spin /> : <div className='diagnosis_container'>
          <label className="list-label"> Medicines List </label>
          <Input className="search-list"
            placeholder="Search Medicine here"
            onChange={e => {
              const medicineResult = medicineList.filter(item => {
                return item.name.toLowerCase().includes(e.target.value.toLowerCase());
              });
              if (medicineResult) {
                console.log("my list is ", medicineResult);
                if (searchMore) {
                  if (medicineResult.length > 60) {
                    setList(medicineResult.slice(0, 60));
                    setHasMore(true);
                  }
                  else {
                    setList(medicineResult);
                    setHasMore(false);
                  }
                }
              }
              setSearch(e.target.value);
            }}
            type="text"
            value={search} />
          <div className="list-Table" >
            {list.map((item, i) => (
              <div className='DivCont listPadding'>
                <h6 className="NameHead"> {item.name} ({item.strength})  </h6>
                <label className='listPrice'> {item.medicine_type} PKR:{item.price}  </label>
                <div className='listIcon'>
                  {item.verified === false && <CheckIcon onClick={() => verify(item.medicine_id)} />}
                  <BsFillTrashFill className='EditIconList' onClick={() => { showModal(item.medicine_id, item.name) }} />
                  <FaEdit className='EditIconList'
                    onClick={() => { handleEditShow(item.medicine_id, item.name, item.medicine_type, item.price, item.strength) }} /> </div>
              </div>
            ))}
          </div>
          {hasMore ?
            (
              <div className="text-center">
                <Button size='small' style={{ color: 'grey', marginBottom: 10, marginTop: 2 }} type='default' onClick={loadMore}>Load More</Button>
              </div>
            )
            :
            (
              <p style={{ color: 'grey', marginBottom: 3, marginTop: 2, textAlign: "center" }}>
                <Divider />
                  No more results
              </p>
            )
          }
        </div>}
        {renderConfirmationModal()}
        {editMedicineModal()}
        <Modal
          visible={addMedicine}
          title="Add a new mecines"
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
              name="medicine_name"
              label="Name"
              rules={[
                {
                  required: true,
                  message: 'Please input medicine name!',
                },
              ]}
            >
              <Input placeholder='Enter Medicine Name' />
            </Form.Item>
            <Form.Item
              name="type"
              label="Type"
              rules={[
                {
                  required: true,
                  message: 'Please input type!',
                },
              ]}
            >
              <Input placeholder='Enter Test Type' />
            </Form.Item>
            <Form.Item
              name="price"
              label="Price"
              rules={[
                {
                  required: true,
                  message: 'Please input price',
                },
              ]}
            >
              <Input placeholder='Enter Medicine Price' />
            </Form.Item>
            <Form.Item
              name="strength"
              label="Strength"
              rules={[
                {
                  required: true,
                  message: 'Please input strength',
                },
              ]}
            >
              <Input placeholder='Enter Medicine Strength' />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Fragment>
  )
}

export default Medicines;
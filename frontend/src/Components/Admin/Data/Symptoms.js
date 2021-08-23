import React, { Fragment, useState, useEffect, useContext } from 'react';
import { Modal, Form, Input, Button, Divider, Spin, message } from 'antd';
import { Col, Row } from 'react-bootstrap';
import { BsFillTrashFill } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import '../../../Styles/AdminPanel.css'
import { searchSymptomAPI, addSymptomAPI, deleteSymptomItemAPI,editSymptomItemAPI,verifiyRandomSymptoms } from '../../../Hooks/API'
import {GlobalContext} from '../../../Context/GlobalState'

const Symptoms = () => {
  const {accountId} = useContext(GlobalContext);
  const [addSymptom, setAddSymptom] = useState(false);
  const [symptomList, setSymptomList] = useState([]);
  const [list, setList] = useState([]);
  const [hasMore, setHasMore] = useState("");
  const [loader, setLoader] = useState(true);
  const [search, setSearch] = useState("");
  const [editSymptom, setEditSymptom] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [searchMore, setSearchMore] = useState("");
  const [form] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = (id,name) => {
    setIsModalVisible(true);
    setId(id);
    setName(name);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    deleteSymptom(id)
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderConfirmationModal = () =>{
    return <Modal title="Delete Symptom" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>Are you sure you want to delete this Symptom named <b>{name}</b></p>
      </Modal>
  }

  //showModal
  const handleShow = () => {
    setAddSymptom(true)
  }
  //hideModal
  const handleHide = () => {
    setAddSymptom(false)
  }

  //showeditModal
  const handleEditShow = (id, name,type) => {
    console.log("id is ",id)
    setId(id);
    setName(name);
    setType(type);
    setEditSymptom(true)
  }
  //hideeditModal
  const handleEditHide = () => {
    setName("");
    setEditSymptom(false)
  }

  //AddAdmin
  const handleAdd = (values) => {
    let count = 0;
    for (let i = 0; i < symptomList.length; i++) {
      if (symptomList[i].name.toLowerCase() === values.symptom_name.toLowerCase()) {
        count++;
      }
    }
    if (count === 1) {
      message.error("Failed! Symptom Already Exsist");
    }
    else if (count === 0) {
      addSymptomAPI(accountId, values.symptom_name, values.type).then(result => {
        console.log("Add Symptom result", result);
        if (result === "Operation Successful") {
          message.success("New Symptom Added Successfully");
          symptomInfo();
        }
        else message.error("Symptom Addition Failed " + result.message)
      });
    }
    else {
      alert(count);
    }
    setAddSymptom(false)
  }

  //Get Admin List
  const symptomInfo = () => {
    searchSymptomAPI(0, 0, 0, "").then(result => {
      console.log("Symptoms list", result);
      setSymptomList(result);
      let List = [...result.slice(0, 60)]
      setList(List);
      setLoader(false);
      setHasMore(result.length > 60);
      setSearchMore(result.length > 60);
    });
  }

  const loadMore = () => {
    if (hasMore) {
      const currentLength = list.length;
      const isMore = currentLength < symptomList.length;
      const nextResult = isMore ? symptomList.slice(currentLength, currentLength + 60) : [];
      setList([...list, ...nextResult]);
    }
    setHasMore(list.length < symptomList.length);
  }

  const deleteSymptom = (id) => {
    console.log("id is ", id);
    deleteSymptomItemAPI(accountId, id).then(result => {
      console.log("Delete Symptom result ", result)
      if (result) {
        message.success("Delete Symptom successfully");
        symptomInfo();
      }
    });
  }

  const editSymptomData = () => {
    console.log("id is ",accountId,id);
    editSymptomItemAPI(accountId, id, name, type).then(result => {
      console.log("Edit Symptom result ", result)
      if(result.message==="API Error") {
        message.error("Failed! API error");
      }else{
        message.success("Symptom edit successfully");
        symptomInfo();
      }
    });
    setEditSymptom(false);
  }

  const OnNameChange = (e) => {
    setName(e.target.value);
  }

  const OnTypeChange = (e) => {
    setType(e.target.value);
  }
  const verify =(value)=>{
    verifiyRandomSymptoms(accountId, value).then(result => {
      symptomInfo();
      console.log("Status Updated Succesfully", result);
    });
  }

  const editSymptomModal = () => {
    return <Modal title="Edit Symptom" visible={editSymptom} onOk={editSymptomData} onCancel={handleEditHide}>
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
      </Row>
    </Modal>
  }

  useEffect(() => {
    symptomInfo();
  }, []);
  return (
    <Fragment>
      <h6 className='ColHeader'> MANAGE SYMPTOMS </h6>
      <div className='MainCont' >
        <div className='Editsection' onClick={handleShow}>
          <label> Add New Symptom
          <i>
              <AddIcon style={{ height: 20, width: 20, marginBottom: 4 }} />
            </i>
          </label>
        </div>
        {loader ? <Spin /> : <div className='diagnosis_container'>
          <label className="list-label"> Symptoms List </label>
          <Input className="search-list"
            placeholder="Search Medicine here"
            onChange={e => {
              const symptomResult = symptomList.filter(item => {
                return item.name.toLowerCase().includes(e.target.value.toLowerCase());
              });
              if (symptomResult) {
                console.log("my list is ", symptomResult);
                if (searchMore) {
                  if (symptomResult.length > 60) {
                    setList(symptomResult.slice(0, 60));
                    setHasMore(true);
                  }
                  else {
                    setList(symptomResult);
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

              <div className='DivCont' key={i}>
                <h5 className="NameHead"> {item.name}  </h5>
                <label className='listPrice'> {item.symptom_type} </label>
                <div className='listIcon'> 
                {item.verified === false && <CheckIcon onClick={() => verify(item.symptom_id)} />  }
                <BsFillTrashFill className='EditIconList' onClick={() => { showModal(item.symptom_id,item.name) }} />  
                <FaEdit className='EditIconList' onClick={() => { handleEditShow(item.symptom_id,item.name,item.symptom_type) }} />  </div>
              </div>
            ))}

          </div>
          {hasMore ?
            (
              <div className="text-center">
                <Button size='small' style={{ color: 'grey', marginBottom: 10, marginTop: 2 }}
                  type='default'
                  onClick={loadMore}>
                  Load More
                </Button>
              </div>
            )
            :
            (
              <p style={{ color: 'grey', marginBottom: 3, marginTop: 2, textAlign: 'center' }}>
                <Divider />
                      No more results
              </p>
            )
          }
        </div>

        }
        {renderConfirmationModal()}
        {editSymptomModal()}
        <Modal
          visible={addSymptom}
          title="Add a new symptom"
          okText="Add"
          cancelText="Cancel"
          onCancel={()=>{handleHide();
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
              name="symptom_name"
              label="Name"
              rules={[
                {
                  required: true,
                  message: 'Please input symptom name!',
                },
              ]}
            >
              <Input placeholder='Enter Symptom Name' />
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
              <Input placeholder='Enter Symptom Type' />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Fragment>
  )
}

export default Symptoms;
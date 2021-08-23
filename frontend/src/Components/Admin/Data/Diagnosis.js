import React, { Fragment, useState, useEffect, useContext } from 'react';
import { Modal, Form, Input, Button, Divider, Spin, message } from 'antd';
import { Col, Row } from 'react-bootstrap';
import { BsFillTrashFill } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import AddIcon from '@material-ui/icons/Add';
import '../../../Styles/AdminPanel.css'
import CheckIcon from '@material-ui/icons/Check';
import { searchDiagnosisAPI, addNewDiagnosisAPI, deleteDiagnosisItemAPI, editDiagnosisItemAPI, verifiyRandomDiagnosis } from '../../../Hooks/API'
import { GlobalContext } from '../../../Context/GlobalState'

const Diagnosis = () => {
  const { accountId } = useContext(GlobalContext);
  const [addDiagnosis, setAddDiagnosis] = useState(false);
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [list, setList] = useState([]);
  const [hasMore, setHasMore] = useState("");
  const [loader, setLoader] = useState(true);
  const [search, setSearch] = useState("");
  const [editDiagnosis, setEditDiagnosis] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
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
    deleteDiagnosis(id)
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderConfirmationModal = () => {
    return <Modal title="Delete Diagnosis" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <p>Are you sure you want to delete this Diagnosis named <b>{name}</b></p>
    </Modal>
  }
  //showModal
  const handleShow = () => {
    setAddDiagnosis(true)
  }
  //hideModal
  const handleHide = () => {
    setAddDiagnosis(false)
  }

  //showeditModal
  const handleEditShow = (id, name, type) => {
    console.log("data is ", id, name, type)
    setId(id);
    setName(name);
    setType(type);
    setEditDiagnosis(true)
  }
  //hideeditModal
  const handleEditHide = () => {
    setName("");
    setEditDiagnosis(false)
  }
  const verify = (value) => {
    verifiyRandomDiagnosis(accountId, value).then(result => {
      diagnosisInfo();
      console.log("Status Updated Succesfully", result);
    });
  }

  //AddDiagnosis
  const handleAdd = (values) => {
    let count = 0;
    if (!!diagnosisList) {
      for (let i = 0; i < diagnosisList.length; i++) {
        if (diagnosisList[i].name.toLowerCase() === values.diagnosis_name.toLowerCase()) {
          count++;
        }
      }
      if (count === 1) {
        message.error("Failed! Diagnosis Already Exsist");
      }
      else if (count === 0) {
        console.log("count value is ", count)
        addNewDiagnosisAPI(accountId, values.diagnosis_name, values.type).then(result => {
          console.log("Add Diagnosus result", result);
          if (result === "Operation Successful") {
            message.success("New Diagnosis Added Successfully");
            diagnosisInfo();
          }
          else message.error("Diagnosis Addition Failed " + result.message)
        });
      }
    } else {
      if (!!values.diagnosis_name) {
        addNewDiagnosisAPI(accountId, values.diagnosis_name, values.type).then(result => {
          console.log("Add Diagnosus result", result);
          if (result === "Operation Successful") {
            message.success("New Diagnosis Added Successfully");
            diagnosisInfo();
          }
          else message.error("Diagnosis Addition Failed " + result.message)
        });
      }
    }
    handleHide();
  }

  const deleteDiagnosis = (id) => {
    console.log("id is ", id);
    deleteDiagnosisItemAPI(accountId, id).then(result => {
      console.log("Delete Diagnosis result ", result)
      if (result.message === "API Error") {
        message.error("Failed! API error");
      } else {
        message.success("Delete Diagnosis successfully");
        diagnosisInfo();
      }
    });
  }

  const editDiagnosisData = () => {
    console.log("id is ", accountId, id);
    editDiagnosisItemAPI(accountId, id, name, type).then(result => {
      console.log("Edit Symptom result ", result)
      if (result) {
        message.success("Symptom edit successfully");
        diagnosisInfo();
      }
    });
    setEditDiagnosis(false);
  }

  const OnNameChange = (e) => {
    setName(e.target.value);
  }

  const OnTypeChange = (e) => {
    setType(e.target.value);
  }

  const editDiagnosisModal = () => {
    return <Modal title="Edit Symptom" visible={editDiagnosis} onOk={editDiagnosisData} onCancel={handleEditHide}>
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

  //Get Diagnosis List
  const diagnosisInfo = () => {
    searchDiagnosisAPI(0, 0, 0, "").then(result => {
      console.log("Diagnosis list", result);
      setDiagnosisList(result);
      let List = [...result.slice(0, 60)]
      setList(List);
      setLoader(false);
      setHasMore(result.length > 60);
      setSearchMore(result.length > 60)
    });
  }

  const loadMore = () => {
    if (hasMore) {
      const currentLength = list.length;
      const isMore = currentLength < diagnosisList.length;
      const nextResult = isMore ? diagnosisList.slice(currentLength, currentLength + 60) : [];
      setList([...list, ...nextResult]);
    }
    setHasMore(list.length < diagnosisList.length);
  }

  useEffect(() => {
    diagnosisInfo();
  }, []);
  return (
    <Fragment>
      <h6 className='ColHeader'> MANAGE DIAGNOSIS </h6>
      <div className='MainCont' >
        <div className='Editsection' onClick={handleShow}>
          <label> Add New Diagnosis
          <i>
              <AddIcon style={{ height: 20, width: 20, marginBottom: 4 }} />
            </i>
          </label>
        </div>
        {loader ? <Spin /> : <div className='diagnosis_container'>
          <label className="list-label"> Diagnosis List </label>
          <Input className="search-list"
            placeholder="Search Diagnosis here"
            onChange={e => {
              const diagnosisResult = diagnosisList.filter(item => {
                return item.name.toLowerCase().includes(e.target.value.toLowerCase());
              });
              if (diagnosisResult) {
                console.log("my list is ", diagnosisResult);
                if (searchMore) {
                  if (diagnosisResult.length > 60) {
                    setList(diagnosisResult.slice(0, 60));
                    setHasMore(true);
                  }
                  else {
                    setList(diagnosisResult);
                    setHasMore(false);
                  }
                }
              }
              setSearch(e.target.value);
            }}
            type="text"
            value={search}
          />
          <div className="list-Table" >
            {list.map((item, i) => (
              <div className='DivCont'>
                <h6 className="NameHead"> {item.name}  </h6>
                <label className='listPrice'> {item.diagnosis_type} </label>
                <div className='listIcon'>
                  {item.verified === false && <CheckIcon onClick={() => verify(item.diagnosis_id)} />}
                  <BsFillTrashFill className='EditIconList' onClick={() => { showModal(item.diagnosis_id, item.name) }} />
                  <FaEdit className='EditIconList' onClick={() => { handleEditShow(item.diagnosis_id, item.name, item.diagnosis_type) }} />  </div>
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
              <p style={{ color: 'grey', marginBottom: 3, marginTop: 2, textAlign: 'center' }}>
                <Divider />
                  No more results
              </p>
            )
          }
        </div>}
        {renderConfirmationModal()}
        {editDiagnosisModal()}
        <Modal
          visible={addDiagnosis}
          title="Add a new diagnosis"
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
              name="diagnosis_name"
              label="Name"
              rules={[
                {
                  required: true,
                  message: 'Please input diagnosis name!',
                },
              ]}
            >
              <Input placeholder='Enter Diagnosis Name' />
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
              <Input placeholder='Enter Diagnosis Type' />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Fragment>
  )
}

export default Diagnosis;
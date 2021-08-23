import React, { Fragment, useState, useEffect, useContext } from 'react';
import { Modal, Form, Input, Button, Divider, Spin, message } from 'antd';
import { Col, Row } from 'react-bootstrap';
import AddIcon from '@material-ui/icons/Add';
import '../../../Styles/AdminPanel.css'
import { searchTestAPI, addNewTestAPI, deleteTestItemAPI, editTestItemAPI, verifiyRandomTest } from '../../../Hooks/API'
import { BsFillTrashFill } from "react-icons/bs";
import CheckIcon from '@material-ui/icons/Check';
import { FaEdit } from "react-icons/fa";
import { GlobalContext } from '../../../Context/GlobalState'

const Tests = () => {
  const { accountId } = useContext(GlobalContext);
  const [addTest, setAddTest] = useState(false);
  const [testList, setTestList] = useState([]);
  const [list, setList] = useState([]);
  const [hasMore, setHasMore] = useState("");
  const [loader, setLoader] = useState(true);
  const [search, setSearch] = useState("");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [editTest, setEditTest] = useState(false);
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
    deleteTest(id)
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderConfirmationModal = () => {
    return <Modal title="Delete Test" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <p>Are you sure you want to delete this Test named <b>{name}</b></p>
    </Modal>
  }

  //showModal
  const handleShow = () => {
    setAddTest(true)
  }
  //hideModal
  const handleHide = () => {
    setAddTest(false)
  }

  //showeditModal
  const handleEditShow = (id, name, type, price) => {
    console.log("id is ", id)
    setId(id);
    setName(name);
    setType(type);
    setPrice(price);
    setEditTest(true)
  }
  //hideeditModal
  const handleEditHide = () => {
    setName("");
    setEditTest(false);
  }

  //AddTest
  const handleAdd = (values) => {
    let count = 0;
    for (let i = 0; i < testList.length; i++) {
      if (testList[i].name.toLowerCase() === values.test_name.toLowerCase()) {
        count++;
      }
    }
    if (count === 1) {
      message.error("Failed! Test Already Exsist");
    }
    else if (count === 0) {
      addNewTestAPI(accountId, values.test_name, values.type, values.price).then(result => {
        console.log("Add Test result", result);
        if (result === "Operation Successful") {
          message.success("Test Added Successfully");
          testInfo();
        }
        else message.error("Test Addition Failed")
      });
    }
    else {
      alert(count);
    }
    setAddTest(false)
  }

  const deleteTest = (id) => {
    deleteTestItemAPI(accountId, id).then(result => {
      console.log("Delete Test result ", result)
      if (result) {
        message.success("Delete Test successfully");
        testInfo();
      }
    });
  }

  const editTestData = () => {
    console.log("id is ", accountId, id);
    editTestItemAPI(accountId, id, name, type, price).then(result => {
      console.log("Edit Test result ", result)
      if (result.message === "API Error") {
        message.error("Failed! API error");
      } else {
        message.success("Test edit successfully");
        testInfo();
      }
    });
    setEditTest(false);
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

  const editTestModal = () => {
    return <Modal title="Edit Test" visible={editTest} onOk={editTestData} onCancel={handleEditHide}>
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
      </Row>
    </Modal>
  }

  //Get Test List
  const testInfo = () => {
    searchTestAPI(0, 0, 0, "").then(result => {
      console.log("Tests list", result);
      setTestList(result);
      let List = [...result.slice(0, 60)]
      setList(List);
      setLoader(false);
      setHasMore(result.length > 60);
      setSearchMore(result.length > 60);
    });
  }
  const verify = (value) => {
    verifiyRandomTest(accountId, value).then(result => {
      testInfo();
      console.log("Status Updated Succesfully", result);
    });
  }

  const loadMore = () => {
    if (hasMore) {
      const currentLength = list.length;
      const isMore = currentLength < testList.length;
      const nextResult = isMore ? testList.slice(currentLength, currentLength + 60) : [];
      setList([...list, ...nextResult]);
    }
    setHasMore(list.length < testList.length);
  }

  useEffect(() => {
    testInfo();
  }, []);

  return (
    <Fragment>
      <h6 className='ColHeader'> MANAGE TESTS </h6>
      <div className='MainCont' >
        <div className='Editsection' onClick={handleShow}>
          <label> Add New Test
          <i>
              <AddIcon style={{ height: 20, width: 20, marginBottom: 4 }} />
            </i>
          </label>
        </div>
        {loader ? <Spin /> : <div className='diagnosis_container'>
          <label className="list-label"> Tests List </label>
          <Input className="search-list"
            placeholder="Search Medicine here"
            onChange={e => {
              const testResult = testList.filter(item => {
                return item.name.toLowerCase().includes(e.target.value.toLowerCase());
              });
              if (testResult) {
                console.log("my list is ", testResult);
                if (searchMore) {
                  if (testResult.length > 60) {
                    setList(testResult.slice(0, 60));
                    setHasMore(true);
                  }
                  else {
                    setList(testResult);
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
                <h6 className="NameHead"> {item.name}  </h6>
                <label className='listPrice'> {item.test_type} PKR: {item.price} </label>
                <div className='listIcon'>
                  {item.verified === false && <CheckIcon onClick={() => verify(item.test_id)} />}
                  <BsFillTrashFill className='EditIconList' onClick={() => { showModal(item.test_id, item.name) }} />
                  <FaEdit className='EditIconList' onClick={() => { handleEditShow(item.test_id, item.name, item.test_type, item.price) }} />  </div>
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
        {editTestModal()}
        <Modal
          visible={addTest}
          title="Add a new test"
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
              name="test_name"
              label="Name"
              rules={[
                {
                  required: true,
                  message: 'Please input test name!',
                },
              ]}
            >
              <Input placeholder='Enter Test Name' />
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
              <Input placeholder='Enter Test Price' />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Fragment>
  )
}

export default Tests;
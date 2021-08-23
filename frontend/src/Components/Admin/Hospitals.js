import React, { useContext, useEffect, useState } from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import { Input, Modal, message } from 'antd';
import { getAllHospitals, addNewHospitalAPI } from '../../Hooks/API'
import HospitalItem from './HospitalItem';
import { Fragment } from 'react';
import { GlobalContext } from '../../Context/GlobalState'

const Hospitals = () => {
  const { accountId } = useContext(GlobalContext);
  const [name, setName] = useState("");
  const [locationsLists, setLoactionsLists] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setName("");
  };

  const OnNameChange = (e) => {
    setName(e.target.value);
  }
  const handleAddHospital = () => {
    let count = 0;
    if (!!locationsLists) {
      for (let i = 0; i < locationsLists.length; i++) {
        if (locationsLists[i].name.toLowerCase() === name.toLowerCase()) {
          count++;
        }
      }
      if (count === 1) {
        message.error("Failed! Hospital Already Exsist");
      }
      else if (count === 0) {
        if (name !== "") {
          addNewHospitalAPI(accountId, name).then((result) => {
            console.log("Add Hospital result is ", result)
            if (result === "Hospital Added") {
              message.success("New Hospital Added Successfully");
              hospitalsInfo();
            }
            else message.error("Hospital Addition Failed ")
          });
        } else {
          message.error("Hospital Addition Failed! Name field cant be empty")
        }
      }
    } else {
      if (name !== "") {
        addNewHospitalAPI(accountId, name).then((result) => {
          console.log("Add Hospital result is ", result)
          if (result === "Hospital Added") {
            message.success("New Hospital Added Successfully");
            hospitalsInfo();
          }
          else message.error("Hospital Addition Failed ")
        });
      } else {
        message.error("Hospital Addition Failed! Name field cant be empty")
      }
    }
    handleCancel();
  }


  const hospitalsInfo = () => {
    getAllHospitals(accountId).then(result => {
      console.log("Hospitals list", result);
      setLoactionsLists(result);
    });
  }

  function renderAddHospitalModal() {
    return <Modal title="Add Hospital" visible={isModalVisible} onOk={handleAddHospital} onCancel={handleCancel}>
      <Row>
        <Col lg='3' className='SectionList'>
          <label> Name: </label>
        </Col>
        <Col lg='8' className='SectionInfo'>
          <Input
            name="Hospital Name"
            type="text"
            placeholder="Enter Hospital name"
            value={name}
            onChange={OnNameChange} />
        </Col>
      </Row>

    </Modal>
  }

  useEffect(() => {
    hospitalsInfo();
  }, []);

  return (
    <Container fluid>
      <h6 className='sectionHeader'> MANANGE HOSPITALS </h6>
      <Fragment>
        <div className='ProfileSection' >
          <div className='DetInfoSection' style={{ paddingTop: 20 }}>
            <h6 className='HospitalHead' onClick={showModal}> Add New Hospital + </h6>
            <div style={{ top: 65 }}>
              <label className="list-label">Hospitals List</label>
              {locationsLists.map((item, i) => (
                <HospitalItem data={item} key={i} callBack={hospitalsInfo} />
              ))}
            </div>
          </div>
        </div>
      </Fragment>
      {renderAddHospitalModal()}
    </Container>
  )
}

export default Hospitals;
import React, { useEffect, useState, useCallback, useContext } from "react";
import { Col, Row, Container, Button, Modal } from "react-bootstrap";
import { FaPlusCircle, FaArrowCircleLeft, FaPlus } from "react-icons/fa";
import { Empty, Select, Radio, Input, Form, DatePicker, message } from 'antd';
import { Divider } from "@material-ui/core";
import {
  getAllPatientsOfDoctorByName, searchPatientAPI, addPatientByContactAPI,
  sendAccessRequest, generateRequestAccessNotification, patientNotificationToken,
  pendingAccessRequests
} from "../Hooks/API";
import { downloadFile } from '../Hooks/ImageAPI'
import {numberFormat,capitalize} from '../Hooks/TextTransform';
import { getDate } from '../Hooks/TimeHandling'
import PatientTabItem from "../Components/PatientTabItem";
import PatientTabDetail from "../Components/PatientTabDetail";
import "../Styles/NewPatientModal.scss";
import "react-datepicker/dist/react-datepicker.css";
import NoAcess from '../Styles/Assets/noacess.jpg';
import { GlobalContext } from "../Context/GlobalState";
import SectionLoading from "../Components/Loading/SectionLoading";
import PageLoading from "../Components/Loading/PageLoading";
import { Fragment } from "react";
import SearchedItem from "../Components/SearchedItem";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import CountryCodes from "../Components/Country Codes/CountryCodes";
import codes from 'country-calling-code';

const { Search } = Input;
const { Option } = Select;


const DoctorPatientsTab = (props) => {
  const { accountId,elementDocId } = useContext(GlobalContext)
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(0);
  const [input, setInput] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);
  const [newPatient, setNewPatient] = useState({
    name: "",
    dob: "",
    gender: "",
    phone: "",
  });
  const [startDate, setStartDate] = useState();
  const [showAddPatientModal, setAddPatientModal] = useState(false);
  const [isaccess, setIsAccess] = useState();
  const [newPatientAdd, setNewPatientAdd] = useState(true);
  const [searchPatient, setSearchPatient] = useState(false);
  const [patientList, setPatientList] = useState([]);
  const [searchpatientList, setSearchPatientList] = useState([]);
  const [number, setNumber] = useState([]);
  const [patientName, setPatientName] = useState();
  const [patientAge, setPatientAge] = useState(new Date());
  const [genderValue, setGenderValue] = useState();
  const [patientID, setPatientID] = useState(null);
  const [requestList, setRequestList] = useState([]);
  const [countryCode, setCountryCode] = useState(`+${codes[159].countryCodes[0]}`);
  const [image, setImage] = useState(null);
  const [expandPatientList, setExpandPatientList] = useState(true);
  const [expandSuggestionList, setExpandSuggestionList] = useState(true);

  const handleNumber = (e)=>{
    setNumber(numberFormat(e.target.value))
  }
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      console.log("Input: ", input);
      setInput("");
    }
  };

  const searchPatientList = (contact_no) => {
    console.log("searched value is", contact_no);
    if (contact_no !== "") {
      searchPatientAPI(elementDocId, contact_no).then((result) => {
        if (result) {
          setSearchPatientList(result);
          if (result[0]) {
            setPatientID(result[0].patient_id);
          }
          console.log("Search Patient", result);
          setSearchPatient(true);
          setExpandPatientList(true);
          setExpandSuggestionList(true);
        } else console.log("Search Patient No Patient Result");
        console.log("searched value is not available");
      });
    } else console.log("ApI not called");
    console.log("searched value is none available");
    setSearchPatient(false);
  };

  const onChangeSelect = (number, id, name, age, gender) => {
    console.log("selected patient is");
    console.log(
      "add patient function values are id ",
      elementDocId,
      number,
      "POST",
      id,
      name,
      getDate(age),
      gender
    );
    if (patientsList.some((list) => list.patientinfo.number === number)) {
      console.log("numbers are", number);
      message.error("Patient already exist");
      setSearchPatient(false);
    } else {
      addPatientByContactAPI(
        elementDocId,
        number,
        "POST",
        id,
        name,
        getDate(age),
        gender
      ).then((result) => {
        console.log("Add patient result ", result);
        getPatientFromAPI(input);
        message.success("Patient added successfully");
        setSearchPatient(false);
      });
    }
  };

  const setRequestStatus = (value) => {
    console.log("Request Status");
    console.log(
      "Request Status results are:",
      elementDocId,
      "PatientID",
      selectedPatient.patient_id,
      "status",
      value
    );
    if (value !== "") {
      sendAccessRequest(
        elementDocId,
        selectedPatient.patient_id,
        "PUT",
        value
      ).then((result) => {
        pendingRequestList(selectedPatient.patient_id);
        console.log("Request Status Updated Succesfully", result);
      });
    } else console.log("Request Status error in submission");
    renderRequestSend();
  };

  const getPatientFromAPI = useCallback(
    (input) => {
      console.log('Patient list is values ',elementDocId, 0, 0, input, "GET")
      getAllPatientsOfDoctorByName(elementDocId, 0, 0, input, "GET").then(
        (result) => {
          if (result) {
            console.log("Patient List is ", result);
            setPatientsList(result);
            if (result.length !== 0) {
              setSelectedPatient(result[0].patientinfo);
              console.log("setAcessValue", result[0].is_access);
              setIsAccess(result[0].is_access);
            } else setSelectedPatient(0);
            setFirstLoad(false);
          }
        }
      );
    },
    [elementDocId]
  );

  useEffect(() => {
    getPatientFromAPI(input);
    if (!!searchpatientList) {
      downloadFile("patients", patientID, "profile")
        .then((json) => {
          setImage("data:image;charset=utf-8;base64," + json.encodedData);
        })
        .catch((error) => console.error(error))
        .finally(() => { });
    } else {
      console.log("Downloading Image Failed! id is null");
    }
  }, [getPatientFromAPI, input]);

  const pendingRequestList = (id) => {
    pendingAccessRequests(id).then(result => {
      if (result) {
        console.log('Request List Access', result)
        setRequestList(result);
        console.log(result)
      }
      else {
        setRequestList('')
        console.log('Request Status No Listssss')
      }
    })
  }

  const handleSelectPatient = (info) => {
    console.log("clicked", info);
    setSelectedPatient(info);
    pendingRequestList(info.patient_id);
  }

  const renderPatientsList = () => {
    console.log("Patient list is : ", patientsList);
    return patientsList.length != 0 && patientsList.map((item, i) => (
      <PatientTabItem
        key={i}
        session={item.session}
        info={item.patientinfo}
        access={item.is_access}
        handleAccess={setIsAccess}
        handleItem={handleSelectPatient}
        selected={item.patientinfo.patient_id === selectedPatient.patient_id}
        callBack={getPatientFromAPI}
      />
    ));
  }

  const renderSuggestedList = () => {
    return (
      <Fragment>
        <h6 style={{ ...styles.group_head, cursor: "pointer", alignItems: "center" }} onClick={() => setExpandSuggestionList(!expandSuggestionList)}>
          Suggested Patients {expandSuggestionList ? <BsChevronUp style={{ fontSize: 12 }} /> : <BsChevronDown style={{ fontSize: 12 }} />}
        </h6>
        <Divider />
        {
          searchpatientList.length != 0 ? searchpatientList.map((item, i) => (
            !(patientsList.some(list => list.patientinfo.patient_id == item.patient_id)) && expandSuggestionList &&
            <SearchedItem key={i}
              item={item}
              selected={onChangeSelect}
              statusNew selection={handleSelectPatient}
              searchList={searchPatientList} />
          )) :
            <label>No Suggestions Found</label>
        }
      </Fragment>
    )
  }

  const renderAddedList = () => {
    console.log("search patient list is : ", searchpatientList);
    return (
      <Fragment>
        <h6 style={{ ...styles.group_head, cursor: "pointer", alignItems: "center" }} onClick={() => setExpandPatientList(!expandPatientList)}>
          Your Patients {expandPatientList ? <BsChevronUp style={{ fontSize: 12 }} /> : <BsChevronDown style={{ fontSize: 12 }} />}
        </h6>
        <Divider />
        {
          searchpatientList.length !== 0 ? searchpatientList.map((item, i) => (
            patientsList.some(list => list.patientinfo.patient_id == item.patient_id) && expandPatientList &&
            <SearchedItem key={i} item={item} selection={handleSelectPatient} searchList={searchPatientList} />
          )) :
            <label>No Added Patient Found</label>
        }
      </Fragment>
    )
  };

  const handleAddPatient = (newPatient) => {
    setAddPatientModal(true);
  };

  const handleModalClose = () => {
    setAddPatientModal(false);
    setNewPatientAdd(false);
    setPatientName('');
    setPatientAge('');
    setGenderValue('');
    setNumber('');
  };

  const validateMessages = {
    required: '${name} required!',
  };
  const handleConfirmNewPatient = () => {
    console.log("add patient function values are ", elementDocId, " number ", countryCode + number, " id ", null, " name ", patientName, " Age ", patientAge, 'start age', startDate, " gender ", genderValue)
    if (
      (number !== "") &&
      (patientName !== "") &&
      (patientAge !== "") &&
      (genderValue !== "") &&
      patientsList.some(list => list.patientinfo.number !== countryCode + number)) {
        addPatientByContactAPI(elementDocId, countryCode + number, "POST", null, patientName, patientAge, genderValue).then((result) => {
          console.log("Add patient result ", result);
          getPatientFromAPI(input);
          handleModalClose();
        })
    }
    else if (patientsList.some(list => list.patientinfo.number === countryCode + number)) {
        console.log('numbers are', number)
        message.error('Patient already exist')
        handleModalClose();
      }
  };

  const renderModal = () => {
    return (
      <Modal
        show={showAddPatientModal}
        onHide={handleModalClose}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className='ModalTitle'>
            Add New Patient
            </Modal.Title>
        </Modal.Header>
        <Form className='PatientForm' validateMessages={validateMessages}>
          <Modal.Body>
            <div className={'dpBlock'}>
              <Row className={"modal-input"}>
                <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                  Phone Number:
                  </Col>
                <Col lg={8} >
                  <Form.Item name={'Number'} rules={[{ required: true }]}>
                    <Input addonBefore={<CountryCodes returnHook={setCountryCode} defaultCode={countryCode} data={codes}/>} name='number' rules={[{ required: true }]} placeholder='3001234567' onChange={handleNumber} />
                  </Form.Item>
                </Col>
              </Row>
              <Row className={"modal-input"}>
                <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                  Name:
                    </Col>
                <Col lg={8} >
                  <Form.Item name={'Name'} rules={[{ required: true }]}>
                    <Input
                      placeholder="Enter Patient Name..."
                      name='name' rules={[{ required: true }]}
                      type="text"
                      onChange={(e) => { setPatientName(capitalize(e.target.value)); }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row className={"modal-input"}>
                <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                  Date of Birth:
                    </Col>
                <Col lg={8} className={"modal-input__value"}>
                  <Form.Item name={'Dob'} rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} placeholderText={"YYYY-MM-DD"} placeholderText={"YYYY-MM-DD"} format={'YYYY-MM-DD'}
                      onChange={(date, dateString) => {
                        setPatientAge(dateString)
                        setStartDate(dateString);
                      }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row className={"modal-input"}>
                <Col lg={{ span: 2, offset: 1 }} className={"modal-label"}>
                  Gender:
                    </Col>
                <Col lg={8} >
                  <Form.Item name={'Gender'} rules={[{ required: true }]}>
                    <Radio.Group onChange={(e) => { setGenderValue(e.target.value); console.log('gender is', e.target.value) }}>
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
              <Button variant="primary" type="submit" onClick={() => handleConfirmNewPatient()} style={{ marginLeft: "10px" }}>
                Add New Patient
                </Button>
            </Form.Item>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  };

  const renderRequestSend = () => {
    return (
      (requestList.some(list => list.request_status === 'send')) ?
        <div>
          <div className='text-center'>
            <img src={NoAcess} className='NoacessImg' alt='noAccess' />
            <br />
            <label className='NoacessLabel'> Request Sent! Waiting for Approval </label>
          </div>
          <div className='NoAcessBtnDiv'>
            <Button variant='outline-secondary' onClick={() => { setRequestStatus("none") }}>Cancel Request</Button>
          </div>
        </div>
        :
        <div>
          <div className='text-center'>
            <img src={NoAcess} className='NoacessImg' alt='noAccess' />
            <br />
            <label className='NoacessLabel'> You don't have access to this Patient! </label>
          </div>
          <div className='NoAcessBtnDiv'>
            <Button variant='primary' onClick={() => { setRequestStatus("send") }}>Request Access</Button>
          </div>
        </div>
    )
  }

  const renderDetail = () => {
    return (
      selectedPatient !== 0 ? (
        isaccess === true ?
          <PatientTabDetail
            patientInfo={selectedPatient}
            key={selectedPatient.patient_id}
          />
          :
          renderRequestSend()
      )
        :
        <div style={{ padding: 100 }}>
          <div className='text-center'>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<div> No Record Found !! <br /> Try again or Add new patient</div>} />
          </div>
        </div>
    )
  }

  return (
    firstLoad ?
      <div style={{ ...styles.card, minHeight: "90vh", flex: 1, flexDirection: "column", display: "flex", backgroundColor: "#f5f5f5", padding: 0, paddingRight: 0, paddingLeft: 0 }}>
        <SectionLoading />
        <PageLoading />
      </div> :
      <Container fluid >
        <Row>
          <Col lg='3' md='4' sm='6' >
            <div style={{ position: "sticky", top: 80 }}>
              <h6 className="sectionHeader" >PATIENTS</h6>
              <div className='ProfileSection' style={{ paddingBottom: '0px', minHeight: "86vh" }}>
                <div className={"add-new-patient"} style={{ padding: 5, marginTop: 5 }} onClick={() => handleAddPatient(newPatient)}>
                  <FaPlusCircle size={15} className={"add-new-patient__icon"} />
                  <span className={"add-new-patient__label"}>
                    <b> Add New Patient </b>
                  </span>
                </div>
                <Input placeholder="input search text" allowClear
                  onChange={e => searchPatientList(e.target.value)}
                  onKeyUp={e => {
                    if (e.key === 'Backspace') {
                      setSearchPatient(false)
                    }
                    if (e.key === 'Escape') {
                      setSearchPatient(false)
                    }
                  }}
                  style={{ width: '90%' }} />
                <div style={{ borderBottomColor: "#e0e0e0", borderBottomWidth: 0.3, borderBottomStyle: "solid", marginTop: 5 }}>
                  {searchPatient === true ?
                    <Fragment>
                      {renderAddedList()}
                      {renderSuggestedList()}
                    </Fragment>
                    :
                    renderPatientsList()}
                </div>
              </div>
            </div>
          </Col>
          <Col lg='9' md='8' sm='12'>
            <div style={{ top: 65 }}>
              <h6 className="sectionHeader">PATIENT HISTORY DETAIL</h6>
              <div className='ProfileSection' style={{ paddingBottom: 0, minHeight: "86vh" }}>
                {renderDetail()}
              </div>
            </div>
          </Col>
        </Row>
        {renderModal()}
      </Container>
  );
};

export default DoctorPatientsTab;

const styles = {
  input: { fontSize: 13, padding: 8, borderRadius: "4px", boxShadow: "none", height: '35px', marginBottom: '6px', width: '96%' },
  header_container: { display: "flex", flexDirection: "row", padding: 16, alignItems: "center", backgroundColor: "white", cursor: 'pointer' },
  header_container_selected: {
    display: "flex", flexDirection: "row", padding: 16, alignItems: "center"
    , backgroundColor: "#f6f6f6", borderColor: "#e0e0e0", borderStyle: "solid", borderWidth: 0.3
  },
  avatar: { height: "60px", width: "60px", borderWidth: 0.3, borderColor: "#e0004d", borderStyle: "solid" },
  title_container: { display: "flex", flexDirection: "column", textAlign: "left", marginLeft: 10 },
  title__name: { color: "#3a3b3c", fontSize: 14, fontWeight: "bold", marginBottom: '1px', textTransform: 'capitalize' },
  title__name_selected: { color: "#e0004d", fontSize: 14, fontWeight: "bold", marginBottom: '1px', textTransform: 'capitalize' },
  title__label: { color: "#00000081", fontSize: 12, marginBottom: '0px', marginTop: '0px' },
  group_head: { marginTop: '10px', fontSize: '14px', color: '6c757d', fontWeight: 'bold' }
};


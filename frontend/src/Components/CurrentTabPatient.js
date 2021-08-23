import React, { useContext, useState, } from "react";
import { Col, Container, Modal, Row, Button } from 'react-bootstrap'
import { Input, message, Radio, Select } from 'antd';
import Calender from "react-calendar";
import "antd/dist/antd.css";
import moment from "moment";
import { Fragment } from "react";
import Tags from "./Tags/Tags";
import TestsList from "./TestsList/TestsList";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import RemoveCircleOutlineTwoToneIcon from "@material-ui/icons/RemoveCircleOutlineTwoTone";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import { Avatar, Divider } from "@material-ui/core";
import {
  getPatientAppoinmtmentByStatusAPI,
  searchSymptomAPI,
  searchTestAPI,
  searchMedicinesAPI,
  addSymptomInAppointmentAPI,
  deleteSymptomAPI,
  addTestAPI,
  addPrescriptionAPI,
  addDiagnosisAPI,
  availableSlotsAPI,
  searchDiagnosisAPI,
  deleteDiagnosisAPI,
  addDoctorNotesAPI,
  locationsAPI,
  scheduleFollowupAPI,
  deleteTestAPI,
  deletePrescriptionAPI,
  getAppointmentTests,
  deleteNotesAPI,
  editNotesAPI,
  copyFromFollowupDataAPI,
  appointmentStateLog
} from "../Hooks/API";
import { getDate, getTime } from "../Hooks/TimeHandling";
import { useEffect } from "react";
import { getDatetoSet, getSlot } from '../Hooks/TimeHandling';
import { GlobalContext } from "../Context/GlobalState";
import PDFGenerator from "./PDFPanel/PDFGenerator";
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';

import { Tooltip } from "antd";
import IconButton from '@material-ui/core/IconButton';


const { TextArea } = Input;

const CurrentTabPatient = (props) => {
  const patientId = props.patientId;
  const [totalTestAmount, setTotalTestAmount] = useState(0);
  let totalPriceCount = 0;
  // const [totalMedAmount,setTotalMedAmount] = useState(0);
  const [appointment_ID, setAppointment_ID] = useState(0);
  const [symptomsList, setSymptomsList] = useState([]);
  const [fee, setFee] = useState(0);
  const [noteVal, setNoteVal] = useState([]);
  const [noteValRefresher, setNoteValRefresher] = useState(false);
  const [suggestList, setSuggestionList] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [suggestDiagnosisList, setSuggestionDiagnosisList] = useState([]);
  const [testsList, setTestsList] = useState([]);
  const [suggestTestList, setSuggestionTestList] = useState([]);
  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [suggestPrescriptionList, setSuggestionPrescriptionList] = useState([]);
  const [symptomSearch, setSymptomSearch] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [diagnosisSearch, setDiagnosisSearch] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [slots, setSlots] = useState([]);
  const [timeSlot, setTimeSlot] = useState();
  const [date, setDate] = useState(new Date());
  const [showFollowUpModal, setFollowUPModal] = useState(false);
  const [patientinfo, setPatientInfo] = useState([]);
  const [selectValue, setSelectedValue] = useState();
  const [locationData, setLocationData] = useState([]);
  const [disabledDays, setDisabledDays] = useState([]);
  const [locationID, setLoactionID] = useState();
  const [patAppointmentType, setPatAppointmentType] = useState();
  const [durationValue, setDurationValue] = useState("");
  const { accountId,elementDocId } = useContext(GlobalContext);
  const [appointmentType, setAppointmentType] = useState({
    inperson: false,
    telehealth: false,
  });
  const [docAppointmentType, setDocAppointmentType] = useState("");
  const [dataForPDF, setDataForPDF] = useState([]);
  const [pdfRefresher, setPdfRefresher] = useState(false);

  const sendValidation = () => {
    console.log("symptom validation callback length", symptomsList.length);
    let validationStatus = true;
    let valMsg = "";
    if (symptomsList.length === 0) {
      validationStatus = false;
      valMsg =
        "No Symptoms added. Please add them to complete the appointment!";
      if (diagnosisList.length === 0)
        valMsg =
          "No Symptoms or Diagnosis added. Please add them to complete the appointment!";
      if (testsList.length === 0)
        valMsg =
          "No Symptoms or Tests added. Please add them to complete the appointment!";
      if (testsList.length === 0 && diagnosisList.length === 0)
        valMsg =
          "No Symptoms or Diagnosis or Tests added. Please add them to complete the appointment!";
    } else {
      if (diagnosisList.length === 0 || testsList.length === 0) {
        valMsg =
          "No Diagnosis prior test results, we recommend a follow-up before completing the appointment";
      }
      if (testsList.length === 0 && diagnosisList.length === 0) {
        validationStatus = false;
        valMsg =
          "No Diagnosis or Tests added. Please add them to complete the appointment!";
      }
    }
    // Complete the appointment
    console.log(
      "value are there ",
      props.appointmentId,
      validationStatus,
      valMsg
    );
    props.validation(props.appointmentId, validationStatus, valMsg);
  };

  const objectByNameArrayComparator = (a, b, N) => {
    console.log("this is editing differencessss: a, b", N, a, b);
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    a = a.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    b = b.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i].name !== b[i].name) return false;
    }
    return true;
  };

  const notesComparator = (a, b, N) => {
    console.log("this is editing differencessss: a, b", N, a, b);
    if (a == null || b == null) return false;
    a = a.sort((a, b) =>
      a.doctor_note > b.doctor_note ? 1 : b.doctor_note > a.doctor_note ? -1 : 0
    );
    b = b.sort((a, b) =>
      a.doctor_note > b.doctor_note ? 1 : b.doctor_note > a.doctor_note ? -1 : 0
    );
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i].doctor_note !== b[i].doctor_note) return false;
    }
    return true;
  };

  const checkDifference = (
    symptoms,
    tests,
    diagnosis,
    prescriptions,
    notes
  ) => {
    // console.log("this is editing differencessss: ", symptoms, props.copyingData.appointment_data.symptoms)
    let symCheck = objectByNameArrayComparator(
      symptoms,
      props.copyingData.appointment_data.symptoms,
      "s"
    );
    let testCheck = objectByNameArrayComparator(
      tests,
      props.copyingData.appointment_data.tests,
      "t"
    );
    let diaCheck = objectByNameArrayComparator(
      diagnosis,
      props.copyingData.appointment_data.diagnosis,
      "d"
    );
    let preCheck = objectByNameArrayComparator(
      prescriptions,
      props.copyingData.appointment_data.prescriptionss,
      "p"
    );
    let noteCheck = notesComparator(notes, props.copyingData.doctors_note, "p");
    console.log(
      "this is editing differencessss: ",
      symCheck,
      testCheck,
      diaCheck,
      preCheck,
      noteCheck
    );
    if (symCheck && testCheck && diaCheck && preCheck && noteCheck) {
      //all are same
      props.setConfirmEditing(false);
    } else {
      props.setConfirmEditing(true);
    }
  };

  const appointmentData = () => {
    let isMounted = true;
    getPatientAppoinmtmentByStatusAPI(
      elementDocId,
      0,
      patientId,
      0,
      "inprogress",
      "GET"
    ).then((result) => {
      console.log("Data Back from API:", result[0]);
      const myAppointment = result.filter(
        (r) => r.appointment_id === props.appointmentId
      );
      console.log("Data Back from API from current:", myAppointment[0]);
      if (myAppointment[0] && isMounted) {
        setCurrentData(myAppointment[0]);
        setAppointment_ID(myAppointment[0].appointment_id);
        !!myAppointment[0].appointment_data.symptoms &&
          setSymptomsTagFromAPI(myAppointment[0].appointment_data.symptoms);
        !!myAppointment[0].appointment_data.tests &&
          setTestsTagFromAPI(myAppointment[0].appointment_data.tests);
        !!myAppointment[0].appointment_data.prescriptions &&
          setPrescriptionsTagFromAPI(
            myAppointment[0].appointment_data.prescriptions
          );
        !!myAppointment[0].appointment_data.diagnosis &&
          setDiagnosisTagFromAPI(myAppointment[0].appointment_data.diagnosis);
        !!myAppointment[0].doctorinfo.appointment_location
          .appointment_location_of_doctor &&
          setSelectedValue(
            myAppointment[0].doctorinfo.appointment_location
              .appointment_location_of_doctor
          );
        !!myAppointment[0].patientinfo &&
          setPatientInfo(myAppointment[0].patientinfo);
        !!myAppointment[0].doctors_note &&
          setNoteVal(myAppointment[0].doctors_note);
        !!myAppointment[0].doctorinfo.appointment_location.location_id &&
          setLoactionID(
            myAppointment[0].doctorinfo.appointment_location
              .doctors_hospital_location_id
          );
        !!myAppointment[0].appointment_type &&
          setPatAppointmentType(myAppointment[0].appointment_type);
        !!myAppointment[0].doctorinfo.appointment_location.appointment_type &&
          setDocAppointmentType(
            myAppointment[0].doctorinfo.appointment_location.appointment_type
          );
        !!myAppointment[0].date_time_of_appointment &&
          setTimeSlot(getTime(myAppointment[0].date_time_of_appointment));
        !!myAppointment[0].doctorinfo.appointment_location.fee_details &&
          setFee(
            myAppointment[0].doctorinfo.appointment_location.fee_details.payment
          );
        props.editing &&
          checkDifference(
            myAppointment[0].appointment_data.symptoms,
            myAppointment[0].appointment_data.tests,
            myAppointment[0].appointment_data.diagnosis,
            myAppointment[0].appointment_data.prescriptions,
            myAppointment[0].doctors_note
          );
      }
    });
  };

  const [pdfKey, setPdfKey] = useState(false);

  const getDataForPDF = () => {
    console.log("DataForPDF: function")
    getPatientAppoinmtmentByStatusAPI(elementDocId, 0, patientId, 0, "inprogress", "GET").then((result) => {
      console.log("DataForPDF: API", result[0]);
      // console.log("Data Back from API:", result[0]);
      const myAppointment = result.filter(
        (r) => r.appointment_id === props.appointmentId
      );
      // console.log("Data Back from API from current: PDF Data", );
      console.log("DataForPDF: API response", myAppointment[0]);
      if (!!myAppointment[0]) {
        // setCurrentData(myAppointment[0]);
        setPdfKey(false);
        setDataForPDF([]);
        setDataForPDF(myAppointment[0]);
      }
    })
  }

  useEffect(() => {
    appointmentData();
    locationsAPI(elementDocId).then((result) => {
      console.log("location api results", result);
      setLocationData(result);
    });
  }, [elementDocId, patientId, noteValRefresher]);

  useEffect(() => {
    sendValidation();
    // appointmentData();
  }, [symptomsList, diagnosisList, testsList, prescriptionsList]);

  useEffect(() => {
    getDataForPDF()
  }, [pdfRefresher])

  useEffect(() => !pdfKey && setTimeout(() => setPdfKey(true), 500), [pdfKey])

  useEffect(() => {
    props.editing &&
      checkDifference(
        symptomsList,
        testsList,
        diagnosisList,
        prescriptionsList,
        noteVal
      );
  }, [symptomsList, testsList, diagnosisList, prescriptionsList, noteVal]);

  //Symptoms
  const handleAddSymptoms = (value) => {
    console.log(
      "handleAddSymptoms: symptoms list : ",
      symptomsList,
      "value: ",
      value
    );
    let count = 0;
    if (!!value) {
      if (symptomsList.length !== 0) {
        for (let i = 0; i < symptomsList.length; i++) {
          if (symptomsList[i].name.toLowerCase() === value.toLowerCase()) {
            count++;
          }
        }
        count > 0
          ? message.error("Symptom already added")
          : addSymptomInAppointmentAPI(
            0,
            0,
            0,
            appointment_ID,
            "POST",
            value
          ).then((result) => {
            console.log("Success", result);
            if (!!result) {
              setSymptomsTagFromAPI(result);
            }
          });
      } else {
        addSymptomInAppointmentAPI(0, 0, 0, appointment_ID, "POST", value).then(
          (result) => {
            console.log("Success", result);
            if (!!result) {
              setSymptomsTagFromAPI(result);
            }
          }
        );
      }
    } else {
      message.error("Added value is undefine");
    }
  };

  const handleSymptomKeyDown = (event) => {
    console.log(
      "handleKeyDown: values selected is :",
      symptomSearch,
      "event",
      event.target.value,
      "suggestList: ",
      suggestList
    );
    if (event.key === "Enter") {
      if (suggestList.length == 0) {
        console.log(
          "handleKeyDown: values selected is :",
          symptomSearch,
          "event",
          event.target.value
        );
        handleAddSymptoms(symptomSearch);
      }
    }
  };

  const setSymptomsTagFromAPI = (sList) => {
    setSymptomsList([]);
    setSymptomsList(sList);
    setPdfRefresher(!pdfRefresher);
  };

  const SymptomsInputCallback = (event) => {
    console.log("SymptomsInputCallback: Value selected is ", event);
    handleAddSymptoms(event);
  };
  const SymptomsSearch = (value) => {
    searchSymptomAPI(0, 0, 0, value).then((result) => {
      console.log("SymptomsSearch: Search result: ", result);
      // setSuggestionList(result);
      let formattedList = [];
      !!result &&
        result.map((item) => {
          return formattedList.push({
            value: item.name,
            name: item.name,
          });
        });
      console.log("Formatted list symptoms are: ", formattedList);
      setSymptomSearch(value);
      console.log("Formatted list symptoms are: ", symptomSearch);
      setSuggestionList(formattedList);
    });
  };
  const deleteSymptoms = (value) => {
    deleteSymptomAPI(0, 0, 0, appointment_ID, "DELETE", value).then(
      (result) => {
        console.log("Delete result: ", result);
        if (!!result) {
          setSymptomsTagFromAPI(result);
        }
      }
    );
  };

  //Diagnosis

  const handleAddDiagnosis = (value) => {
    console.log("handleAddDiagnosis: symptoms list : ", diagnosisList);
    let count = 0;
    if (diagnosisList.length !== 0) {
      for (let i = 0; i < diagnosisList.length; i++) {
        if (diagnosisList[i].name.toLowerCase() === value.toLowerCase()) {
          count++;
        }
      }
      count > 0
        ? message.error("Diagnosis already added")
        : addDiagnosisAPI(0, 0, 0, appointment_ID, "POST", value).then(
          (result) => {
            console.log("handleAddDiagnosis: Success", result);
            if (!!result) {
              setDiagnosisTagFromAPI(result);
            }
          }
        );
    } else {
      addDiagnosisAPI(0, 0, 0, appointment_ID, "POST", value).then((result) => {
        console.log("handleAddDiagnosis: Success", result);
        if (!!result) {
          setDiagnosisTagFromAPI(result);
        }
      });
    }
  };

  const handleDiagnosisKeyDown = (event) => {
    if (event.key === "Enter") {
      if (suggestDiagnosisList.length == 0) {
        console.log(
          "handleTestKeyDown: values selected is :",
          diagnosisSearch,
          "event",
          event.target.value
        );
        handleAddDiagnosis(diagnosisSearch);
      }
    }
  };

  const diagnosisInputCallback = (value) => {
    handleAddDiagnosis(value);
  };

  const setDiagnosisTagFromAPI = (sList) => {
    setDiagnosisList([]);
    setDiagnosisList(sList);
    setPdfRefresher(!pdfRefresher);
  };
  const DiagnosisSearch = (value) => {
    searchDiagnosisAPI(0, 0, 0, value).then((result) => {
      console.log("Search result: ", result);
      // setSuggestionDiagnosisList(result);
      let formattedList = [];
      !!result &&
        result.map((item) => {
          return formattedList.push({
            value: item.name,
            name: item.name,
          });
        });
      console.log("Formatted list diagnosis are: ", formattedList);
      setDiagnosisSearch(value);
      console.log("Formatted list diagnosis are: ", symptomSearch);
      setSuggestionDiagnosisList(formattedList);
    });
  };
  const deleteDiagnosis = (value) => {
    deleteDiagnosisAPI(0, 0, 0, appointment_ID, "DELETE", value).then(
      (result) => {
        console.log("Delete result: ", result);
        if (!!result) {
          setDiagnosisTagFromAPI(result);
        }
      }
    );
  };

  //Tests

  const handleAddTests = (value) => {
    console.log("handleAddTests: tests list : ", testsList);
    let count = 0;
    if (!!value) {
      if (testsList.length !== 0) {
        for (let i = 0; i < testsList.length; i++) {
          if (testsList[i].name.toLowerCase() === value.toLowerCase()) {
            count++;
          }
        }
        count > 0
          ? message.error("Test already added")
          : addTestAPI(
            elementDocId,
            0,
            patientId,
            appointment_ID,
            "POST",
            value
          ).then((result) => {
            console.log("handleAddTests: Success", result);
            if (!!result) {
              setTestsTagFromAPI([]);
              setTestsTagFromAPI(result);
            }
          });
      } else {
        addTestAPI(elementDocId, 0, patientId, appointment_ID, "POST", value).then(
          (result) => {
            console.log("handleAddTests: Success", result);
            if (!!result) {
              setTestsTagFromAPI([]);
              setTestsTagFromAPI(result);
            }
          }
        );
      }
    } else {
      message.error("Failed! Test value is null");
    }
  };

  const handleTestKeyDown = (event) => {
    console.log(
      "handleTestKeyDown: values selected is :",
      symptomSearch,
      "event",
      event.target.value,
      "suggestList: ",
      suggestList
    );
    if (event.key === "Enter") {
      if (suggestTestList.length == 0) {
        console.log(
          "handleTestKeyDown: values selected is :",
          testSearch,
          "event",
          event.target.value
        );
        handleAddTests(testSearch);
      }
    }
  };

  const TestsInputCallback = (value) => {
    handleAddTests(value);
  };

  const setTestsTagFromAPI = (sList) => {
    console.log("new list is ", sList);
    setTestsList([]);
    setTestsList(sList);
    setPdfRefresher(!pdfRefresher);
  };

  const refreshTestListOnUpload = () => {
    getAppointmentTests(patientId, appointment_ID).then((result) => {
      if (!!result || result.length !== 0) {
        setTestsList([]);
        setTestsList(result);
        setPdfRefresher(!pdfRefresher);
      }
    });
  };

  const deleteTests = (value) => {
    deleteTestAPI(
      elementDocId,
      0,
      patientId,
      appointment_ID,
      "DELETE",
      value
    ).then((result) => {
      console.log("Delete result: ", result);
      if (!!result) {
        setTestsTagFromAPI([]);
        setTestsTagFromAPI(result);
      }
    });
  };

  const TestsSearch = (value) => {
    searchTestAPI(0, 0, 0, value).then((result) => {
      console.log("TestsSearch: Test results are: ", result);
      // setSuggestionTestList(result);
      let formattedList = [];
      !!result &&
        result.map((item) => {
          return formattedList.push({
            value: item.name,
            name: item.name,
          });
        });
      console.log("TestsSearch: Formatted list tests are: ", formattedList);
      setTestSearch(value);
      console.log("TestsSearch: Formatted list tests are: ", testSearch);
      setSuggestionTestList(formattedList);
    });
  };

  //Doctor Notes
  const handleAddNotes = () => {
    console.log("back handle note add", appointment_ID);
    addDoctorNotesAPI(0, 0, 0, appointment_ID, "POST", "EMPTY").then(
      (result) => {
        console.log("Success", result);
        setNoteValRefresher(!noteValRefresher);
      }
    );
  };
  const handleDeleteNotes = (value) => {
    console.log("delete note value is", value, appointment_ID);
    deleteNotesAPI(0, 0, 0, value, "DELETE", appointment_ID).then((result) => {
      console.log("Success deleted note", result);
      setNoteValRefresher(!noteValRefresher);
    });
  };

  const handleEditNotes = (noteId, value) => {
    console.log("delete note value is", value, appointment_ID);
    editNotesAPI(0, 0, 0, noteId, "PUT", value, appointment_ID).then(
      (result) => {
        console.log("Success", result);
        setPdfRefresher(!pdfRefresher);
      }
    );
  };

  //Prescriptions
  const setPrescriptionsTagFromAPI = (sList) => {
    setPrescriptionsList([]);
    setPrescriptionsList(sList);
    setPdfRefresher(!pdfRefresher);
  };

  const [editPrescriptionVisible, setEditPrescriptionVisible] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState("sample");
  const [presIntake, setPresIntake] = useState("");
  const [presDuration, setpresDuration] = useState("");
  const [mealRadio, setMealRadio] = useState("");
  const [additionalNote, setAddtionalNote] = useState("");
  const [presDosage, setPreDosage] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
  });

  const validatePrescription = () => {
    if (
      selectedPrescription === "sample" ||
      presIntake === "" ||
      durationValue === "" ||
      presDuration === "" ||
      mealRadio === "" ||
      (!presDosage.morning &&
        !presDosage.afternoon &&
        !presDosage.evening &&
        !presDosage.night)
    ) {
      return true;
    } else {
      return false;
    }
  };
  const formatDosage = () => {
    return `${presDosage.morning ? presIntake + " Morning " : ""}  ${presDosage.afternoon ? presIntake + " Afternoon " : ""
      } ${presDosage.evening ? presIntake + " Evening " : ""} ${presDosage.night ? presIntake + " Night " : ""
      } 
      (${mealRadio})`;
  };

  const resetPrecriptionFields = () => {
    setSelectedPrescription("sample");
    setPresIntake("");
    setpresDuration("");
    setMealRadio("");
    setDurationValue("");
    setPreDosage({
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
    });
  };
  const onDurationChange = (e) => {
    console.log("radio checked", e.target.value);
    setDurationValue(e.target.value);
    if (e.target.value === "On Need Base") {
      setpresDuration();
    }
  };

  const handleAddPrescription = (value) => {
    let dosageString = formatDosage();
    console.log(
      "Dosage String",
      dosageString,
      " value ",
      value,
      "presDuraion-days",
      presDuration,
      "Intake ",
      presIntake
    );
    if (durationValue === "Add Duration") {
      let x = parseInt(presDuration) * Number(presIntake);
      console.log(
        "Methamaticle vlaue is ",
        parseInt(presDuration),
        "orignal vlaue is ",
        presDuration,
        "result is :",
        x
      );
      if (presDuration == 0 || x == 0) {
        message.error(
          "Invalid Entry! Duration/Intake cant be zero for perscription of medicine"
        );
        resetPrecriptionFields();
      } else {
        console.log("Inside duratian ");
        addPrescription(value, presDuration, x, dosageString);
      }
    } else {
      console.log("Inside without duratian ");
      // alert("Work inprogress")
      addPrescription(
        value,
        presIntake,
        "On need basis " + additionalNote,
        dosageString
      );
    }
  };

  const renderEditNewPrescription = () => {
    return (
      editPrescriptionVisible && (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            paddingTop: 10,
            paddingBottom: 10,
            margin: 10,
            borderColor: "#e0e0e0",
            borderStyle: "solid",
            borderTopWidth: 0.6,
            borderBottomWidth: 0.6,
            borderLeftWidth: 0,
            borderRightWidth: 0,
          }}
        >
          <Container fluid>
            <Row style={{ alignItems: "baseline" }}>
              <Col lg={3}>
                <div style={styles.edit_label}>Medicine:</div>
              </Col>
              <Col lg={9}>
                <div style={styles.medicine_title}>{selectedPrescription}</div>
              </Col>
            </Row>
            <Row style={{ alignItems: "baseline", marginTop: 20 }}>
              <Col lg={3}>
                <div style={styles.edit_label}>In-take:</div>
              </Col>
              <Col lg={9}>
                <input
                  style={{
                    width: "100%",
                    padding: 0,
                    fontSize: 8,
                    ...styles.input,
                  }}
                  placeholder={`Quantity per take...`}
                  type="text"
                  value={presIntake}
                  noValidate
                  onChange={(e) => {
                    setPresIntake(e.target.value);
                  }}
                />
              </Col>
            </Row>
            <Row style={{ alignItems: "baseline", marginTop: 20 }}>
              <Col lg={12}>
                <div style={styles.edit_label}>Dosages:</div>
              </Col>
              <Col lg={7}>
                <div
                  onChange={(e) => {
                    let sampleDos = { ...presDosage };
                    sampleDos[e.target.value] = !presDosage[e.target.value];
                    setPreDosage(sampleDos);
                    console.log(
                      "dosage object",
                      presDosage,
                      "sample",
                      sampleDos
                    );
                  }}
                >
                  <span>
                    <input
                      style={{ width: 20 }}
                      type="checkbox"
                      value="morning"
                      name="Dosage"
                      checked={presDosage.morning}
                    />
                    <span style={{ paddingRight: 10 }}>Morning</span>
                  </span>
                  <span>
                    <input
                      style={{ width: 20 }}
                      type="checkbox"
                      value="afternoon"
                      name="Dosage"
                      checked={presDosage.afternoon}
                    />
                    <span style={{ paddingRight: 10 }}>Afternoon</span>
                  </span>
                  <span>
                    <input
                      style={{ width: 20 }}
                      type="checkbox"
                      value="evening"
                      name="Dosage"
                      checked={presDosage.evening}
                    />
                    <span style={{ paddingRight: 10 }}>Evening</span>
                  </span>
                  <span>
                    <input
                      style={{ width: 20 }}
                      type="checkbox"
                      value="night"
                      name="Dosage"
                      checked={presDosage.night}
                    />
                    <span style={{ paddingRight: 10 }}>Night</span>
                  </span>
                </div>
              </Col>
              <Col lg={5} style={{ borderLeft: "1px solid #e4e4e4" }}>
                <div onChange={(e) => setMealRadio(e.target.value)}>
                  <input
                    style={{ width: 20 }}
                    type="radio"
                    value="Before Meal"
                    name="Meal"
                    checked={mealRadio === "Before Meal"}
                  />
                  <span style={{ paddingRight: 50 }}>Before Meal</span>
                  <input
                    style={{ width: 20 }}
                    type="radio"
                    value="After Meal"
                    name="Meal"
                    checked={mealRadio === "After Meal"}
                  />
                  After Meal
                </div>
              </Col>
            </Row>
            <Row style={{ alignItems: "baseline", marginTop: 20 }}>
              <Col lg={3}>
                <div style={styles.edit_label}>Duration :</div>
              </Col>
              <Col lg={9}>
                <Radio.Group onChange={onDurationChange} value={durationValue}>
                  <Radio value={"On Need Base"}>On need basis</Radio>
                  <Radio value={"Add Duration"}>Add duration</Radio>
                </Radio.Group>
              </Col>
            </Row>
            {!!(durationValue === "Add Duration") && (
              <Row style={{ alignItems: "baseline", marginTop: 20 }}>
                <Col lg={3}>
                  <div style={styles.edit_label}>Duration (days):</div>
                </Col>
                <Col lg={9}>
                  <input
                    style={{
                      width: "100%",
                      padding: 0,
                      fontSize: 8,
                      ...styles.input,
                    }}
                    placeholder={`No. of days...`}
                    type="text"
                    value={presDuration}
                    noValidate
                    onChange={(e) => {
                      setpresDuration(e.target.value);
                    }}
                  />
                </Col>
              </Row>
            )}
            {!!(durationValue === "On Need Base") && (
              <Row style={{ alignItems: "baseline", marginTop: 20 }}>
                <Col lg={3}>
                  <div style={styles.edit_label}>Aditional Note:</div>
                </Col>
                <Col lg={9}>
                  <input
                    style={{
                      width: "100%",
                      padding: 0,
                      fontSize: 8,
                      ...styles.input,
                    }}
                    placeholder={`Addtional Note....`}
                    type="text"
                    value={additionalNote}
                    noValidate
                    onChange={(e) => {
                      setAddtionalNote(e.target.value);
                    }}
                  />
                </Col>
              </Row>
            )}
            <Row>
              <Col lg={12} style={{ textAlign: "center", marginTop: 20 }}>
                <Button
                  disabled={validatePrescription()}
                  onClick={() => {
                    setEditPrescriptionVisible(false);
                    handleAddPrescription(selectedPrescription);
                  }}
                  size="sm"
                  variant="primary"
                >
                  Add to Prescription List
                </Button>
                <Button
                  onClick={() => {
                    setEditPrescriptionVisible(false);
                    resetPrecriptionFields();
                  }}
                  size="sm"
                  variant="outline-secondary"
                  style={{ marginLeft: 8 }}
                >
                  Discard
                </Button>
              </Col>
            </Row>
          </Container>
        </div>
      )
    );
  };

  const addPrescription = (medicine_name, days, quantityTab, frequencies) => {
    console.log("addPrescription: prescription list : ", prescriptionsList);
    let count = 0;
    if (prescriptionsList.length !== 0) {
      for (let i = 0; i < prescriptionsList.length; i++) {
        if (
          prescriptionsList[i].name.toLowerCase() ===
          medicine_name.toLowerCase()
        ) {
          count++;
        }
      }
      count > 0
        ? message.error("Medicine already added")
        : addPrescriptionAPI(
          0,
          0,
          0,
          appointment_ID,
          "POST",
          medicine_name,
          days,
          quantityTab,
          frequencies
        ).then((result) => {
          console.log(
            "addPrescription: Add medicine results results: ",
            result
          );
          if (!!result) {
            setPrescriptionsTagFromAPI(result);
            resetPrecriptionFields();
          }
        });
    } else {
      addPrescriptionAPI(
        0,
        0,
        0,
        appointment_ID,
        "POST",
        medicine_name,
        days,
        quantityTab,
        frequencies
      ).then((result) => {
        console.log("addPrescription: Add medicine results results: ", result);
        if (!!result) {
          setPrescriptionsTagFromAPI(result);
          resetPrecriptionFields();
        }
      });
    }
  };

  const handleMedicineKeyDown = (event) => {
    if (event.key === "Enter") {
      if (suggestPrescriptionList.length == 0) {
        console.log(
          "handleTestKeyDown: values selected is :",
          medicineSearch,
          "event",
          event.target.value
        );
        setSelectedPrescription(medicineSearch);
        setEditPrescriptionVisible(true);
      }
    }
  };

  const PrescriptionsInputCallback = (value) => {
    setSelectedPrescription(value);
    setEditPrescriptionVisible(true);
  };

  const PrescriptionsSearch = (value) => {
    searchMedicinesAPI(0, 0, 0, value).then((result) => {
      console.log("Search medicines results: ", result);
      setSuggestionPrescriptionList(result);
      let formattedList = [];
      !!result &&
        result.map((item) => {
          return formattedList.push({
            value: item.name,
            name: item.name,
          });
        });
      console.log(
        "PrescriptionsSearchSearch: Formatted list medicines are: ",
        formattedList
      );
      setMedicineSearch(value);
      console.log(
        "PrescriptionsSearch: Formatted list medicines are: ",
        medicineSearch
      );
      setSuggestionPrescriptionList(formattedList);
    });
  };

  const handlePrescription = (val) => {
    deletePrescription(val);
  };

  const deletePrescription = (val) => {
    deletePrescriptionAPI(0, 0, 0, appointment_ID, "DELETE", val).then(
      (result) => {
        console.log("Delete medicine results results: ", result);
        if (!!result) {
          setPrescriptionsTagFromAPI(result);
          resetPrecriptionFields();
        }
      }
    );
  };

  const renderAddedPrescriptions = () => {
    let totalPrice = 0;
    if (prescriptionsList.length !== 0) {
      for (let i = 0; i < prescriptionsList.length; i++) {
        totalPrice += prescriptionsList[i].price;
      }
      totalPriceCount += totalPrice;
      // setTotalMedAmount(totalPrice);
    }




    return (
      <Fragment>
        {prescriptionsList.map((item, i) => (
          <tr key={i}>
            <td className="text-center">
              <div className="MedicineTitle"> {item.name} </div>
            </td>
            <td className="text-center">
              <div style={{ color: "#6f6e6e" }}> {item.frequency} </div>
            </td>
            <td className="text-center"> {item.days} </td>
            <td> {item.quantity} </td>

            <td className="text-center">
              <Button
                className="DeleteBtn"
                onClick={() => handlePrescription(item.name)}
              >
                {" "}
                <DeleteForeverIcon />{" "}
              </Button>
            </td>
            <td>
              {" "}
              <div className="MedPriceLabel">
                {" "}
                Price: <b> {item.price} </b> PKR{" "}
              </div>{" "}
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan="6" style={{ textAlign: "right" }}>
            <label className="MedPriceLabel" style={{ marginRight: "15px" }}>
              Total (Estd.): <b> {totalPrice} </b> PKR
            </label>
          </td>
        </tr>
      </Fragment>
    );
  };

  function titleCase(str) {
    if (str) {
      return str
        .toLowerCase()
        .split(" ")
        .map(function (word) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
    } else return "";
  }
  //FollowUp Appointment

  const handleFollowUpModal = () => {
    setSelectedValue(
      currentData.doctorinfo.appointment_location.appointment_location_of_doctor
    );
    setFollowUPModal(true);
    availableSlots(locationID, date);
  };

  const handleConfirmFollowUp = (appointment_ID) => {
    const newdate = getDatetoSet(date);
    console.log(
      "appointment ID ",
      appointment_ID,
      "location id : ",
      locationID,
      "time ",
      timeSlot,
      " date ",
      newdate,
      " appointment_type ",
      patAppointmentType
    );
    scheduleFollowupAPI(
      0,
      locationID,
      0,
      appointment_ID,
      "POST", "doctor", elementDocId,
      getDatetoSet(date),
      timeSlot,
      patAppointmentType
    ).then((result) => {
      console.log("followup ", result);
      handleModalClose();
      collectDisabledDays(currentData.doctorinfo.appointment_location.days, 0);
    });
  };

  const handleModalClose = () => {
    setFollowUPModal(false);
  };

  const handleLocationChange = (e) => {
    setSelectedValue(e.target.value);
    collectDisabledDays(getLocDays(e.target.value));
  };

  const renderItem = () => {
    console.log("locationData is ", locationData);
    return locationData.map((item, key) => (
      <option value={item.location}>{item.location}</option>
    ));
  };

  const AppointmentTypeRadioButton = ({ value }) => {
    console.log("radio status:", patAppointmentType);
    return (
      <input
        style={{ width: 20 }}
        type="radio"
        value={value}
        name="appointment_type"
        checked={value === patAppointmentType}
        onChange={(e) => {
          setPatAppointmentType(e.target.value);
          console.log("type selected:", e.target.value);
        }}
      />
    );
  };

  const renderAppointmentType = (value) => {
    console.log(
      "appointment type ",
      value,
      "patient appointment type",
      patAppointmentType
    );
    if (value === "both") {
      return (
        <Fragment key={patAppointmentType}>
          <AppointmentTypeRadioButton value={"inperson"} />{" "}
          <span>Inperson</span>
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
          <AppointmentTypeRadioButton value={"telehealth"} />{" "}
          <span>Telehealth </span>
        </Fragment>
      );
    } else return <div>{patAppointmentType}</div>;
  };

  const collectDisabledDays = (docData, index) => {
    let a = [];
    let d1 = docData;
    console.log("d1,", d1);
    let d2 = d1.split("-");
    let days2 = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    let days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    for (var k = 0; k < 7; k++) {
      days = days.filter((item) => item !== d2[k]);
    }
    console.log("doc data is ", days);

    for (var j = 0; j < days.length; j++) {
      for (var i = 0; i < days2.length; i++) {
        if (days[j].toLowerCase() == days2[i].toLocaleLowerCase()) {
          console.log("i is ", i);

          a.push(i);
        }
      }
    }
    setDisabledDays(a);
  };

  const getLocDays = (value) => {
    for (var i = 0; i < locationData.length; i++) {
      if (locationData[i].location == value) {
        console.log(
          "hospital Location id ",
          locationData[i].doctors_hospital_location_id,
          " Appointment Type ",
          locationData[i].appointment_type
        );
        setLoactionID(locationData[i].doctors_hospital_location_id);
        setDocAppointmentType(locationData[i].appointment_type);
        if (locationData[i].appointment_type !== "both")
          setPatAppointmentType(locationData[i].appointment_type);
        return locationData[i].days;
      }
    }
    return [];
  };

  const onChange = (date) => {
    setDate(date);
    availableSlots(locationID, date);
    console.log("my date ", date);
  };

  const availableSlots = (location_id, date) => {
    const newdate = getDatetoSet(date);
    console.log("my results ", location_id, " ", newdate);
    availableSlotsAPI(elementDocId, location_id, "PUT", getDatetoSet(date)).then(
      (result) => {
        console.log("available", result);
        if (result[0]) setSlots(result[0].time_slots);
      }
    );
  };

  const renderAvailableSlots = () => {
    return (
      <div style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <div className="SlotsHead">
          {" "}
          <b> Available Slots </b>
        </div>
        <Divider className="AppointmentDivder" />
        <Fragment>
          {slots.map((item) => (
            <input
              className="SlotsInput"
              onClick={() => setTimeSlot(getSlot(item.available_time_slot))}
              type="button"
              value={getSlot(item.available_time_slot)}
            ></input>
          ))}
        </Fragment>
      </div>
    );
  };

  const schduleFollowUpModal = () => {
    return (
      <Modal
        show={showFollowUpModal}
        onHide={handleModalClose}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="ModalTitle">FollowUp Modal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <div style={styles.header_container}>
              <Avatar
                //  src={image}
                style={styles.avatar}
              />
              <div style={styles.title_container}>
                <div style={styles.title__name}>
                  {" "}
                  {titleCase(patientinfo.name)}
                </div>
                <div style={styles.title__label}>
                  Current Time: {getTime(currentData.date_time_of_appointment)}
                </div>
              </div>
            </div>
          </Row>
          <Divider className="AppointmentDivder" />
          <div className="SelectBox">
            <h6 className="optionHeading">Select Location </h6>
            <select value={selectValue} onChange={handleLocationChange}>
              <option value="">Please Select a Location</option>
              {renderItem()}
            </select>
          </div>
          <div className="SelectBox mtt-10">
            <h6 className="optionHeading">Appointment Type </h6>
            {renderAppointmentType(docAppointmentType)}
          </div>
          <Divider className="AppointmentDivder" />
          <Row className="mtt-20">
            <Col lg={6} style={{ borderRight: "1px solid #efefef" }}>
              <Calender
                minDate={new Date()}
                maxDate={new Date(moment().add(3, "months"))}
                value={date}
                tileDisabled={({ date, view }) =>
                  view === "month" && // Block day tiles only
                  disabledDays.some(
                    (disabledDay) => date.getDay() === disabledDay
                  )
                }
                onChange={onChange}
                value={new Date(currentData.date_time_of_appointment)}
              />
            </Col>
            <Col lg={6}>{renderAvailableSlots()}</Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => handleConfirmFollowUp(currentData.appointment_id)}
            style={{ marginLeft: "10px" }}
          >
            Schedule FollowUp
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const renderNoteList = () => {
    if (!!noteVal)
      return noteVal.map((item, i) => (
        <Row key={i}>
          <Col lg="11" style={{ paddingRight: "0px" }}>
            <TextArea
              rows={2}
              style={{ width: "100%", marginTop: "5px" }}
              value={item.doctor_note}
              onChange={(e) => {
                let temp = [...noteVal];
                temp[i].doctor_note = e.target.value;
                setNoteVal(temp);
              }}
              onBlur={() => {
                handleEditNotes(item.doctor_note_id, noteVal[i].doctor_note);
              }}
              placeholder="Doctor's Note"
            />
          </Col>
          <Col lg="1">
            {i !== 0 ? (
              <RemoveCircleOutlineTwoToneIcon
                style={{ marginTop: "17px", fontSize: "25px", color: "red" }}
                onClick={() => {
                  handleDeleteNotes(item.doctor_note_id);
                }}
              />
            ) : (
              <AddCircleOutlineOutlinedIcon
                style={{
                  marginTop: "17px",
                  fontSize: "25px",
                  color: "#e0004d",
                }}
                className="dynamic-delete-button"
                onClick={() => {
                  handleAddNotes();
                }}
              />
            )}
          </Col>
        </Row>
      ));
    else return "";
  };

  const copyFromFollowup = () => {
    console.log(
      " Copy from followup is: before ifffff: ",
      props.copyingData.appointment_id,
      appointment_ID
    );
    if (
      symptomsList.length === 0 &&
      diagnosisList.length === 0 &&
      prescriptionsList.length === 0 &&
      testsList.length === 0
    ) {
      console.log(" Copy from followup result function");
      copyFromFollowupDataAPI(
        props.copyingData.appointment_id,
        appointment_ID
      ).then((result) => {
        console.log(" Copy from followup result is: ", result);
        appointmentData();
      });
    }
  };

  const [appointmentStartTime, setAppointmentStartTime] = useState([])

  useEffect(() => {
    if (!!currentData && currentData !== 0) {
      console.log("Appointment State Logs: id", currentData.appointment_id)
      appointmentStateLog(currentData.appointment_id).then(result => {
        console.log("Appointment State Logs: current", result)
        setAppointmentStartTime(result.inprogress);
      }
      )
    }
  }, [currentData])

  return (
    <Container fluid style={{ marginTop: 10 }}>
      <Row>
        {/* Left Column */}
        <Col>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", borderBottom: "#00000018 solid 1px" }}>
            {!!currentData && currentData !== 0 &&
              <div>{getTime(currentData.date_time_of_appointment)} , {getDate(currentData.date_time_of_appointment)}</div>
            }
            {pdfKey && (!!dataForPDF && dataForPDF.length !== [] &&
              <PDFGenerator
                // key={pdfKey}
                appointmentData={dataForPDF}
                quickDownload
                appointmentStartTime={appointmentStartTime} />
            )
            }
            {props.copyButton && props.copyingData !== "" && (
              <div>
                <Tooltip title={"Copy From Follow-up"} placement="bottom" trigger="hover">
                  <IconButton>
                    <FileCopyOutlinedIcon
                      style={{ color: 'grey', fontSize: '24px', padding: 2, cursor: 'pointer' }}
                      onClick={copyFromFollowup} />
                  </IconButton>
                </Tooltip>
                {/* <div>
                  <Button onClick={copyFromFollowup} type="primary">
                    Copy from Follow-up
                  </Button>
                </div> */}
              </div>
            )}
          </div>
          <div style={{ textAlign: "left", padding: 5, marginBottom: 10 }}>
            <h6 className="DropLabel">Symptoms</h6>
            <Select
              showSearch
              placeholder={"Add Symptoms"}
              style={{ width: "100%" }}
              defaultActiveFirstOption={false}
              value={null}
              onSearch={SymptomsSearch}
              onSelect={SymptomsInputCallback}
              options={suggestList}
              onInputKeyDown={handleSymptomKeyDown}
            ></Select>
            <br />
            {!!symptomsList && (
              <Tags
                tagsList={symptomsList}
                key={symptomsList.length}
                delete={deleteSymptoms}
              />
            )}
          </div>

          <div style={{ textAlign: "left", padding: 5, marginBottom: 10 }}>
            <h6 className="DropLabel">Tests </h6>
            <Select
              showSearch
              placeholder={"Add Tests"}
              style={{ width: "100%" }}
              defaultActiveFirstOption={false}
              value={null}
              onSearch={TestsSearch}
              onSelect={TestsInputCallback}
              options={suggestTestList}
              onInputKeyDown={(e) => handleTestKeyDown(e)}
            ></Select>
            {!!testsList && (
              <TestsList
                testsList={testsList}
                key={testsList.length}
                delete={deleteTests}
                data={currentData}
                amount={setTotalTestAmount}
                refreshList={refreshTestListOnUpload}
              />
            )}
          </div>

          <div style={{ textAlign: "left", padding: 5, marginBottom: 10 }}>
            <h6 className="DropLabel">Doctor's Note</h6>
            {renderNoteList()}
          </div>

          <div style={{ textAlign: "left", padding: 5, marginBottom: 10 }}>
            <h6 className="DropLabel">Diagnosis</h6>
            <Select
              showSearch
              placeholder={"Add Diagnosis"}
              style={{ width: "100%" }}
              defaultActiveFirstOption={false}
              value={null}
              onSearch={DiagnosisSearch}
              onSelect={diagnosisInputCallback}
              options={suggestDiagnosisList}
              onInputKeyDown={(e) => handleDiagnosisKeyDown(e)}
            ></Select>
            <br />{" "}
            {!!diagnosisList && (
              <Tags
                tagsList={diagnosisList}
                key={diagnosisList.length}
                delete={deleteDiagnosis}
              />
            )}
          </div>

          <div style={{ textAlign: "left", padding: 5 }}>
            <h6 className="DropLabel">Prescrptions</h6>
            <Select
              showSearch
              placeholder={"Add Medicine"}
              style={{ width: "100%" }}
              defaultActiveFirstOption={false}
              value={null}
              onSearch={PrescriptionsSearch}
              onSelect={PrescriptionsInputCallback}
              options={suggestPrescriptionList}
              onInputKeyDown={(e) => handleMedicineKeyDown(e)}
            ></Select>
            {/* <InputDropDown
              onValueSelected={PrescriptionsInputCallback}
              title="Prescription"
              suggestList={suggestPrescriptionList}
              onValueChange={PrescriptionsSearch}
            /> */}
            {renderEditNewPrescription()}
            {!!prescriptionsList && prescriptionsList.length !== 0 && (
              <table className="table table-bordered ListData mtt-20">
                <thead>
                  <tr>
                    <th> Medicine </th>
                    <th>Dosage</th>
                    <th>Days</th>
                    <th> # of Tabs </th>
                    <th> Remove </th>
                    <th> Price </th>
                  </tr>
                </thead>
                <tbody>
                  {!!prescriptionsList && renderAddedPrescriptions()}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <div style={{ textAlign: "right", marginRight: "10px" }}>
              <h6 className="DropLabel" style={{ color: "#6c757d" }}>
                Doctor's Fee:{" "}
                <label>
                  <b> {fee} </b> PKR
                </label>
              </h6>
              <Divider />
              <h6 className="DropLabel" style={{ color: "#6c757d" }}>
                Total Cost (Estd.) :{" "}
                <label>
                  <b> {totalPriceCount + totalTestAmount + fee} </b> PKR
                </label>
              </h6>
            </div>
          </div>
        </Col>
        {schduleFollowUpModal()}
      </Row>
    </Container>
  );
};

export default CurrentTabPatient;

CurrentTabPatient.defaultProps = {
  appointmentData: [],
  appointmentId: 0,
  patientId: 0,
  validation: () => { },
  copyButton: false,
  copyingData: "",
  editing: false,
  setConfirmEditing: () => { },
};

const styles = {
  input: { fontSize: 14, padding: 8, borderRadius: "5px" },
  edit_label: { fontSize: 14, color: "#656262", fontWeight: "550" },
  medicine_title: {
    color: "#e0004d",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  text_area: {
    fontSize: 14,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: "5px",
    outline: "none",
    border: "1px solid #cfcfcf",
    // boxShadow: "0px 5px 25px whitesmoke",
    backgroundColor: "#fbfbfb",
    paddingTop: 7,
    width: "100%",
  },
};

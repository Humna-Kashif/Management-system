import React, {
  useEffect,
  useState,
  useCallback,
  Fragment,
  useContext,
} from "react";
import { Col, Row } from "react-bootstrap";
import { Avatar, Divider, InputBase, IconButton, Grid } from "@material-ui/core";
import SendIcon from '@material-ui/icons/Send';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import PrintIcon from '@material-ui/icons/Print';
import { Empty, Table } from 'antd';
import { getComments, addComment, saveNotification, generateCommentNotification, appointmentStateLog } from "../Hooks/API"
import { downloadFile } from '../Hooks/ImageAPI'
import { getTime, getDate, getDateOfBirth } from '../Hooks/TimeHandling';
import moment from 'moment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../Styles/Pdf.css';
import '../Styles/Comments.css';
import '../Styles/PatientHistory.css';
import Logo from '../Styles/Assets/myhealthlogo.png';
import { GlobalContext } from "../Context/GlobalState";
import PDFGenerator from "./PDFPanel/PDFGenerator";
import { Tooltip } from "antd";


import ComparisonIcon from '../Images/compare.png'
import ComparisonOnIcon from '../Images/compare_true.png'

const Colors = {
  primaryColor: "#e0004d",
  baseColorDarker2: "#e0e0e0",
};
const Prescriptioncolumns = [
  {
    title: "Medicine",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Dosage",
    dataIndex: "dosage",
    key: "dosage",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
];
const Testcolumns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
];

const HistoryPatientDetail = (props) => {
  const data = props.itemData;
  const itemTrailData = props.itemTrailData;
  const { accountId, accountType,elementDocId } = useContext(GlobalContext);
  console.log("Data in history detail is ", data);
  // const appointmentID = props.appointment_id;
  const [isCommentVisible, setCommentVisible] = useState(false);
  const [commentValue, setCommentValue] = useState("");
  const [commentList, setCommentList] = useState([]);
  const [senderType, setSenderType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [image, setImage] = useState(null);
  const [patImage, setPatImage] = useState(null);
  // const [estimatedPrice, setEstimatedPrice] = useState("");
  const [toggleComparison, setToggleComparison] = useState(false);

  const handleModalClose = () => {
    setShowModal(false);
  };
  const handleShowModal = () => {
    setShowModal(true);
  };
  const onCommentPressed = () => {
    console.log("comment pressed: ", isCommentVisible);
    setCommentVisible(!isCommentVisible);
  };

  //Get Comments
  const displayComments = useCallback(() => {
    console.log("Comments dataaa", data.appointmentID);
    getComments(
      elementDocId,
      data.patientinfo.patient_id,
      data.appointment_id
    ).then((result) => {
      console.log("Commnets are result", result);
      if (result.length === 0) {
        setCommentList([]);
      }
      if (!!result[0]) {
        console.log("Commnets are ", result[0].comments, result[0].sender);
        console.log(
          "Commnets dates are ",
          result[0].comments[0].date_time_of_comment
        );
        let x = result[0].comments[0].date_time_of_comment;
        setCommentList([]);
        setCommentList(result[0].comments.reverse());
      }
    });
  }, [data.appointmentID, data.appointment_id]);

  const showImage = useCallback(() => {
    if (!!elementDocId) {
      downloadFile(accountType, elementDocId, "profile")
        .then((json) => {
          setImage("data:image;charset=utf-8;base64," + json.encodedData);
        })
        .catch((error) => console.error(error))
        .finally(() => { });
    } else {
      console.log("Downloading Image Failed! id is null");
    }
  }, [elementDocId]);

  //show patient image
  const showPatImage = useCallback(() => {
    if (!!data.patientinfo.patient_id) {
      downloadFile("patients", data.patientinfo.patient_id, "profile")
        .then((json) => {
          setPatImage("data:image;charset=utf-8;base64," + json.encodedData);
        })
        .catch((error) => console.error(error))
        .finally(() => { });
    } else {
      console.log("Downloading Image Failed! id is null");
    }
  }, [data.patientinfo.patient_id]);

  //addComment
  const handleAddComment = (value) => {
    console.log(
      "the values are ",
      elementDocId,
      "   ",
      data.appointment_id,
      "   ",
      value
    );
    let regex = /^\s+$/;
    if (!value.match(regex) && value !== "") {
      addComment(
        elementDocId,
        data.patientinfo.patient_id,
        data.appointment_id,
        "POST",
        value
      ).then((result) => {
        console.log("Comments Data are :", result);
        displayComments();
        setCommentValue("");
        // generate_notification("POST", data.doctorinfo.name, data.date_time_of_appointment);
        generateCommentNotification(
          "POST",
          data.doctorinfo.name,
          data.date_time_of_appointment
        );
        const notification_type = "comment";
        const notification_receiver = "patient";
        // save notification API
        saveNotification(
          "POST",
          data.patientinfo.patient_id,
          data.doctorinfo.doctor_id,
          data.appointment_id,
          notification_type,
          notification_receiver
        );
      });
    }
  };

  // const handleKeyPress = (value) =>{
  //   if(e.key === 'Enter'){
  //   console.log("the values are ", doc_ID,"   ",data.appointment_id,"   ",value)
  //     addComment(0,doc_ID,0,data.appointment_id,"POST",value).then(result => {
  //     console.log(result);
  //     displayComments();
  //   });
  // }
  // }

  // const handleInputPress = () => {
  // console.log("Input pressed", commentValue);
  // const newComment = {username: "Dr. John", commentText: commentValue, commentTime: "1 min ago"};
  // appointmentID.comments.push(newComment);
  // setCommentValue("");
  // };

  const renderCommentsList = commentList.map((data, i) => (
    <Fragment>
      <Grid
        item
        container
        wrap="nowrap"
        spacing={2}
        id={data.comment_id}
        key={i}
      >
        {!!(data.sender === "doctor" && data.doctor_info) ? (
          <Grid item>
            <Avatar src={image} className="ComMainAv" />
          </Grid>
        ) : (
          <Grid item>
            <Avatar src={patImage} className="ComMainAv" />
          </Grid>
        )}
        <Grid item xs zeroMinWidth>
          <Row>
            <Col lg="9">
              {!!(data.sender === "doctor" && data.doctor_info) ? (
                <h4 className="Com-Name">{data.doctor_info.name}</h4>
              ) : (
                <h4 className="Com-Name">{data.patient_info.name}</h4>
              )}
            </Col>
            <Col lg="3">
              <div className="Com-moments">
                {moment(data.date_time_of_comment).fromNow()}{" "}
              </div>
            </Col>
          </Row>
          <p className="ComText"> {data.comment} </p>
        </Grid>
      </Grid>
      <Divider variant="fullWidth" className="Comments-Divider" />
      <br />
    </Fragment>
  ));

  const renderSymptoms = () => {
    return (
      <div className="SymptomsDiv">
        {!!data.appointment_data.symptoms ? (
          data.appointment_data.symptoms.map((role, i) => (
            <Fragment>
              <Chip key={i} label={role.name} variant="outlined" />
              &nbsp;
            </Fragment>
          ))
        ) : (
          <div style={{ textAlign: "left" }}>
            No Symptoms Mentioned
            {/* <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Symptoms Mentioned'}/> */}
          </div>
        )}
      </div>
    );
  };

  const renderSymptomsComp = () => {
    let CollectVals = false;
    let allSymptoms = [];
    itemTrailData.followups.map((i) => {
      if (CollectVals) {
        if (!!i.appointment_data.symptoms) {
          let temp = i.appointment_data.symptoms.slice();
          allSymptoms.push(...temp);
          CollectVals = false;
        }
      }
      console.log(
        "itemTrailData",
        itemTrailData,
        data,
        CollectVals,
        "all Symptoms",
        allSymptoms
      );
      if (i.appointment_id === data.appointment_id) CollectVals = true;
    });
    let deletedSymptoms = [];
    let addedSymptoms = [];
    let sameSymptoms = [];
    if (!!data.appointment_data.symptoms) {
      deletedSymptoms = allSymptoms.map(
        (x) =>
          !data.appointment_data.symptoms.some((y) => y.name === x.name) && x
      );
      deletedSymptoms = deletedSymptoms.filter((x) => x !== false);
      deletedSymptoms = [...new Set(deletedSymptoms)].slice();
      addedSymptoms = data.appointment_data.symptoms.map(
        (x) => !allSymptoms.some((y) => y.name === x.name) && x
      );
      addedSymptoms = addedSymptoms.filter((x) => x !== false);
      sameSymptoms = data.appointment_data.symptoms.map(
        (x) => allSymptoms.some((y) => y.name === x.name) && x
      );
      sameSymptoms = sameSymptoms.filter((x) => x !== false);
    } else {
      deletedSymptoms = allSymptoms.slice();
      addedSymptoms = [];
      sameSymptoms = [];
    }
    console.log(
      "itemTrailData diff",
      allSymptoms,
      data.appointment_data.symptoms,
      "all Symptoms: deleted",
      deletedSymptoms,
      "added",
      addedSymptoms,
      "common",
      sameSymptoms
    );
    return (
      <div>
        {sameSymptoms.map((role, i) => (
          <Fragment>
            <Chip key={i} label={role.name} variant="outlined" />
            &nbsp;
          </Fragment>
        ))}
        {addedSymptoms.map((role, i) => (
          <Fragment>
            <Chip
              key={i}
              style={{ backgroundColor: "lightgreen" }}
              label={role.name}
              variant="outlined"
            />
            &nbsp;
          </Fragment>
        ))}
        {deletedSymptoms.map((role, i) => (
          <Fragment>
            <Chip
              style={{
                backgroundColor: "lightsalmon",
                textDecoration: "line-through",
              }}
              key={i}
              label={role.name}
              variant="outlined"
            />
            &nbsp;
          </Fragment>
        ))}
      </div>
    );
  };

  const renderDiagnosis = () => {
    return (
      <div className="SymptomsDiv">
        {!!data.appointment_data.diagnosis ? (
          data.appointment_data.diagnosis.map((role, i) => (
            <Fragment>
              <Chip key={i} label={role.name} variant="outlined" />
              &nbsp;
            </Fragment>
          ))
        ) : (
          <div> No Diagnosis Mentioned </div>
        )}
      </div>
    );
  };

  const renderDiagnosisComp = () => {
    let CollectVals = false;
    let allDiagnosis = [];
    itemTrailData.followups.map((i) => {
      if (CollectVals) {
        if (!!i.appointment_data.diagnosis) {
          let temp = i.appointment_data.diagnosis.slice();
          allDiagnosis.push(...temp);
          CollectVals = false;
        }
      }
      console.log(
        "itemTrailData",
        itemTrailData,
        data,
        CollectVals,
        "all Diagnosis",
        allDiagnosis
      );
      if (i.appointment_id === data.appointment_id) CollectVals = true;
    });
    let deletedDiagnosis = [];
    let addedDiagnosis = [];
    let sameDiagnosis = [];
    if (!!data.appointment_data.diagnosis) {
      deletedDiagnosis = allDiagnosis.map(
        (x) =>
          !data.appointment_data.diagnosis.some((y) => y.name === x.name) && x
      );
      deletedDiagnosis = deletedDiagnosis.filter((x) => x !== false);
      addedDiagnosis = data.appointment_data.diagnosis.map(
        (x) => !allDiagnosis.some((y) => y.name === x.name) && x
      );
      addedDiagnosis = addedDiagnosis.filter((x) => x !== false);
      sameDiagnosis = data.appointment_data.diagnosis.map(
        (x) => allDiagnosis.some((y) => y.name === x.name) && x
      );
      sameDiagnosis = sameDiagnosis.filter((x) => x !== false);
    } else {
      deletedDiagnosis = allDiagnosis.slice();
      addedDiagnosis = [];
      sameDiagnosis = [];
    }
    console.log(
      "itemTrailData diff",
      allDiagnosis,
      data.appointment_data.diagnosis,
      "all diagnosis: deleted",
      deletedDiagnosis,
      "added",
      addedDiagnosis,
      "common",
      sameDiagnosis
    );
    return (
      <div>
        {sameDiagnosis.map((role, i) => (
          <Fragment>
            <Chip key={i} label={role.name} variant="outlined" />
            &nbsp;
          </Fragment>
        ))}
        {addedDiagnosis.map((role, i) => (
          <Fragment>
            <Chip
              key={i}
              style={{ backgroundColor: "lightgreen" }}
              label={role.name}
              variant="outlined"
            />
            &nbsp;
          </Fragment>
        ))}
        {deletedDiagnosis.map((role, i) => (
          <Fragment>
            <Chip
              style={{
                backgroundColor: "lightsalmon",
                textDecoration: "line-through",
              }}
              key={i}
              label={role.name}
              variant="outlined"
            />
            &nbsp;
          </Fragment>
        ))}
      </div>
    );
  };

  const renderTests = () => {
    const Tests = [];
    data.appointment_data.tests.map((role, i) =>
      Tests.push({
        key: i,
        name: role.name,
        price: role.price_in_pkr,
        status: "",
      })
    );
    return Tests;
  };

  const renderTestComp = () => {
    let CollectVals = false;
    let allTests = [];
    itemTrailData.followups.map((i) => {
      if (CollectVals) {
        if (!!i.appointment_data.tests) {
          let temp = i.appointment_data.tests.slice();
          allTests.push(...temp);
          CollectVals = false;
        }
      }
      console.log(
        "itemTrailData",
        itemTrailData,
        data,
        CollectVals,
        "all allTests",
        allTests
      );
      if (i.appointment_id === data.appointment_id) CollectVals = true;
    });
    let deletedTest = [];
    let addedTest = [];
    let sameTest = [];
    if (!!data.appointment_data.tests) {
      deletedTest = allTests.map(
        (x) => !data.appointment_data.tests.some((y) => y.name === x.name) && x
      );
      deletedTest = deletedTest.filter((x) => x !== false);
      addedTest = data.appointment_data.tests.map(
        (x) => !allTests.some((y) => y.name === x.name) && x
      );
      addedTest = addedTest.filter((x) => x !== false);
      sameTest = data.appointment_data.tests.map(
        (x) => allTests.some((y) => y.name === x.name) && x
      );
      sameTest = sameTest.filter((x) => x !== false);
    } else {
      deletedTest = allTests.slice();
      addedTest = [];
      sameTest = [];
    }
    console.log(
      "itemTrailData test diff",
      allTests,
      data.appointment_data.tests,
      "all Tests: deleted",
      deletedTest,
      "added",
      addedTest,
      "common",
      sameTest
    );

    const newTests = [];

    addedTest.map((role, i) =>
      newTests.push({
        key: i,
        name: role.name,
        price: role.price_in_pkr,
        status: "added",
      })
    );
    sameTest.map((role, i) =>
      newTests.push({
        key: i,
        name: role.name,
        price: role.price_in_pkr,
        status: "same",
      })
    );
    deletedTest.map((role, i) =>
      newTests.push({
        key: i,
        name: role.name,
        price: role.price_in_pkr,
        status: "deleted",
      })
    );

    return newTests;
  };

  // const EstimatedPrice = useCallback(() => {
  //   if (!!data.appointment_data.prescriptions) {
  //     let result = data.appointment_data.prescriptions.reduce(function (
  //       tot,
  //       arr
  //     ) {
  //       // return the sum with previous value
  //       return tot + arr.price;
  //       // set initial value as 0
  //     },
  //       0);
  //     console.log("Estimated Price is", result);
  //     setEstimatedPrice(result);
  //   } else setEstimatedPrice("");
  // }, [data.appointment_data.prescriptions]);

  useEffect(() => {
    displayComments([]);
    // EstimatedPrice();
    showImage();
    showPatImage();
  }, [
    props.itemData,
    displayComments,
    // EstimatedPrice,
    showImage,
    showPatImage,
  ]);

  const [appointmentStartTime, setAppointmentStartTime] = useState([])

  useEffect(() => {
    if (!!props.itemData && props.itemData.length !== 0) {
      console.log("Appointment State Logs: id", props.itemData.appointment_id)
      appointmentStateLog(props.itemData.appointment_id).then(result => {
        console.log("Appointment State Logs: ", result)
        setAppointmentStartTime(result.inprogress);
      }
      )
    }
  }, [props.itemData])

  const renderPrescription = () => {
    const prescriptions = [];
    data.appointment_data.prescriptions.map((role, i) =>
      prescriptions.push({
        key: i,
        name: role.name,
        dosage: role.frequency,
        price: role.price,
        status: "",
      })
    );

    return prescriptions;
  };

  const renderPrescriptionComp = () => {
    let CollectVals = false;
    let allPrescription = [];
    itemTrailData.followups.map((i) => {
      if (CollectVals) {
        if (!!i.appointment_data.prescriptions) {
          let temp = i.appointment_data.prescriptions.slice();
          allPrescription.push(...temp);
          CollectVals = false;
        }
      }
      console.log(
        "itemTrailData",
        itemTrailData,
        data,
        CollectVals,
        "all allPrescription",
        allPrescription
      );
      if (i.appointment_id === data.appointment_id) CollectVals = true;
    });
    let deletedPrescription = [];
    let addedPrescription = [];
    let samePrescription = [];
    if (!!data.appointment_data.prescriptions) {
      deletedPrescription = allPrescription.map(
        (x) =>
          !data.appointment_data.prescriptions.some((y) => y.name === x.name) &&
          x
      );
      deletedPrescription = deletedPrescription.filter((x) => x !== false);
      addedPrescription = data.appointment_data.prescriptions.map(
        (x) => !allPrescription.some((y) => y.name === x.name) && x
      );
      addedPrescription = addedPrescription.filter((x) => x !== false);
      samePrescription = data.appointment_data.prescriptions.map(
        (x) => allPrescription.some((y) => y.name === x.name) && x
      );
      samePrescription = samePrescription.filter((x) => x !== false);
    } else {
      deletedPrescription = allPrescription.slice();
      addedPrescription = [];
      samePrescription = [];
    }
    console.log(
      "itemTrailData diff",
      allPrescription,
      data.appointment_data.prescriptions,
      "all Prescription: deleted",
      deletedPrescription,
      "added",
      addedPrescription,
      "common",
      samePrescription
    );

    const newPrescriptions = [];

    addedPrescription.map((role, i) =>
      newPrescriptions.push({
        key: i,
        name: role.name,
        dosage: role.frequency,
        price: role.price,
        status: "added",
      })
    );
    samePrescription.map((role, i) =>
      newPrescriptions.push({
        key: i,
        name: role.name,
        dosage: role.frequency,
        price: role.price,
        status: "same",
      })
    );
    deletedPrescription.map((role, i) =>
      newPrescriptions.push({
        key: i,
        name: role.name,
        dosage: role.frequency,
        price: role.price,
        status: "deleted",
      })
    );

    return newPrescriptions;
  };

  // Comments Section
  const renderComments = () => {
    return (
      <Fragment>
        {/* Head */}
        <div
          className="Comments-Head"
          style={{
            borderBottomColor: Colors.baseColorDarker2,
            marginTop: "6px",
          }}
        >
          <h6 style={{ color: Colors.primaryColor }} onClick={onCommentPressed}>
            Comments
            <span>
              <label className="CommentsLabel">
                {" "}
                <b>{commentList.length} </b>
              </label>{" "}
            </span>
          </h6>
        </div>
        {/* Input Comment */}
        <Row>
          <Col lg={2}>
            <Avatar src={image} style={styles.avatar} />
          </Col>
          <Col lg={10} className="CommentInputdiv">
            <Paper className="Comment-Box">
              <InputBase
                className="Comments-BoxIn"
                placeholder="Enter your comment"
                inputProps={{ "aria-label": "enter your comment" }}
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleAddComment(commentValue)
                }
              />
              <Divider
                style={{ height: 28, margin: 4 }}
                orientation="vertical"
              />
              <IconButton
                style={{ color: Colors.primaryColor, padding: 10 }}
                aria-label="directions"
                onClick={() => {
                  handleAddComment(commentValue);
                }}
              >
                <SendIcon />
              </IconButton>
            </Paper>
          </Col>
        </Row>
        {/* Main Comment  */}
        <Paper className="Comments-Container">
          <div className="scrollbox">
            {!!data.comment ? (
              <div>
                {" "}
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={"No comments to display"}
                />{" "}
              </div>
            ) : (
              <div>{renderCommentsList} </div>
            )}
          </div>
        </Paper>
      </Fragment>
    );
  };

  const totalTestPrice = () => {
    let price = 0;
    !!data.appointment_data.tests &&
      data.appointment_data.tests.map((t) => (price += t.price_in_pkr));
    return price;
  };

  const totalPrescriptionPrice = () => {
    let price = 0;
    !!data.appointment_data.prescriptions &&
      data.appointment_data.prescriptions.map((p) => (price += p.price));
    return price;
  };

  const totalCost = () => {
    let fee = !!data.doctorinfo.appointment_location.fee_details
      ? parseInt(data.doctorinfo.appointment_location.fee_details.payment)
      : (!!data.doctorinfo.appointment_location.fees
        ? parseInt(data.doctorinfo.appointment_location.fees)
        : 0);
    let total = 0;
    total = totalPrescriptionPrice() + totalTestPrice() + fee;
    return total;
  };


  const renderPrice = () => {
    return (
      !!data.appointment_data && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              flexDirection: "row",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flex: 1,
                paddingRight: 16,
                fontSize: 10,
                fontWeight: "bold",
                fontStyle: "italic",
                justifyContent: "flex-end",
              }}
            >
              Doctor's Fee :
            </div>
            <div
              style={{
                display: "flex",
                width: 120,
                paddingLeft: 16,
                fontWeight: "solid",
              }}
            >
              {!!data.doctorinfo.appointment_location.fee_details
                ? parseInt(data.doctorinfo.appointment_location.fee_details.payment)
                : (!!data.doctorinfo.appointment_location.fees
                  ? parseInt(data.doctorinfo.appointment_location.fees)
                  : "0")}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              flexDirection: "row",
              borderTop: "#00000034 0.3px solid",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flex: 1,
                paddingRight: 16,
                fontSize: 10,
                fontWeight: "bold",
                fontStyle: "italic",
                justifyContent: "flex-end",
              }}
            >
              Total Cost (Estd.) :
            </div>
            <div
              style={{
                display: "flex",
                width: 120,
                paddingLeft: 16,
                fontWeight: "solid",
              }}
            >
              {totalCost()}
            </div>
          </div>
        </div>
      )
    );
  };

  const followUpFromTrail = () => {
    let getNextDate = false;
    let nextDate = "";
    itemTrailData.followups.map((i) => {
      if (getNextDate) {
        nextDate = i.date_time_of_appointment;
        getNextDate = false;
      }
      if (i.appointment_id === data.appointment_id) {
        getNextDate = true;
      }
    })
    return moment(nextDate).format("hh:mm A, Do MMM, yyyy");
  }

  return (
    <Fragment>
      <div className="PreviousHistory" style={{ ...props.style, paddingLeft: 12, paddingRight: 12 }}>
        <Row style={{ alignItems: "center", paddingLeft: 12, paddingRight: 12 }}>
          <Col lg={10}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flex: 2,
                alignItems: "baseline",
              }}
            >
              <h6 className="Name" style={{ color: "#e0004d", marginRight: 8 }}>
                Patient:
              </h6>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "baseline",
                  textTransform: "capitalize",
                  flex: 1,
                }}
              >
                <div style={{ fontSize: 18 }}>
                  {data.patientinfo.name}
                </div>
                <div style={{ paddingLeft: 5, fontSize: 12 }}>
                  - {getDateOfBirth(data.patientinfo.dob)} years (
                  {data.patientinfo.gender})
                </div>
              </div>
            </div>
          </Col>
          <Col lg={2}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
              {itemTrailData.followups.length !== 1 && (data.appointment_id !== data.parent_appointment_id) && (
                <div onClick={() => setToggleComparison(!toggleComparison)}>
                  <Tooltip title={toggleComparison ? "Comparison Off" : "Comparison On"} placement="bottom" trigger="hover">
                    <IconButton style={{ fontSize: 16, color: "#000000a1" }}>
                      <img src={toggleComparison ? ComparisonOnIcon : ComparisonIcon} style={{ width: 16 }} />
                    </IconButton>
                  </Tooltip>
                  {/* <img src={require('../Images/compare.png')} alt='heart heartbeat' /> */}

                </div>
              )}
              <PDFGenerator appointmentData={data} appointmentStartTime={appointmentStartTime} />
            </div>
          </Col>
        </Row>
        <Divider />
        <div id="capture">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center", paddingLeft: 12, paddingRight: 12
            }}
          >
            <div className="DoctorInfo mtt-10" style={{ flex: 1 }}>
              <h6 className="Name">{data.doctorinfo.name}</h6>
              <h6 className="Tags">
                {data.doctorinfo.specialization
                  ? data.doctorinfo.specialization
                  : "Cardiologist"}
              </h6>
            </div>
            <div style={{ flex: 1 }}>
              {" "}
              <img
                src={Logo}
                style={{ height: "75px", width: "75px", marginLeft: "-25px" }}
                alt="logo"
              />{" "}
            </div>
            <div
              className="DoctorInfo mtt-10"
              style={{ flex: 1, textAlign: "right" }}
            >
              <h6 className="Name">
                {" "}
                {
                  data.doctorinfo.appointment_location.location_info
                    .appointment_location_of_doctor
                }
              </h6>
              {/* <div className="SubTags">
                {
                  data.doctorinfo.appointment_location.location_info
                    .appointment_location_of_doctor
                }
              </div> */}
              <div className="SubTags">Phone: {data.doctorinfo.appointment_location.location_info.phone_number}</div>

              {/* <h6 className='Tags'>{getDate(data.doctorinfo.appointment_location.location_info.start_time)} - {getTime(data.doctorinfo.appointment_location.location_info.end_time)}</h6> */}
              {/* <div className='SubTags'>{data.doctorinfo.appointment_location.location_info.days}</div> */}
            </div>
          </div>

          <div style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "baseline",
                opacity: 0.9,
                marginBottom: 4
              }}
            >
              {appointmentStartTime.length === 0 ?
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 2,
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: "bold" }}>
                    Started at:
                  </div>
                  <div
                    style={{
                      borderBottom: "#00000034 1px dashed",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "baseline",
                      textTransform: "capitalize",
                      flex: 1,
                    }}
                  >
                    <div style={{ fontSize: 12 }}>
                      {moment(data.date_time_of_appointment).format(
                        "hh:mm A, Do MMM, yyyy"
                      )}
                    </div>
                  </div>
                </div>
                :
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: "bold" }}>
                    Started at:
                  </div>
                  <div
                    style={{
                      borderBottom: "#00000034 1px dashed",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "baseline",
                      textTransform: "capitalize",
                      flex: 1,
                    }}
                  >
                    <div style={{ fontSize: 12 }}>
                      {moment(appointmentStartTime[0].start_at).format(
                        "hh:mm A, Do MMM, yyyy"
                      )}
                    </div>
                  </div>
                </div>
              }
            </div>
            {(data.appointment_id !== data.parent_appointment_id) &&
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "baseline",
                  opacity: 0.9,
                  marginBottom: 4
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: "bold" }}>
                    Follow-up of:
                  </div>
                  <div
                    style={{
                      borderBottom: "#00000034 1px dashed",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "baseline",
                      textTransform: "capitalize",
                      flex: 1,
                    }}
                  >
                    <div style={{ fontSize: 12 }}>
                      {followUpFromTrail()}
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
          <Divider />

          <div className="HistorySection" style={{ paddingLeft: 12, paddingRight: 12 }}>
            <div className="TitleText">Doctor's Note:</div>
            {!!data.doctors_note && data.doctors_note.length !== 0 &&
              (data.doctors_note[0].doctor_note.trim() !== "") ? (
              data.doctors_note.map((i) => <div>{i.doctor_note}</div>)
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={"No Note Added "}
              />
            )}
          </div>

          <div className="HistorySection" style={{ paddingLeft: 12, paddingRight: 12 }}>
            <div className="TitleText">Symptoms</div>
            {toggleComparison ? renderSymptomsComp() : renderSymptoms()}
          </div>

          <div className="HistorySection" style={{ paddingLeft: 12, paddingRight: 12 }}>
            <div className="TitleText">Diagnosis</div>
            {toggleComparison ? renderDiagnosisComp() : renderDiagnosis()}
          </div>


          <div className="HistorySection" style={{ paddingLeft: 12, paddingRight: 12 }}>
            <div className="TitleText">Tests</div>
            {!!data.appointment_data.tests ? (
              <Table
                pagination={false}
                size={"small"}
                key={toggleComparison}
                bordered
                rowClassName={(record) =>
                  record.status === "added"
                    ? "addedRow"
                    : record.status === "deleted"
                      ? "deletedRow"
                      : "normalRow"
                }
                columns={Testcolumns}
                dataSource={toggleComparison ? renderTestComp() : renderTests()}
              />
            ) : (
              <h6 style={{ textAlign: "left", fontSize: 14 }}>
                {" "}
                No Test Advised{" "}
              </h6>
            )}
            {!!data.appointment_data.tests &&
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  flexDirection: "row",
                  opacity: 0.6,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    paddingRight: 16,
                    fontSize: 10,
                    fontWeight: "bold",
                    fontStyle: "italic",
                    justifyContent: "flex-end",
                  }}
                >
                  Sub Total (Estd.) :
                </div>
                <div
                  style={{
                    display: "flex",
                    width: 120,
                    paddingLeft: 16,
                    fontWeight: "solid",
                  }}
                >
                  {totalTestPrice()}
                </div>
              </div>
            }
          </div>

          <div className="HistorySection" style={{ paddingLeft: 12, paddingRight: 12 }}>
            <div className="TitleText">Presciptions</div>
            {!!data.appointment_data.prescriptions ? (
              <Table
                pagination={false}
                size={"small"}
                bordered
                key={
                  toggleComparison
                    ? renderPrescriptionComp().length
                    : renderPrescription().length
                }
                columns={Prescriptioncolumns}
                rowClassName={(record) =>
                  record.status === "added"
                    ? "addedRow"
                    : record.status === "deleted"
                      ? "deletedRow"
                      : "normalRow"
                }
                dataSource={
                  toggleComparison
                    ? renderPrescriptionComp()
                    : renderPrescription()
                }
              />
            ) : (
              <h6 style={{ textAlign: "left", fontSize: 14 }}>
                {" "}
                No Prescription Advised{" "}
              </h6>
            )}
            {!!data.appointment_data.prescriptions &&
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  flexDirection: "row",
                  opacity: 0.6,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    paddingRight: 16,
                    fontSize: 10,
                    fontWeight: "bold",
                    fontStyle: "italic",
                    justifyContent: "flex-end",
                  }}
                >
                  Sub Total (Estd.) :
                </div>
                <div
                  style={{
                    display: "flex",
                    width: 120,
                    paddingLeft: 16,
                    fontWeight: "solid",
                  }}
                >
                  {totalPrescriptionPrice()}
                </div>
              </div>
            }
          </div>
          <div style={{ paddingLeft: 12, paddingRight: 12, opacity: 0.6 }}>
            {renderPrice()}
          </div>
        </div>
        <div style={{ marginTop: 5 }}>
          <Divider />
        </div>
        <div>{renderComments()}</div>
      </div>
    </Fragment>
  );
};

export default HistoryPatientDetail;

HistoryPatientDetail.defaultProps = {
  imageURL: "",
  appointmentID: {
    title: "",
    comments: [],
  },
  itemTrailData: {
    followups: [],
  },
  style: {},
};
const styles = {
  textRight: {
    textAlign: "right",
  },
  section: { paddingTop: 5, paddingBottom: 5 },
  sectionHeading: {
    color: Colors.primaryColor,
    fontWeight: "bold",
    paddingLeft: 10,
    paddingTop: 10,
  },
  priscriptionsStyle: { fontWeight: "bold", paddingLeft: 10, paddingTop: 10 },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryColor,
  },
  avatar: {
    height: "50px",
    display: "flex",
    width: "50px",
    borderWidth: 0.3,
    borderColor: "#e0004d",
    borderStyle: "solid",
  },
  main_item: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  main_item_selected: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    boxShadow: "#00000036 0px 2px 4px",
  },
  trail_item: {
    backgroundColor: "white",
    padding: 10,
    borderWidth: 1.6,
    borderStyle: "solid",
    borderColor: "#e0e0e0",
    borderRadius: 10,
    margin: 10,
  },
  item_container_bg: {
    backgroundColor: "#f0f0f0",
    borderWidth: 0.6,
    borderStyle: "solid",
    borderColor: "#e0e0e0",
    borderRadius: 10,
    margin: 15,
    maxWidth: 400,
  },
};

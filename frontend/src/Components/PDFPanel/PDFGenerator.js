import React, { useEffect, useState } from "react";

import { Button } from "react-bootstrap";
import Logo from "../../Styles/Assets/myhealthlogo.png";
import jsPDF from "jspdf";
import PrintIcon from "@material-ui/icons/Print";
import html2canvas from "html2canvas";
import SidePanelContainer from "../Appointments/SidePanelContainer";
import { getDateOfBirth, getTimeString } from "../../Hooks/TimeHandling";
import moment from "moment";
import { Tooltip } from "antd";
import { IconButton } from "@material-ui/core";
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';

const PDFGenerator = (props) => {
  const data = props.appointmentData;
  const appointmentStartTime = props.appointmentStartTime;
  const [sidePanel, setSidePanel] = useState(false);
  const [headImg, setHeadImg] = useState([]);
  const [notesImg, setNotesImg] = useState([]);
  const [symptomImg, setSymptomImg] = useState([]);
  const [diagnosisImg, setDiagnosisImg] = useState([]);
  const [testImg, setTestImg] = useState([]);
  const [prescriptionImg, setPrescriptionImg] = useState([]);
  const [priceImg, setPriceImg] = useState([]);

  const optionsCanvas = {
    allowTaint: false,
    canvas: false,
    foreignObjectRendering: false,
    imageTimeout: 15000,
    logging: true,
    onclone: null,
    proxy: null,
    removeContainer: true,
    useCORS: false,
    quality: 2,
    scale: 3,
    marginRight: 20,
    scrollX: 0,
  };

  const handleImageWithPageAdding = (
    pdfInstance,
    ImageData,
    positionFromTop
  ) => {
    // "PDF dimensions: ",
    // pdf.internal.pageSize.width,
    // pdf.internal.pageSize.height,
    // headImg.width,
    // headImg.height

    let positionFromPageTop = positionFromTop;
    let contentHeight =
      (pdfInstance.internal.pageSize.width / ImageData.width) *
      ImageData.height +
      2;
    if (
      positionFromPageTop + contentHeight >=
      pdfInstance.internal.pageSize.height
    ) {
      pdfInstance.addPage();
      positionFromPageTop = 10;
      positionFromPageTop = handleImageWithPageAdding(
        pdfInstance,
        headImg,
        positionFromPageTop
      );
    }

    pdfInstance.addImage(
      ImageData.toDataURL("image/png"),
      "PNG",
      0,
      positionFromPageTop,
      pdfInstance.internal.pageSize.width,
      0
    );

    return positionFromPageTop + contentHeight;
  };

  const handlePDF = () => {
    console.log("PDF: Handler");
    const pdf = new jsPDF("p", "px", "a4", false, false, 2, 1.0);
    pdf.setProperties({
      title: "testing",
    });
    let newPosition = handleImageWithPageAdding(pdf, headImg, 10);
    newPosition = handleImageWithPageAdding(pdf, notesImg, newPosition);
    newPosition = handleImageWithPageAdding(pdf, symptomImg, newPosition);
    newPosition = handleImageWithPageAdding(pdf, diagnosisImg, newPosition);
    newPosition = handleImageWithPageAdding(pdf, testImg, newPosition);
    newPosition = handleImageWithPageAdding(pdf, prescriptionImg, newPosition);
    newPosition = handleImageWithPageAdding(pdf, priceImg, newPosition);

    pdf.autoPrint();
    window.open(pdf.output("bloburl", "testing.pdf"));
    window.scrollTo(
      0,
      document.body.scrollHeight || document.documentElement.scrollHeight
    );
  };

  const setHtmlToCanvas = (elementId, imageSetter) => {
    /* Extra advance image size computing code: commented for reference */
    // const widthRatio = pdfWidth / canvas.width;
    // const sX = 0;
    // const sWidth = canvas.width;
    // const sHeight =
    //   pdfHeight + (pdfHeight - pdfHeight * widthRatio) / widthRatio;
    // const dX = 0;
    // const dY = 0;
    // const dWidth = sWidth;
    // const dHeight = sHeight;
    // let pageCnt = 1;
    // totalHeight -= sHeight;
    // let sY = sHeight * (pageCnt - 1);

    html2canvas(document.querySelector(elementId), optionsCanvas).then(
      (canvas) => {
        const sX = 0;
        const sWidth = canvas.width;
        const sHeight = canvas.height;
        const dX = 0;
        const dY = 0;
        const dWidth = sWidth;
        const dHeight = sHeight;
        let sY = 0;
        const childCanvas = document.createElement("CANVAS");
        childCanvas.setAttribute("width", sWidth);
        childCanvas.setAttribute("height", sHeight);
        const childCanvasCtx = childCanvas.getContext("2d");
        childCanvasCtx.drawImage(
          canvas,
          sX,
          sY,
          sWidth,
          sHeight,
          dX,
          dY,
          dWidth,
          dHeight
        );
        console.log("PDF Handle: Image Ready", elementId);
        imageSetter(childCanvas);
        setIsReady(true);
      }
    );
  };


  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  const scheduleStringFormatter = (schedule) => {
    let scheduleString = ""
    let daysInfo = new Array(7);
    schedule.map((day) => {
      daysInfo[days.indexOf(day.day_of_week)] = day;
    }
    )
    console.log("PDF days: ", schedule);
    console.log("PDF days sort: ", daysInfo);
    // ${getTimeString(day.start_time)} - ${getTimeString(day.end_time)}
    daysInfo.map((day, i) => !!day && (scheduleString += (i !== 0 ? "\n - " : "") + day.day_of_week.slice(0, 3)))
    return scheduleString;
  }

  const [scheduleString, setScheduleString] = useState("none");

  const calculateSchedule = () => {
    let myscheduleString = "";
    myscheduleString = !!data.doctorinfo && !!data.doctorinfo.appointment_location.location_info.schedule ?
      scheduleStringFormatter(data.doctorinfo.appointment_location.location_info.schedule) : "";
    setScheduleString(myscheduleString);
    return myscheduleString;
  }

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if ((props.quickDownload && !!data && data.length !== 0) || (sidePanel && !!data && data.length !== 0)) {
      console.log("PDF UseEffect:", data);
      if (scheduleString !== "none") {
        // window.scrollTo(0, 0);
        setHtmlToCanvas("#pdf-header", setHeadImg);
        setHtmlToCanvas("#pdf-notes", setNotesImg);
        setHtmlToCanvas("#pdf-symptoms", setSymptomImg);
        setHtmlToCanvas("#pdf-diagnosis", setDiagnosisImg);
        setHtmlToCanvas("#pdf-tests", setTestImg);
        setHtmlToCanvas("#pdf-prescriptions", setPrescriptionImg);
        setHtmlToCanvas("#pdf-price", setPriceImg);
        // setIsReady(true);
      }
    }
    console.log("PDF handle: Data", data);
  }, [sidePanel, data, scheduleString, props.appointmentStartTime]);

  useEffect(
    () => !!props.appointmentData && !!props.appointmentData.length !== 0 && calculateSchedule(),
    [props.appointmentData]
  );

  // A4 in Pixels 3508 x 2480 px
  // Scalling ratio: window.devicePixelRatio
  // For 800px width, 1130px height
  // aspectRatio: "1/1.4"

  const renderSymptoms = () => {
    return (
      !!data.appointment_data &&
      !!data.appointment_data.symptoms &&
      data.appointment_data.symptoms.length !== 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              flex: 1,
            }}
          >
            <div style={{ color: "#e0004d" }}>Symptoms:</div>
            <div
              style={{
                fontSize: 12,
                flexDirection: "row",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {data.appointment_data.symptoms.map((item, i) => (
                <div
                  key={i}
                  style={{
                    paddingLeft: 16,
                    textTransform: "capitalize",
                  }}
                >
                  - {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    );
  };

  const renderDiagnosis = () => {
    return (
      !!data.appointment_data &&
      !!data.appointment_data.diagnosis &&
      data.appointment_data.diagnosis.length !== 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              flex: 1,
            }}
          >
            <div style={{ color: "#e0004d" }}>Diagnosis:</div>
            <div
              style={{
                fontSize: 12,
                flexDirection: "row",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {data.appointment_data.diagnosis.map((item, i) => (
                <div
                  key={i}
                  style={{
                    paddingLeft: 16,
                    textTransform: "capitalize",
                  }}
                >
                  - {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    );
  };

  const totalTestPrice = () => {
    let price = 0;
    !!data.appointment_data.tests &&
      data.appointment_data.tests.map((t) => (price += t.price_in_pkr));
    return price;
  };

  const renderTests = () => {
    return (
      !!data.appointment_data &&
      !!data.appointment_data.tests &&
      data.appointment_data.tests.length !== 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ color: "#e0004d", textAlign: "left" }}>Tests:</div>
          <div
            style={{
              fontSize: 12,
              flexDirection: "column",
              display: "flex",
            }}
          >
            <div style={{ display: "flex", flexDirection: "row", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  paddingLeft: 16,
                  border: "#e0004d34 1px solid",
                  backgroundColor: "#e0004d08",
                  color: "#e0004d",
                  fontWeight: "solid",
                }}
              >
                Name
              </div>
              <div
                style={{
                  display: "flex",
                  width: 120,
                  paddingLeft: 16,
                  border: "#e0004d34 1px solid",
                  backgroundColor: "#e0004d08",
                  color: "#e0004d",
                  fontWeight: "solid",
                }}
              >
                Estd. Price
              </div>
            </div>
            {data.appointment_data.tests.map((item, i) => (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "row", flex: 1 }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    border: "#00000034 0.3px solid",
                    fontWeight: "solid",
                    paddingLeft: 16,
                    borderTopWidth: 0,
                    textTransform: "capitalize",
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    paddingLeft: 16,
                    width: 120,
                    border: "#00000034 0.3px solid",
                    borderTopWidth: 0,
                    fontWeight: "solid",
                  }}
                >
                  {item.price_in_pkr}
                </div>
              </div>
            ))}
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
          </div>
        </div>
      )
    );
  };
  const totalPrescriptionPrice = () => {
    let price = 0;
    !!data.appointment_data.prescriptions &&
      data.appointment_data.prescriptions.map((p) => (price += p.price));
    return price;
  };

  const renderPrescriptions = () => {
    return (
      !!data.appointment_data &&
      !!data.appointment_data.prescriptions &&
      data.appointment_data.prescriptions.length !== 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ color: "#e0004d", textAlign: "left" }}>
            Prescriptions:
          </div>
          <div
            style={{
              fontSize: 12,
              flexDirection: "column",
              display: "flex",
            }}
          >
            <div style={{ display: "flex", flexDirection: "row", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  paddingLeft: 16,
                  border: "#e0004d34 1px solid",
                  backgroundColor: "#e0004d08",
                  color: "#e0004d",
                  fontWeight: "solid",
                }}
              >
                Name
              </div>
              <div
                style={{
                  display: "flex",
                  width: 150,
                  paddingLeft: 16,
                  border: "#e0004d34 1px solid",
                  backgroundColor: "#e0004d08",
                  color: "#e0004d",
                  fontWeight: "solid",
                }}
              >
                Dosage
              </div>
              <div
                style={{
                  display: "flex",
                  width: 120,
                  paddingLeft: 16,
                  border: "#e0004d34 1px solid",
                  backgroundColor: "#e0004d08",
                  color: "#e0004d",
                  fontWeight: "solid",
                }}
              >
                Estd. Price
              </div>
            </div>
            {data.appointment_data.prescriptions.map((item, i) => (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "row", flex: 1 }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    border: "#00000034 0.3px solid",
                    fontWeight: "solid",
                    paddingLeft: 16,
                    borderTopWidth: 0,
                    textTransform: "capitalize",
                  }}
                >
                  {item.name} ({item.medicine_type})
                </div>
                <div
                  style={{
                    display: "flex",
                    paddingLeft: 16,
                    width: 150,
                    border: "#00000034 0.3px solid",
                    borderTopWidth: 0,
                    fontWeight: "solid",
                    textAlign: "left",
                  }}
                >
                  {item.frequency}
                </div>
                <div
                  style={{
                    display: "flex",
                    paddingLeft: 16,
                    width: 120,
                    border: "#00000034 0.3px solid",
                    borderTopWidth: 0,
                    fontWeight: "solid",
                  }}
                >
                  {item.price}
                </div>
              </div>
            ))}
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
          </div>
        </div>
      )
    );
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

  const renderNotes = () => {
    return (
      !!data.doctors_note &&
      data.doctors_note.length !== 0 &&
      (data.doctors_note[0].doctor_note.trim() !== "") && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ color: "#e0004d", textAlign: "left" }}>
            Doctor's Note:
          </div>
          <div
            style={{
              fontSize: 12,
              flexDirection: "column",
              display: "flex",
            }}
          >
            {data.doctors_note.map((note, i) => (
              <div key={i} style={{ paddingBottom: 4, textAlign: "left" }}>
                {note.doctor_note}{" "}
              </div>
            ))}
          </div>
        </div>
      )
    );
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


  const renderContent = () => {
    return !!data && (
      <div
        style={{
          backgroundColor: "white",
          overflow: "hidden",
          position: "relative",
          width: 600,
          height: 840,
          marginLeft: 36,
          marginRight: 36,
        }}
      >
        {!!data.doctorinfo && !!data.patientinfo && (
          <div
            id="pdf-header"
            style={{
              backgroundColor: "white",
              padding: 20,
              borderBottom: "#0000001a 1px solid",
            }}
          >
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  flex: 1,
                }}
              >
                <div style={{ color: "#e0004d" }}>
                  Dr. {data.doctorinfo.name}
                </div>
                <div style={{ fontSize: 10 }}>
                  {data.doctorinfo.specialization}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <img
                  src={Logo}
                  style={{ height: "80px", width: "80px" }}
                  alt="logo"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  paddingLeft: 20,
                  alignItems: "flex-start",
                  flex: 1,
                }}
              >
                <div style={{ color: "#e0004d" }}>
                  {
                    data.doctorinfo.appointment_location.location_info
                      .appointment_location_of_doctor
                  }
                </div>
                {/* <div style={{ fontSize: 10 }}></div>
                <div style={{ fontSize: 10 }}>
                  Timing: 09:00 AM - 11:00 AM
                  ${getTimeString(day.start_time)} - ${getTimeString(day.end_time)}
                </div>
                <div style={{ fontSize: 10, textTransform: "capitalize" }}>Days: {scheduleString}</div> */}
                <div style={{ fontSize: 10 }}>Phone: {data.doctorinfo.appointment_location.location_info.phone_number}</div>
              </div>
            </div>
            <div>
              {data.appointment_id !== data.parent_appointment_id && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    fontStyle: "italic",
                  }}
                >
                  Follow-up of Appointment on{" "}
                  {moment(data.date_time_of_parent_appointment).format(
                    "hh:mm A, Do MMM, yyyy"
                  )}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "baseline",
                opacity: 0.9,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flex: 2,
                  alignItems: "baseline",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: "bold" }}>
                  Patient:
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
                  <div style={{ fontSize: 14 }}>
                    {data.patientinfo.name}
                  </div>
                  <div style={{ paddingLeft: 5, fontSize: 10 }}>
                    - {getDateOfBirth(data.patientinfo.dob)} years (
                    {data.patientinfo.gender})
                  </div>
                </div>
              </div>
            </div>
            <div>
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
                    flex: 2,
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: "bold" }}>
                    Appointment Time:
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
                {appointmentStartTime.length !== 0 &&
                  <div
                    style={{
                      paddingLeft: 10,
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
            </div>
          </div>
        )}
        <div
          id="pdf-notes"
          style={{
            backgroundColor: "white",
            padding: 20,
            paddingTop: 10,
            paddingBottom: 10,
            // borderBottom: "#0000001a 1px solid",
          }}
        >
          {renderNotes()}
        </div>
        <div
          id="pdf-symptoms"
          style={{
            backgroundColor: "white",
            padding: 20,
            paddingTop: 10,
            paddingBottom: 10,
            // borderBottom: "#0000001a 1px solid",
          }}
        >
          {renderSymptoms()}
        </div>
        <div
          id="pdf-diagnosis"
          style={{
            backgroundColor: "white",
            padding: 20,
            paddingTop: 10,
            paddingBottom: 10,
            // borderBottom: "#0000001a 1px solid",
          }}
        >
          {renderDiagnosis()}
        </div>
        <div
          id="pdf-tests"
          style={{
            backgroundColor: "white",
            padding: 20,
            paddingTop: 10,
            paddingBottom: 10,
            // borderBottom: "#0000001a 1px solid",
          }}
        >
          {renderTests()}
        </div>
        <div
          id="pdf-prescriptions"
          style={{
            backgroundColor: "white",
            padding: 20,
            paddingTop: 10,
            paddingBottom: 10,
            // borderBottom: "#0000001a 1px solid",
          }}
        >
          {renderPrescriptions()}
        </div>
        <div
          id="pdf-price"
          style={{
            backgroundColor: "white",
            padding: 20,
            paddingTop: 10,
            paddingBottom: 10,
            // borderBottom: "#0000001a 1px solid",
          }}
        >
          {renderPrice()}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* <div>PDF Generator</div> */}
      {
        props.quickDownload ?
          isReady && (
            <Tooltip title={"Download PDF"} placement="bottom" trigger="hover">
              <IconButton style={{ fontSize: 16, color: "#000000a1" }}>
                <PrintIcon onClick={() => handlePDF()} fontSize="small" />
              </IconButton>
            </Tooltip>
          )
          :
          <Tooltip title={"Preview PDF"} placement="bottom" trigger="hover">
            <IconButton style={{ fontSize: 16, color: "#000000a1" }}>
              <PrintIcon onClick={() => setSidePanel(true)} fontSize="small" />
            </IconButton>
          </Tooltip>
      }
      {
        props.quickDownload ?
          <div
            style={{
              width: 1,
              height: 1,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div style={{ maxWidth: 1200, position: "absolute" }}>
              {renderContent()}
            </div>
          </div>

          :
          <SidePanelContainer
            show={sidePanel}
            closeHandler={setSidePanel}
            style={{ maxWidth: 1200 }}
          >
            <div style={{ margin: 12 }}>
              <Tooltip title={"Download PDF"} placement="bottom" trigger="hover">
                <IconButton style={{ fontSize: 16, color: "#000000a1" }}>
                  <PrintIcon onClick={() => handlePDF()} fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
            {renderContent()}
          </SidePanelContainer>
      }
    </div>
  );
};

export default PDFGenerator;

PDFGenerator.defaultProps = {
  appointmentData: [],
  quickDownload: false,
  appointmentStartTime: []
};

import React, { useEffect, useState, Fragment } from "react"
import { Avatar } from "@material-ui/core";
import moment from 'moment';
import { downloadFile } from "../../Hooks/ImageAPI";
import SlotPopoverCard from "./SlotPopoverCard"

import "../../Styles/Card.scss"
import Colors from "../../Styles/Colors"

function titleCase(str) {
  if (str !== null) {
    return str.toLowerCase().split(" ").map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
      .join(" ");
  }
  else
    return "";
}

const SlotCard = (props) => {
  const itemData = props.itemData;
  const patientData = props.itemData.patient;
  const appointmentTime = props.itemData.date_time;
  const [image, setImage] = useState(patientData.image);
  const [isPopCard, setIsPopCard] = useState(false);
  const MyCardClass = props.small ? "MyCard MyCardSmall" : "MyCard"

  const showImage = () => {
    if (!!props.itemData.patient.image) {
      downloadFile('patients', props.itemData.patient.patient_id, 'profile')
        .then((json) => { setImage("data:image;charset=utf-8;base64," + json.encodedData) })
        .catch((error) => console.error(error))
        .finally(() => {
        });
    } else {
      console.log("Downloading Image Failed! image is null")
    }
  }
  useEffect(() => {
    // !!image && image !== "" &&
    showImage();
  }, [props.itemData.patient.image, props.itemData.patient.patient_id])

  const renderPopover = () => {
    if (isPopCard)
      return (
        <SlotPopoverCard autoOpen={props.autoOpen} style={props.popOverStyle} val={isPopCard} closeHandler={setIsPopCard} itemData={props.itemData} refreshList={props.refreshList} patientImage={image} currentlyActive={props.currentlyActive} />
      )
    else
      return (" ")
  }

  const [sideTagClass, setSideTagClass] = useState("sideTagSmall");
  const sideTagColors = () => {
    let isPast = (moment(appointmentTime).local().format("YYYY-MM-DD") < moment(new Date().setHours(0, 0, 0, 0)).local().format("YYYY-MM-DD"));
    if (itemData.appointment_status === "hold")
      return { backgroundColor: Colors.waiting }
    if (itemData.appointment_status === "waiting")
      return { backgroundColor: Colors.checkedin }
    if (itemData.appointment_status === "inprogress")
      return { backgroundColor: Colors.inprogress }
    if (itemData.appointment_status === "completed")
      return { backgroundColor: Colors.attended }
    if (itemData.appointment_status === "cancelled")
      return { backgroundColor: Colors.cancelled }
    if (itemData.appointment_status === "upcoming")
      return isPast ? { backgroundColor: Colors.missedPast } : { backgroundColor: Colors.remaining }
    if (itemData.appointment_status === "rescheduled")
      return { backgroundColor: Colors.rescheduled }
  }
  const sideTagBackgroundColor = sideTagColors()

  return (itemData.appointment_status === "cancelled" || itemData.appointment_status === "rescheduled") ?
    (<Fragment>
      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        {props.small ?
          <div style={{ ...styles.cardLabel, display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1, marginBottom: 5 }}>
            <div>{titleCase(patientData.name)}</div>
            <b style={{ fontSize: 10 }}>{moment(appointmentTime).local().format("hh:mm A")}</b>
            <b style={{ width: "100%", textAlign: "right" }}>{itemData.appointment_status}</b>
          </div>
          :
          <div style={{ ...styles.cardLabel, display: "flex", flex: 1, marginBottom: 5 }}>
            {titleCase(patientData.name)}'s appointment at <b style={{ paddingLeft: 3, paddingRight: 3 }}>{moment(appointmentTime).local().format("hh:mm A")}</b> has been <b style={{ paddingLeft: 3, paddingRight: 3 }}>{itemData.appointment_status}</b>.
          </div>
        }
      </div>
    </Fragment>) :
    (
      <Fragment>
        {/* <AppointmentModal show={showModal} hide={handleModalClose} displayFunction={'reschedule'} Name={patientData.name} appointmentID={props.itemData.appointment_id} itemData={props.itemData} callback={props.callback}/>
            <FeeModal show={feeModal} itemData={props.itemData} doc_ID={props.itemData.doctor_id} closeModal={handleFeeCloseModal} /> */}
        <div style={{ display: "flex", flex: 1, position: "relative" }} onClick={(e) => { setIsPopCard(!isPopCard); e.stopPropagation(); }} onMouseEnter={() => setSideTagClass("sideTag")} onMouseLeave={() => setSideTagClass("sideTagSmall")}>
          {renderPopover()}
          {
            props.small ?
              <div className={MyCardClass} style={{ ...styles.card, display: "flex", flex: 1, marginBottom: 5 }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div
                      style={{
                        paddingLeft: 5,
                        fontSize: 14,
                        textAlign: "left",
                        fontWeight: "normal",
                        color: "#e0004d",
                      }}
                    >
                      {titleCase(patientData.name)}
                    </div>
                    <div style={{ paddingLeft: 5, color: "#0000007f", fontWeight: 'bold', fontSize: 10 }}>
                      {moment().diff(patientData.dob, 'years')}  Years ({titleCase(patientData.gender)})
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", color: "#e0004d", fontWeight: 550, fontSize: 14 }}>
                    {/* <div onClick={() => setOpenDialog(true)} style={{cursor: "pointer"}}>
                              <label> Cancel <i> <MdDeleteForever style={{fontSize:20}} /> </i></label>
                          </div> */}
                    {/* <div style={{color: "#00000028"}}>Time</div> */}
                    {/* <div>{itemData.appointment_status}</div> */}
                    <div style={{ fontWeight: 100, paddingTop: 4, fontSize: 18, color: "#000000a1", textAlign: "right" }}>{moment(appointmentTime).local().format("hh:mm A")}</div>
                  </div>
                </div>
                <div className={sideTagClass}
                  style={{ ...sideTagBackgroundColor, textOrientation: "mixed", writingMode: "vertical-lr" }}>
                  {moment(appointmentTime).local().format("YYYY-MM-DD") < moment(new Date().setHours(0, 0, 0, 0)).local().format("YYYY-MM-DD") && itemData.appointment_status === "upcoming" ?
                    "missed" : itemData.appointment_status === "completed" ? "attended" : itemData.appointment_status === "waiting" ? "checked in" : itemData.appointment_status === 'hold' ? 'waiting' : itemData.appointment_status === 'upcoming' ? 'remaining' : itemData.appointment_status}
                </div>
              </div>
              :
              <div className={MyCardClass} style={{ ...styles.card, display: "flex", flex: 1, marginBottom: 5 }}>
                <div style={{ display: "flex", flexDirection: "row", flex: 1, padding: 10 }}>
                  <Avatar src={image} style={styles.avatar} />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1 }}>
                    <div
                      style={{
                        paddingLeft: 10,
                        fontSize: 24,
                        fontWeight: "lighter",
                        color: "#e0004d",
                      }}
                    >
                      {titleCase(patientData.name)}
                    </div>
                    <div style={{ paddingLeft: 10, color: "#0000007f", fontWeight: 'bold', fontSize: 12 }}>
                      {moment().diff(patientData.dob, 'years')}  Years ({titleCase(patientData.gender)})
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", color: "#e0004d", fontWeight: 550, fontSize: 14 }}>
                    {/* <div onClick={() => setOpenDialog(true)} style={{cursor: "pointer"}}>
                              <label> Cancel <i> <MdDeleteForever style={{fontSize:20}} /> </i></label>
                          </div> */}
                    {/* <div style={{color: "#00000028"}}>Time</div> */}
                    <div style={{ fontWeight: 100, fontSize: 36, color: "#0000004f", }}>{moment(appointmentTime).local().format("hh:mm A")}</div>
                  </div>
                </div>
                <div style={{ ...sideTagBackgroundColor, textOrientation: "mixed", writingMode: "vertical-lr" }} className={sideTagClass} >
                  {/* {itemData.appointment_status} */}
                  {moment(appointmentTime).local().format("YYYY-MM-DD") < moment(new Date().setHours(0, 0, 0, 0)).local().format("YYYY-MM-DD") && itemData.appointment_status === "upcoming" ?
                    "missed" : itemData.appointment_status === "completed" ? "attended" : itemData.appointment_status === "waiting" ? "checked in" : itemData.appointment_status === 'hold' ? 'waiting' : itemData.appointment_status === 'upcoming' ? 'remaining' : itemData.appointment_status}
                </div>
              </div>

          }
        </div>
        {/* </div> */}
      </Fragment>
    )
}

export default SlotCard

SlotCard.defaultProps = {
  refreshList: () => { },
  itemData: {},
  small: false,
  popOverStyle: {},
  autoOpen: () => { }
}

const styles = {
  label: {
    fontSize: 13,
    color: "grey",
    textAlign: "Left",
    marginLeft: "10px",
    marginTop: "10px",
  },
  input: { fontSize: 14, padding: 8, borderRadius: "5px" },
  header_container: { display: "flex", flexDirection: "row", padding: 10, alignItems: "center" },
  avatar: { height: "55px", width: "55px", borderWidth: 0.3, borderColor: "#e0004d", borderStyle: "solid" },
  cards: {
    backgroundColor: "#f9f9f9",
    width: "330px",
  },
  cardsStatus: {

  },
  cardLabel: { backgroundColor: "#f8f8f8", border: "1px solid #00000024", color: "#7f7f7f", padding: 2, fontSize: 12, paddingLeft: 5, paddingRight: 5 }
};

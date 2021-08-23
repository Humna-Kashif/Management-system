import React, { useEffect, useState, useContext } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { editAboutInfoAPI } from "../Hooks/API";
import "react-datepicker/dist/react-datepicker.css";
import "../Styles/AboutSection.scss";
import { GlobalContext } from "../../Context/GlobalState";

const AboutSection = (props) => {
  const {info,accountId,accountType} = useContext(GlobalContext)
  const [aboutVal, setAboutVal] = useState({
    name: "",
    dob: "",
    gender: "",
    specilization: "",
    about: "",
    appointment_type: ""
  });
  const [appointmentType, setAppointmentType] = useState({
    inperson: false,
    telehealth: false
  })
  const setAppointmentChecks = (val) => {
    return {
      inperson: (val === 'inperson' || val === 'both'),
      telehealth: (val === 'telehealth' || val === 'both')
    }
  }
  const getAppointmentChecks = (val) => {
    let checkBoxVal = {
      inperson: (val === 'inperson') ? !appointmentType.inperson : appointmentType.inperson,
      telehealth: (val === 'telehealth') ? !appointmentType.telehealth : appointmentType.telehealth
    }
    if (formateCheckedString(checkBoxVal) === "")
      setHandleTypeError(true);
    else
      setHandleTypeError(false);
    return checkBoxVal
  }
  const formateCheckedString = (appointmentVal) => {
    if (appointmentVal.inperson && appointmentVal.telehealth)
      return "both"
    if (appointmentVal.inperson)
      return "inperson"
    if (appointmentVal.telehealth)
      return "telehealth"
    return ""
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("changesss", props.data, aboutVal);
      setAboutVal({
        name: props.data.name,
        dob: props.data.dob,
        gender: props.data.gender,
        specialization: props.data.specialization,
        about: props.data.about,
        appointment_type: props.data.appointment_type
      });

      setAppointmentType(setAppointmentChecks(props.data.appointment_type));
    }, 200);
    return () => clearTimeout(timer);
  }, [props.data, aboutVal]);

  const [prevVal, setPrevVal] = useState(aboutVal);
  const [editing, setEditing] = useState(false);
  const [startDate, setStartDate] = useState(aboutVal.dob);

  const AboutSectionRow = (props) => {
    const label = props.label;
    const aboutVal = props.value;
    const editing = props.editing;
    const editField = props.input;

    return (
      <Row className={"about-row"}>
        <Col lg={{ span: 2, offset: 1 }} className={"label"}>
          {label}
        </Col>
        <Col lg={8} className={"display-value"}>
          {editing ? editField : aboutVal}
        </Col>
      </Row>
    );
  };

  const GenderRadioButton = ({ value }) => {
    return (
      <input
        style={{ width: 20 }}
        type="radio"
        value={value}
        name="gender"
        checked={aboutVal.gender === value}
      />
    );
  };

  function parseISOString(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
  }

  const handleAboutEdit = () => {
    // console.log("Time managing: ", (new Date("1992-10-03")), "Dob prop:", startDate);
    setStartDate(parseISOString(props.data.dob));
    // console.log("MyDate: ",props.data.dob,"ISO: ", parseISOString(props.data.dob),"isoDMY:", isoFormatDMY(parseISOString(props.data.dob)) );
    setPrevVal(aboutVal);
    setEditing(true);
  };

  const [handleTypeError, setHandleTypeError] = useState(false);

  const handleSaveBtn = () => {
    let appointmentTypeString = formateCheckedString(appointmentType);
    if (appointmentTypeString === "") {
      setHandleTypeError(true);
    }
    else {
      editAboutInfoAPI(
        accountType,
        accountId,
        aboutVal.name,
        aboutVal.gender,
        aboutVal.dob,
        aboutVal.specialization,
        aboutVal.about,
        appointmentTypeString
      ).then((result) => {
        console.log("About api", result);
        props.callback();
        //  setAboutVal(result);
      });

      setEditing(false);
    }
  };

  const handleCancelBtn = () => {
    setAboutVal(prevVal);
    setEditing(false);
  };

  const renderEditingItem = () => {
    return (
      <div>
        <AboutSectionRow
          label={"Name:"}
          editing={true}
          input={
            <input
              className={"input__about"}
              placeholder="Enter Your Name ..."
              type="text"
              value={aboutVal.name}
              noValidate
              onChange={(e) => {
                setAboutVal({ ...aboutVal, name: e.target.value });
                console.log("changes", aboutVal, e.target.value);
              }}
            />
          }
        />
        <AboutSectionRow
          label={"Date of Birth:"}
          editing={true}
          input={
            <DatePicker
              className={"input__about"}
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                formatDate(date);
              }}
            />
          }
        />
        <AboutSectionRow
          label={"Gender:"}
          editing={true}
          input={
            <div
              onChange={(e) =>
                setAboutVal({ ...aboutVal, gender: e.target.value })
              }
              className={"input__about"}
            >
              <GenderRadioButton value={"Male"} /> <span>Male</span>
              <GenderRadioButton value={"Female"} /> Female
              <GenderRadioButton value={"Other"} /> Other
            </div>
          }
        />

        <AboutSectionRow
          label={"Specialization:"}
          editing={true}
          input={
            <input
              className={"input__about"}
              placeholder="Enter Your specialization ..."
              type="text"
              value={aboutVal.specialization}
              noValidate
              onChange={(e) => {
                setAboutVal({ ...aboutVal, specialization: e.target.value });
                console.log("changes", aboutVal);
              }}
            />
          }
        />

        <AboutSectionRow
          label={"About:"}
          editing={true}
          input={
            <textarea
              className={"text-area"}
              placeholder="Enter About Yourself ..."
              type="text"
              value={aboutVal.about}
              noValidate
              rows={3}
              onChange={(e) => {
                setAboutVal({ ...aboutVal, about: e.target.value });
                console.log("changes", aboutVal);
              }}
            />
          }
        />
        <AboutSectionRow
          label={"Appointment Type:"}
          editing={true}

          input={
            <div>
              <div onChange={(e) => {
                setAppointmentType(getAppointmentChecks(e.target.value));
              }}>
                <input
                  style={{ width: 20 }}
                  type="checkbox"
                  value="inperson"
                  name="Appointment Type"
                  checked={appointmentType.inperson} /><span style={{ paddingRight: 20 }}>Inperson</span>
                <input
                  style={{ width: 20 }}
                  type="checkbox"
                  value="telehealth"
                  name="Appointment Type"
                  checked={appointmentType.telehealth} /><span style={{ paddingRight: 20 }}>TeleHealth</span>
              </div>
              <div hidden={!handleTypeError} style={{ fontSize: 14, color: 'red' }}>Please select atleast one!</div>
            </div>
          }
        />

      </div>
    );
  };

  const formatDate = (date) => {
    const formattedDate =
      date.getFullYear().toString() +
      "/" +
      (date.getMonth() + 1).toString() +
      "/" +
      date.getDate().toString();
    console.log("New date:", formattedDate);
    setAboutVal({ ...aboutVal, dob: formattedDate });
  };

  return (
    <div>
      <div
        style={{
          paddingBottom: 20,
          display: "flex",
          flex: 1,
          flexDirection: "column",
        }}
      >
        <Row style={{ margin: 0 }}>
          <Col lg={{ offset: 1, span: 7 }} xs={4}>
            <h4>About</h4>
          </Col>
          {editing ? (
            <Col
              lg={3}
              xs={8}
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveBtn}
                style={{ marginRight: 5 }}
              >
                Save changes
              </Button>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={handleCancelBtn}
              >
                Cancel
              </Button>
            </Col>
          ) : (
            <Col
              lg={3}
              xs={8}
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "flex-end",
              }}
              onClick={handleAboutEdit}
            >
              <span style={{ color: "#e0004d", paddingRight: 10 }}>Edit</span>
              <FaEdit style={{ cursor: "pointer", color: "#e0004d" }}></FaEdit>
            </Col>
          )}
        </Row>
        {editing ? renderEditingItem() : ''}
      </div>
    </div>
  );
};

export default AboutSection;

AboutSection.defaultProps = {
  aboutData: {
    name: "Doctor Name",
    specialization: "Doctor Specialization",
    gender: "Other",
    dob: "1992/10/03",
    about: "about",
    appointment_type: ""
  },
};

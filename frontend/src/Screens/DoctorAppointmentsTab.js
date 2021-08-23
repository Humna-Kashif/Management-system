import React, { useEffect, useState, useContext } from "react";
// import { useLocation } from "react-router-dom";
import CalenderSection from "../Components/CalenderSection";
import { getPatientAppoinmtmentHistory } from "../Hooks/API";
import "../Styles/Tabs.scss";
import ActiveListSidePanel from "../Components/Appointments/ActiveListSidePanel";
import { GlobalContext } from "../Context/GlobalState";

const DoctorAppointmentsTab = (props) => {
  const { accountId,elementDocId } = useContext(GlobalContext);
  console.log("Refresh list called : active my doctor id is : ", elementDocId);
  const [activePatients, setActivePatients] = useState([]);

  const MaintainActivePatients = () => {
    console.log("Blinking: MaintainActivePatients")
    console.log(
      "Refresh list called : active Patient before \n",
      JSON.stringify(activePatients)
    );
    return getPatientAppoinmtmentHistory(elementDocId).then(
      (result) => {
        console.log("patient history api", result);
        setActivePatients((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(result)) {
            return result;
          } else {
            return prev;
          }
        });
      }
    );
  };

  useEffect(() => {
    console.log("Blinking: DocAppointmentTab UseEffect")
    MaintainActivePatients();
  }, []);

  const [validationVal, setValidationVal] = useState([]);

  const validationCallback = (id, value, msg) => {
    console.log(
      "validation callback: start ",
      validationVal,
      "copy",
      !!validationVal[0] && 74 in validationVal[0],
      validationVal.hasOwnProperty(74)
    );

    let valArray = validationVal.slice(0);
    let addIndex = -1;
    if (!value) {
      valArray.map((item, i) => {
        if (id in item) {
          addIndex = i;
          return true;
        }
        return false;
      });
      addIndex === -1
        ? valArray.push({ [id]: msg })
        : valArray.splice(addIndex, 1, { [id]: msg });
      // if (!(id in validationVal)) {
      //   valArray.push({[id] : msg});
      // }
    } else {
      valArray.map((val, i) => id in val && valArray.splice(i, 1));
    }

    console.log("Blinking: validationCallBack")
    console.log("validation callback: ", value, "id", id, "array", valArray);
    setValidationVal(valArray);
  };

  const [refreshDate, setRefreshDate] = useState(false);

  const callback = (status, appointment_id) => {
    console.log("callback parent: ", appointment_id);
    console.log(
      "Refresh list called : active Patient callback 1 \n",
      JSON.stringify(activePatients)
    );
    MaintainActivePatients();
    console.log("Blinking: callback")
  };

  const refreshListCallBack = () => {
    console.log("Blinking: refreshcallback")
    console.log(
      "Refresh list called : active Patient callback \n",
      JSON.stringify(activePatients)
    );
    MaintainActivePatients().then(() => {
      //refresh calender on hold state
      setRefreshDate(false);
      setRefreshDate(true);
    });
  };

  const [appointmentAutoOpenId, setAppointmentAutoOpenId] = useState(0);

  const autoOpenActiveAppointment = (autoOpenID) => {
    setAppointmentAutoOpenId((prev) => {
      console.log("Blinking: autoOpen ids:", prev, autoOpenID);
      if (prev !== autoOpenID) {
        return autoOpenID;
      } else {
        return prev;
      }
    });
  };

  const disableAfterFirstOpen = () => {
    setAppointmentAutoOpenId(0);
  }

  return (
    <div
      style={{ width: "100%", padding: 0, marginRight: -25, marginTop: -10 }}
      {...props}
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            paddingTop: 10,
            paddingLeft: 15,
            paddingRight: 45,
          }}
        >
          {/* {renderModal(tabKey)} */}
          <CalenderSection
            autoOpen={autoOpenActiveAppointment}
            id={elementDocId}
            callback={callback}
            key={"home"}
            currentlyActive={activePatients}
            refreshDate={refreshDate}
          />
        </div>
        <ActiveListSidePanel
          patientsList={activePatients}
          autoOpenId={appointmentAutoOpenId}
          validation={validationCallback}
          refreshList={refreshListCallBack}
          autoOpenHandler={disableAfterFirstOpen}
        />
      </div>
    </div>
  );
};

export default DoctorAppointmentsTab;

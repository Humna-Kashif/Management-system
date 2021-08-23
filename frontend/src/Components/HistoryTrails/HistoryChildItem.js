import React, { useEffect, useState, useContext } from "react"
import Moment from "moment";
import { getTime } from "../../Hooks/TimeHandling";
import { Avatar } from "@material-ui/core";
import { downloadFile } from '../../Hooks/ImageAPI'
import { GlobalContext } from '../../Context/GlobalState';
import { Fragment } from "react";

const Colors = {
  primaryColor: "#e0004d",
};

const HistoryChlidItem = (props) => {
  const item = props.item;
  const { info, accountId, accountType, setUsername, setAccountType } = useContext(GlobalContext)
  const [image, setImage] = useState(null);
  const titleCase = (str) => {
    return str.toLowerCase().split(' ').map(function (word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }
  useEffect(() => {
    if (!!item.doctorinfo.image) {
      downloadFile(accountType, item.doctorinfo.doctor_id, 'profile')
        .then((json) => { setImage("data:image;charset=utf-8;base64," + json.encodedData) })
        .catch((error) => console.error(error))
        .finally(() => {
        });
    } else {
      console.log("Downloading Image Failed! image is null")
    }
  }, []);

  return (
    <Fragment>
      <div
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          display: "flex",
        }}
      >
        <div style={{ marginRight: "5px" }}>
          <Avatar src={image}
            style={styles.avatar} />
        </div>
        <div style={{ width: "50%", textAlign: "left" }}>
          <div style={{ fontSize: 15, color: Colors.primaryColor }}>
            {titleCase(item.doctorinfo.name)}
          </div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>
            {item.doctorinfo.specialization}
          </div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>
            {
              item.doctorinfo.appointment_location.location_info.appointment_location_of_doctor
            }
          </div>
        </div>
        <div style={{ flex: 1, width: "50%", textAlign: "right" }}>
          <div
            style={{
              fontSize: 11,
              opacity: 0.6,
            }}
          >
            {Moment(item.date_time_of_appointment).format("Do MMM, yyyy")}
            <div style={{ fontSize: 24, opacity: 0.8, marginTop: "-5px" }}>
              {getTime(item.date_time_of_appointment)}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ ...styles.section, marginLeft: 12, marginRight: 20 }}>
          {!!item.appointment_data.symptoms &&
            <div style={styles.section}>
              <div style={styles.sectionHeading}>Symptoms</div>
              <div style={{ opacity: 0.8, fontSize: 11 }}>
                {item.appointment_data.symptoms.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      paddingLeft: 16,
                      textTransform: "capitalize",
                    }}
                  >
                    - {s.name}
                  </div>
                ))}
              </div>
            </div>
          }
        </div>
        <div style={{ ...styles.section, marginLeft: 12, marginRight: 20 }}>
          {!!item.appointment_data.diagnosis &&
            <div style={styles.section}>
              <div style={styles.sectionHeading}>Diagnosis</div>
              <div style={{ opacity: 0.8, fontSize: 11 }}>
                {item.appointment_data.diagnosis.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      paddingLeft: 16,
                      textTransform: "capitalize",
                    }}
                  >
                    - {d.name}
                  </div>
                ))}
              </div>
            </div>
          }
        </div>
      </div>
    </Fragment>
  )
}

export default HistoryChlidItem

const styles = {
  section: { paddingTop: 5, paddingBottom: 5, textAlign: "left" },
  sectionHeading: { color: Colors.primaryColor, fontWeight: "bold", fontSize: 12 },
  avatar: { height: "55px", width: "55px" }
};
import React, { useEffect, useState, useContext } from "react";
import moment from "moment";
import { getTime } from "../../Hooks/TimeHandling";
import { Avatar } from "@material-ui/core";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { downloadFile } from '../../Hooks/ImageAPI'
import { GlobalContext } from '../../Context/GlobalState';
import HistoryChlidItem from './HistoryChildItem'

const Colors = {
  primaryColor: "#e0004d",
};

const HistoryTrailItem = (props) => {
  const followups = props.trailData.followups;
  const [showTrail, setShowTrail] = useState(false);
  const [image, setImage] = useState(null);
  const { info, accountId, accountType, setUsername, setAccountType } =
    useContext(GlobalContext);
  // const titleCase = (str) => {
  //   return str
  //     .toLowerCase()
  //     .split(" ")
  //     .map(function (word) {
  //       return word.charAt(0).toUpperCase() + word.slice(1);
  //     })
  //     .join(" ");
  // };
  useEffect(() => {
    if (!!followups && followups[0].doctorinfo.image) {
      downloadFile(accountType, followups[0].doctorinfo.doctor_id, "profile")
        .then((json) => {
          setImage("data:image;charset=utf-8;base64," + json.encodedData);
        })
        .catch((error) => console.error(error))
        .finally(() => { });
    } else {
      console.log("Downloading Image Failed! image is null");
    }
  }, []);

  return (
    <div style={{ ...styles.item_container_bg }}>
      <div
        style={showTrail ? styles.main_item_selected : styles.main_item}
        onClick={() =>
          props.onSelectItem(props.trailData, !!followups && followups[0])
        }
      >
        <div
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            display: "flex",
          }}
        >
          <div style={{ marginRight: "5px" }}>
            <Avatar src={image} style={styles.avatar} />
          </div>
          <div style={{ width: "50%", textAlign: "left" }}>
            <div style={{ fontSize: 15, color: Colors.primaryColor }}>
              {!!followups[0] && followups[0].doctorinfo.name}
            </div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>
              {!!followups[0] && followups[0].doctorinfo.specialization}
            </div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>
              {!!followups[0] &&
                followups[0].doctorinfo.appointment_location.location_info.appointment_location_of_doctor
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
              {!!followups[0] && moment(followups[0].date_time_of_appointment).format("Do MMM, yyyy")}
              <div style={{ fontSize: 24, opacity: 0.8, marginTop: "-5px" }}>
                {!!followups[0] && getTime(followups[0].date_time_of_appointment)}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
          <div style={{ ...styles.section, marginLeft: 12, marginRight: 20 }}>
            {!!followups[0].appointment_data.symptoms &&
              <div style={styles.section}>
                <div style={styles.sectionHeading}>Symptoms</div>
                <div style={{ opacity: 0.8, fontSize: 11 }}>
                  {followups[0].appointment_data.symptoms.map((s, i) => (
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
            {!!followups[0].appointment_data.diagnosis &&
              <div style={styles.section}>
                <div style={styles.sectionHeading}>Diagnosis</div>
                <div style={{ opacity: 0.8, fontSize: 11 }}>
                  {followups[0].appointment_data.diagnosis.map((d, i) => (
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
        {(!!followups && followups.length) > 1 && (
          <div
            style={{ color: "#e0004d", cursor: "pointer", textAlign: "right" }}
            onClick={(e) => {
              setShowTrail(!showTrail);
              e.stopPropagation();
            }}
          >
            {showTrail ? (
              <div>
                Hide Trail
                <BsChevronUp />
              </div>
            ) : (
              <div>
                Show Trail
                <BsChevronDown />
              </div>
            )}
          </div>
        )}
      </div>
      {showTrail &&
        followups.map(
          (item, key) =>
            key !== 0 && (
              <div
                style={styles.trail_item}
                onClick={() => props.onSelectItem(props.trailData, item)}
              >
                <HistoryChlidItem item={item} />
                {/* <div>
              <div style={styles.section}>
                <div style={styles.section}>
                  <div style={styles.sectionHeading}>Doctor Note</div>
                  <div style={{ opacity: 0.8, fontSize: 11 }}>
                    {item.doctors_note ? item.doctors_note : "Not mentioned"}
                  </div>
                </div>
              </div>
            </div> */}
              </div>
            )
        )}
    </div>
  );
};

export default HistoryTrailItem;

HistoryTrailItem.defaultProps = {
  trailData: {
    followups: [],
  },
  onSelectItem: () => { },
};

const styles = {
  textRight: {
    textAlign: "right",
  },
  section: { paddingTop: 5, paddingBottom: 5, textAlign: "left" },
  sectionHeading: { color: Colors.primaryColor, fontWeight: "bold" },
  main_item: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    cursor: "pointer",
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
    cursor: "pointer",
  },
  item_container_bg: {
    backgroundColor: "#f0f0f0",
    borderWidth: 0.6,
    borderStyle: "solid",
    borderColor: "#e0e0e0",
    borderRadius: 10,
    margin: 15,
    maxWidth: 600,
  },
  section: { paddingTop: 5, paddingBottom: 5, textAlign: "left" },
  sectionHeading: {
    color: Colors.primaryColor,
    fontWeight: "bold",
    fontSize: 12,
  },
  avatar: { height: "55px", width: "55px" },
};

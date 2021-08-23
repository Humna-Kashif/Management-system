import React, { useEffect, useState, useCallback, useContext } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Calender from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {
  locationsAPI,
  getAppointmentsDateAPI,
  getAppointmentsStatsByTimeRange,
  availableSlotsAPI,
  getAppointmentsListByTimeRange,
} from "../Hooks/API";
import { getDatetoSet } from "../Hooks/TimeHandling";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment";
import "../Styles/Calender.css";
import "../Styles/AppointmentItem.css";
import "../Styles/margins.css";
import TodaysStats from "./Statistics/TodaysStats";
import CustomCalendarPanel from "./Appointments/CustomCalendarPanel";
import { GlobalContext } from "../Context/GlobalState";
import { Divider } from "antd";
import SectionLoading from "./Loading/SectionLoading";
import PageLoading from "./Loading/PageLoading";

const CalenderSection = (props) => {
  const { accountId,elementDocId } = useContext(GlobalContext);
  const [data, setData] = useState([]);
  const [date, setDate] = useState(new Date());
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [cancelledAppointments, setCancelledAppointments] = useState(0);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [remainingAppointments, setRemainingAppointments] = useState(0);
  const [waitingAppointments, setWaitingAppointments] = useState(0);
  const [inprogressAppointments, setInprogressAppointments] = useState(0);
  const [holdAppointments, setHoldAppointments] = useState(0);
  const [rescheduledAppointments, setRescheduledAppointments] = useState(0);
  const [locationData, setLocationData] = useState([]);
  const [selectValue, setSelectedValue] = useState(0);
  const [mark, setMark] = useState([]);
  const [markWaiting, setMarkWaiting] = useState([]);
  const [totalSlots, setTotalSlots] = useState(0);
  const [view, setView] = useState(
    !!localStorage.getItem("calenderViewOption")
      ? localStorage.getItem("calenderViewOption")
      : "day"
  );
  const [firstLoad, setFirstLoad] = useState(true);
  let [appTimer, setAppTimer] = useState(null);
  let [refreshTimer, setRefreshTimer] = useState(30000);

  const formatWeekList = (date) => {
    let tempWeek = [];
    for (var i = 0; i < 7; i++) {
      tempWeek.push(moment(date).startOf("isoWeek").add(i, "days").toDate());
    }
    return tempWeek;
  };

  const [weekList, setWeekList] = useState(formatWeekList(new Date()));
  const [weekData, setWeekData] = useState([]);
  const [dayStatsVal, setDayStatsVal] = useState([]);
  const [weekStatsVal, setWeekStatsVal] = useState([]);

  const setStatsValue = useCallback(() => {
    let dailyStat = view === "day" ? dayStatsVal : weekStatsVal;
    console.log("my Value is in setstatsvalue function ", view, dailyStat);
    let totalVal = 0;
    let completeVal = 0;
    let cancelVal = 0;
    let remainingVal = 0;
    let waitingVal = 0;
    let holdVal = 0;
    let inprogressVal = 0;
    let rescheduledVal = 0;
    if (!!dailyStat[0]) {
      console.log("set state value : if", view, dailyStat);
      totalVal = dailyStat[0].appointment_stats.graph_one.total_appointments;
      completeVal = dailyStat[0].appointment_stats.graph_one.completed_appointments;
      cancelVal = dailyStat[0].appointment_stats.graph_two.cancelled_appointments;
      remainingVal = dailyStat[0].appointment_stats.graph_one.remaining_appointments;
      waitingVal = dailyStat[0].appointment_stats.graph_one.waiting_appointments;
      holdVal = dailyStat[0].appointment_stats.graph_one.hold_appointments;
      inprogressVal = dailyStat[0].appointment_stats.graph_one.inprogress_appointments;
      rescheduledVal = dailyStat[0].appointment_stats.graph_one.reschedule_appointments;
    }
    setCompletedAppointments(completeVal);
    setRemainingAppointments(remainingVal);
    setWaitingAppointments(waitingVal);
    setHoldAppointments(holdVal);
    setCancelledAppointments(cancelVal);
    setTotalAppointments(totalVal);
    setInprogressAppointments(inprogressVal);
    setRescheduledAppointments(rescheduledVal);
  }, [view, weekStatsVal]);

  //Get lengts of Slots
  const getTotalSlots = useCallback(
    (location) => {
      console.log(
        "Total slots values ",
        elementDocId,
        location,
        "PUT",
        getDatetoSet(date)
      );
      if (location) {
        if (location !== '0' && location !== 0) {
          console.log("Total slots values ", location);
          availableSlotsAPI(
            elementDocId,
            location,
            "PUT",
            getDatetoSet(date)
          ).then((result) => {
            if (result.length === 0) {
              console.log("Total slots are ", result.length);
              setTotalSlots(0);
            } else {
              console.log("Total slots are ", result);
              if (!!result[0]) {
                setTotalSlots(result[0].available_time_slots.length);
              } else {
                setTotalSlots(0);
              }
            }
          });
        } else {
          setTotalSlots(96);
        }
      } else {
        setTotalSlots(96);
      }
    },
    [elementDocId, date]
  );

  const onChange = (date) => {
    setDate(date);
    setWeekList(formatWeekList(date));
    // getAppointments(date, selectValue);
    // getWeekAppointments(date, selectValue);

    // getWeekAppointmentsByRange(date, selectValue);
    // appointmentGraph();
    // setStatsValue();
    // getWeekStats(date,selectValue);
    // appointmentGraph("date call");
    refreshListCallBack();
  };

  const refreshList = () => {
    console.log(
      "Refresh List Called: Values Code Review",
      date,
      selectValue,
      moment(new Date()).format("hh:mm:ss")
    );
    props.callback("inprogress", 12);

    getTotalSlots(selectValue);
    getWeekAppointmentsByRange(date, selectValue);
    appointmentGraph(selectValue);
    // setStatsValue();
    getMarksOnCalender(selectValue, "upcoming", setMark);
    getMarksOnCalender(selectValue, "waiting", setMarkWaiting);
  };

  const refreshListCallBack = () => {
    console.log("Timer: start Manual Btn");
    clearInterval(appTimer);
    setRefreshTimer(0);
  };

  const handleChange1 = (e) => {
    console.log("Location values ", e.target.value);
    setSelectedValue(e.target.value);
    getTotalSlots(e.target.value);
    // getWeekAppointmentsByRange(date, e.target.value);
    // appointmentGraph(e.target.value);
    // setStatsValue();
    refreshListCallBack();
  };

  const AppointmentDateComparison = (date, markList) => {
    let val = false;
    markList.map((item) => {
      if (moment(date).format("YYYY-MM-DD") === item) val = true;
      return true;
    });
    return val;
  };

  const appointmentGraph = useCallback(
    (selectValue) => {
      // getAppointmentsStats(elementDocId, selectValue, moment(date).format("YYYY-MM-DD")).then(result => {
      //     if (!!result) {
      //         console.log("daily stats are ", result)
      //         setDailyStat(result)
      //         console.log("Range API Week: old", result)
      //     }
      // })
      let startDayTime = date;
      startDayTime.setHours(0, 0, 0, 0);
      let endDayTime = moment(startDayTime).add(1, "days").toDate();
      endDayTime.setHours(0, 0, 0, 0);

      getAppointmentsStatsByTimeRange(
        elementDocId,
        selectValue,
        moment(startDayTime).toISOString(),
        moment(endDayTime).toISOString()
      ).then((result) => {
        console.log("Refresh List Called: Values Code Review: Day json", result);
        !!result && setDayStatsVal(result)
      });

      let startWeekTime = moment(date).startOf("isoWeek").toDate();
      startWeekTime.setHours(0, 0, 0, 0);

      let endWeekTime = moment(startWeekTime)
        .startOf("isoWeek")
        .add(7, "days")
        .toDate();
      endWeekTime.setHours(0, 0, 0, 0);

      getAppointmentsStatsByTimeRange(
        elementDocId,
        selectValue,
        moment(startWeekTime).toISOString(),
        moment(endWeekTime).toISOString()
      ).then((result) => !!result && setWeekStatsVal(result));
    },
    [elementDocId, date, selectValue]
  );

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const JSONStringWeekComparison = (prev, current) => {
    let isDifferent = false;
    isDifferent = weekDays.some(
      (day) => JSON.stringify(prev[day]) !== JSON.stringify(current[day])
    );
    return isDifferent;
  };

  const getWeekAppointmentsByRange = useCallback(
    (selectedDate, selectedLocationId) => {
      // moment(date).startOf("isoWeek").add(i, "days").toDate();
      console.log("Timer");

      let startWeekTime = moment(selectedDate).startOf("isoWeek").toDate();
      startWeekTime.setHours(0, 0, 0, 0);

      let endWeekTime = moment(startWeekTime)
        .startOf("isoWeek")
        .add(7, "days")
        .toDate();
      endWeekTime.setHours(0, 0, 0, 0);

      let tempWeekData = [];
      console.log("Timer Range:",
        selectValue,
        moment(startWeekTime).toISOString(),
        moment(endWeekTime).toISOString());

      getAppointmentsListByTimeRange(
        elementDocId,
        selectValue,
        moment(startWeekTime).toISOString(),
        moment(endWeekTime).toISOString()
      ).then((result) => {
        console.log(" Setting time range per date: result", result);
        console.log("Week function");
        if (result) {
          weekDays.map((day) => {
            let DayList = result.filter(
              (item) => moment(item.date_time).format("ddd") === day
            );
            tempWeekData[day] = DayList;
          });
          // setData([]);
          setData((prev) => {
            if (
              JSON.stringify(prev) !==
              JSON.stringify(tempWeekData[moment(selectedDate).format("ddd")])
            ) {
              console.log(
                "Refresh list called : active values data",
                prev,
                tempWeekData[moment(selectedDate).format("ddd")]
              );
              return tempWeekData[moment(selectedDate).format("ddd")];
            } else {
              console.log(
                "Refresh list called : active values data else",
                prev,
                tempWeekData[moment(selectedDate).format("ddd")]
              );
              return prev;
            }
          });
          setWeekData((prev) => {
            if (JSONStringWeekComparison(prev, tempWeekData)) {
              console.log(
                "Refresh list called : active values week",
                prev,
                tempWeekData
              );
              return tempWeekData;
            } else {
              console.log(
                "Refresh list called : active values else week",
                prev,
                tempWeekData
              );
              return prev;
            }
          });
        }
      });
    },
    [elementDocId, selectValue]
  );

  const getMarksOnCalender = useCallback((loc_ID, status, setHook) => {
    getAppointmentsDateAPI(elementDocId, loc_ID, 0, status).then((result) => {
      console.log("Marks Api: ", loc_ID, status, result)
      if (!!result) {
        let a = [];
        result.map((item) => a.push(moment(item.date).format("YYYY-MM-DD")));
        setHook(a);
      } else {
        setHook([]);
      }
    });
  }, []);

  useEffect(() => {
    locationsAPI(elementDocId).then((result) => {
      console.log("location api in calender results", result);
      setFirstLoad(false);
      if (result.length === 1) {
        console.log("Location values ", result[0].doctors_hospital_location_id);
        setSelectedValue(result[0].doctors_hospital_location_id);
      }
      setLocationData(result);
    });
    refreshList();
  }, [date, elementDocId, props.refreshDate]);

  useEffect(() => {
    let myAppTimer;
    console.log(
      "Timer: start UseEffect",
      moment(new Date()).format("hh:mm:ss")
    );
    if (refreshTimer === 0) {
      refreshList();
      setRefreshTimer(30000);
    } else {
      console.log(
        "Refresh List Called: Timer Start",
        moment(new Date()).format("hh:mm:ss")
      );
      console.log(
        "Timer: start UseEffect inside if",
        moment(new Date()).format("hh:mm:ss")
      );
      myAppTimer = setInterval(() => {
        refreshList();
        console.log(
          "Timer: start UseEffect timeout interval",
          moment(new Date()).format("hh:mm:ss")
        );
      }, refreshTimer);
      setAppTimer(myAppTimer);
      console.log("Timer: UseEffect");
    }

    return () => {
      console.log(
        "Timer: Timer stopper",
        moment(new Date()).format("hh:mm:ss")
      );
      clearInterval(myAppTimer);
    };
  }, [refreshTimer]);

  useEffect(() => {
    if (selectValue !== 0) {
      console.log("Timer: UseEffect SelectValue");
      refreshList();
    }
  }, [selectValue]);

  useEffect(() => {
    console.log("USE EFFECT: MAIN : CALENDER 2");
    setStatsValue();
  }, [view, setStatsValue]);

  // useEffect(() => console.log(" Hello World: useeffect"))
  const renderItems = () => {
    console.log("locationData is ", locationData);
    return locationData.map((item, i) => (
      <option
        value={item.doctors_hospital_location_id}
        days={item.days}
        key={item.doctors_hospital_location_id}
      >
        {item.location}
      </option>
    ));
  };

  return locationData.length !== 0 && !!locationData ? (
    <Container fluid>
      <Row>
        <Col lg={3}>
          {/* <div style={{width: 200 , height: 80, backgroundColor: "lightblue", cursor: "pointer"}} onClick={manualRefresh}>stop</div> */}
          <div
            style={{
              ...styles.card,
              minHeight: "90vh",
              flex: 1,
              flexDirection: "column",
              display: "flex",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {locationData.length === 1 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ marginRight: 10 }}>
                    <label className="TitleLabel mtt-2">Location : </label>
                  </div>
                  <div style={{ display: "flex", flex: 1 }}>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: "200",
                        color: "#000000d4",
                        textTransform: "capitalize",
                      }}
                    >
                      {locationData[0].location}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ marginRight: 10 }}>
                    <label className="TitleLabel mtt-2">
                      Select Location :{" "}
                    </label>
                  </div>
                  <div style={{ display: "flex", flex: 1 }}>
                    <select
                      style={{
                        width: "100%",
                        borderColor: "lightgrey",
                        cursor: "pointer",
                      }}
                      value={selectValue}
                      onChange={handleChange1}
                    >
                      <option value={0}>{"All"}</option>
                      {renderItems()}
                    </select>
                  </div>
                </div>
              )}
              <h6 style={{ marginTop: 10 }}>
                <div style={{ color: "#0000007f" }}>Today</div>
                <div
                  style={{ fontWeight: 100, fontSize: 30, color: "#0000004f" }}
                >
                  {" "}
                  {moment(new Date()).format("dddd  Do MMM, YYYY")}{" "}
                </div>
              </h6>
              <Divider />
              <div>
                <Calender
                  onChange={onChange}
                  value={date}
                  tileClassName={({ date }) =>
                    AppointmentDateComparison(date, mark)
                      ? "EventHighlight"
                      : AppointmentDateComparison(date, markWaiting) &&
                      "EventHighlight2"
                  }
                />
              </div>
            </div>
            {/* <Col lg={3}> */}
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                margin: 8,
              }}
              className="CalendarSecStats"
            >
              <TodaysStats
                status={false}
                date={date}
                completed={completedAppointments}
                remaining={remainingAppointments}
                waiting={waitingAppointments}
                cancelled={cancelledAppointments}
                inprogress={inprogressAppointments}
                hold={holdAppointments}
                reschedule={rescheduledAppointments}
                total={totalAppointments}
                totalSlots={totalSlots}
                toggleView={view}
              />
            </div>
          </div>
          {/* </Col> */}
        </Col>
        <Col lg={9}>
          <div style={{ ...styles.card, padding: 0 }}>
            <CustomCalendarPanel
              autoOpen={props.autoOpen}
              appointmentData={data}
              weekData={weekData}
              currentlyActive={props.currentlyActive}
              refreshList={refreshListCallBack}
              weekList={weekList}
              selectedDate={date}
              toggleView={setView}
            />
          </div>
        </Col>
      </Row>
    </Container>
  ) : (
    <Container fluid>
      <Row>
        <Col>
          {firstLoad ? (
            <div
              style={{
                ...styles.card,
                minHeight: "90vh",
                flex: 1,
                flexDirection: "column",
                display: "flex",
                backgroundColor: "#f5f5f5",
                padding: 0,
                paddingRight: 0,
                paddingLeft: 0,
              }}
            >
              <SectionLoading />
              <PageLoading />
            </div>
          ) : (
            <div
              style={{
                ...styles.card,
                minHeight: "90vh",
                flex: 1,
                flexDirection: "column",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
              }}
            >
              <div
                style={{ fontSize: 48, fontWeight: "300", color: "#0000003a" }}
              >
                No Location Added
              </div>
              <div
                style={{ fontSize: 16, fontWeight: "bold", color: "#00000048" }}
              >
                Go to Profile And Add Location To Activate Appointment Tab
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CalenderSection;

const styles = {
  label: {
    fontSize: 14,
    color: "grey",
    textAlign: "Left",
    marginLeft: "20px",
    marginTop: "20px",
  },
  card: {
    backgroundColor: "#fff",
    boxShadow: "#00000018 2px 2px 10px",
    padding: 8,
    paddingRight: 12,
    paddingLeft: 12,
  },
};

CalenderSection.defaultProps = {
  autoOpen: () => { },
  refreshDate: false,
  data: [],
  currentPatient: [
    {
      appointment_id: 213,
      doctor_id: 2,
      date_time: "",
      patient_id: 8,
      patient_info: {
        patient_id: 8,
        name: "Not Available",
        dob: "",
        gender: "",
        image: "",
        patient_info: {
          image: "../Styles/Assets/avatar.png",
        },
      },
    },
  ],
  nextPatient: {
    appointment_id: 213,
    doctor_id: 2,
    date_time: "",
    patient_id: 8,
    patient_info: {
      patient_id: 8,
      name: "Not Available",
      dob: "",
      gender: "",
      image: "../Styles/Assets/avatar.png",
    },
  },
};

import React, { useState, useEffect, useCallback, useContext } from 'react'
import { getAppointmentsStats, showCompletedAppointmentStats } from '../../Hooks/API';
import { Row, Col } from 'react-bootstrap';
import { Badge, Empty } from 'antd';
import moment from 'moment'
import { Fragment } from "react";
import AppointmentsStatusList from "../Dashboard/AppointmentsStatusList";
import StatusChart from "../StatusChart";
import { getDateOfBirth, getTime } from "../../Hooks/TimeHandling";
import { GlobalContext } from "../../Context/GlobalState";
import { Divider } from "@material-ui/core";
import Colors from '../../Styles/Colors';

const TodaysStats = (props) => {
  const { accountId } = useContext(GlobalContext);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [remainingAppointments, setRemainingAppointments] = useState(0);
  const [waitingAppointments, setWaitingAppointments] = useState(0);
  const [cancelledAppointments, setCancelledAppointments] = useState(0);
  const [inprogressAppointments, setInprogressAppointments] = useState(0);
  const [holdAppointments, setHoldAppointments] = useState(0);
  const [completedList, setCompletedList] = useState([]);
  const [remainingList, setReaminingList] = useState([]);
  const [cancelledList, setCancelledList] = useState([]);
  const [inprogressList, setInprogressList] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [holdList, setHoldList] = useState([]);
  const [showRemaining, setShowRemaining] = useState(true);
  const [showWaiting, setShowWaiting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showInprogress, setShowInprogress] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [showHold, setShowHold] = useState(false);
  const [selectedList, setSelectedList] = useState("remaining");
  // const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const appointmentGraph = useCallback(() => {

    getAppointmentsStats(
      accountId,
      props.selectedLocation,
      moment(props.date).format("YYYY-MM-DD")
    ).then((result) => {
      console.log("Todays Stats Output ", result);
      if (result) {
        if (!!result[0]) {
          setCompletedAppointments(
            result[0].appointment_stats.graph_one.completed_appointments
          );
          setRemainingAppointments(
            result[0].appointment_stats.graph_one.remaining_appointments
          );
          setWaitingAppointments(
            result[0].appointment_stats.graph_one.waiting_appointments
          );
          setHoldAppointments(
            result[0].appointment_stats.graph_one.hold_appointments
          );
          // setTotalAppointments(result[0].appointment_stats.graph_one.total_appointments);
          setInprogressAppointments(
            result[0].appointment_stats.graph_one.inprogress_appointments
          );
          setCancelledAppointments(
            result[0].appointment_stats.graph_two.cancelled_appointments
          );
        } else {
          setCompletedAppointments(0);
          setRemainingAppointments(0);
          setWaitingAppointments(0);
          setHoldAppointments(0);
          setCancelledAppointments(0);
          setInprogressAppointments(0);
        }
      }
    });
  }, [accountId, props.selectedLocation, props.date]);

  const completeListings = useCallback(() => {
    console.log('completed appointments are ', accountId,
      props.selectedLocation,
      0,
      props.startDate,
      props.endDate,
      "completed")
    showCompletedAppointmentStats(
      accountId,
      props.selectedLocation,
      0,
      props.startDate,
      props.endDate,
      "completed"
    ).then((result) => {
      if (result) {
        console.log("Completeddddd", result);
        setCompletedList(result);
      } else {
        setCompletedList();
        console.log("No Completedddddddd");
      }
    });
  }, [accountId, props.selectedLocation]);

  const remainingListings = useCallback(() => {
    showCompletedAppointmentStats(
      accountId,
      props.selectedLocation,
      0,
      props.startDate,
      props.endDate,
      "upcoming"
    ).then((result) => {
      if (result) {
        setReaminingList(result);
        console.log("Remaining", result);
      } else {
        setReaminingList();
        console.log("No Remaining");
      }
    });
  }, [accountId, props.selectedLocation]);

  const waitingListings = useCallback(() => {
    showCompletedAppointmentStats(
      accountId,
      props.selectedLocation,
      0,
      props.startDate,
      props.endDate,
      "waiting"
    ).then((result) => {
      if (result) {
        console.log("Waiting", result);
        setWaitingList(result);
      } else {
        console.log("No Waiting");
      }
    });
  }, [accountId, props.selectedLocation]);

  const cancelledListings = useCallback(() => {
    showCompletedAppointmentStats(
      accountId,
      props.selectedLocation,
      0,
      props.startDate,
      props.endDate,
      "cancelled"
    ).then((result) => {
      if (result) {
        console.log("cancelled", result);
        setCancelledList(result);
      } else {
        console.log("No cancelled");
      }
    });
  }, [accountId, props.selectedLocation]);

  const inprogressListings = useCallback(() => {
    showCompletedAppointmentStats(
      accountId,
      props.selectedLocation,
      0,
      props.startDate,
      props.endDate,
      "inprogress"
    ).then((result) => {
      if (result) {
        console.log("inprogress", result);
        setInprogressList(result);
      } else {
        console.log("No inprogress");
      }
    });
  }, [accountId, props.selectedLocation]);

  const holdListings = useCallback(() => {
    showCompletedAppointmentStats(
      accountId,
      props.selectedLocation,
      0,
      props.startDate,
      props.endDate,
      "hold"
    ).then((result) => {
      if (result) {
        console.log("hold", result);
        setHoldList(result);
      } else {
        console.log("No hold");
      }
    });
  }, [accountId, props.selectedLocation]);

  const onClickWaiting = () => {
    setSelectedList("waiting");
    setShowRemaining(false);
    setShowWaiting(true);
    setShowComplete(false);
    setShowCancelled(false);
    setShowInprogress(false);
    setShowHold(false);
  };

  const onClickRemaining = () => {
    setSelectedList("remaining");
    setShowRemaining(true);
    setShowWaiting(false);
    setShowComplete(false);
    setShowCancelled(false);
    setShowInprogress(false);
    setShowHold(false);
  };

  const onClickComplete = () => {
    setSelectedList("completed");
    setShowRemaining(false);
    setShowWaiting(false);
    setShowComplete(true);
    setShowCancelled(false);
    setShowInprogress(false);
    setShowHold(false);
  };
  const onClickInprogress = () => {
    setSelectedList("inprogress");
    setShowRemaining(false);
    setShowWaiting(false);
    setShowComplete(false);
    setShowCancelled(false);
    setShowInprogress(true);
    setShowHold(false);
  };
  const onClickCancelled = () => {
    setSelectedList("cancelled");
    setShowRemaining(false);
    setShowWaiting(false);
    setShowComplete(false);
    setShowCancelled(true);
    setShowInprogress(false);
    setShowHold(false);
  };
  const onClickHold = () => {
    setSelectedList("hold");
    setShowRemaining(false);
    setShowWaiting(false);
    setShowComplete(false);
    setShowCancelled(false);
    setShowInprogress(false);
    setShowHold(true);
  };

  const renderRemainingList = () =>
    remainingList.map((data, i) => {
      return (
        <AppointmentsStatusList
          key={i}
          number={data.patient_id}
          src={data.image}
          name={data.name}
          age={getDateOfBirth(data.dob)}
          gender={data.gender}
          date={getTime(data.date_time)}
        />
      );
    });

  const renderCompletedList = () =>
    completedList.map((data, i) => {
      return (
        <AppointmentsStatusList
          key={i}
          number={data.patient_id}
          src={data.image}
          name={data.name}
          age={getDateOfBirth(data.dob)}
          gender={data.gender}
          date={getTime(data.date_time)}
        />
      );
    });

  const renderWaitingList = () =>
    waitingList.map((data, i) => {
      return (
        <AppointmentsStatusList
          key={i}
          number={data.patient_id}
          src={data.image}
          name={data.name}
          age={getDateOfBirth(data.dob)}
          gender={data.gender}
          date={getTime(data.date_time)}
        />
      );
    });

  const renderInprogessList = () =>
    inprogressList.map((data, i) => {
      return (
        <AppointmentsStatusList
          key={i}
          number={data.patient_id}
          src={data.image}
          name={data.name}
          age={getDateOfBirth(data.dob)}
          gender={data.gender}
          date={getTime(data.date_time)}
        />
      );
    });

  const renderCancelledList = () =>
    cancelledList.map((data, i) => {
      return (
        <AppointmentsStatusList
          key={i}
          number={data.patient_id}
          src={data.image}
          name={data.name}
          age={getDateOfBirth(data.dob)}
          gender={data.gender}
          date={getTime(data.date_time)}
        />
      );
    });

  const renderHoldList = () =>
    holdList.map((data, i) => {
      return (
        <AppointmentsStatusList
          key={i}
          number={data.patient_id}
          src={data.image}
          name={data.name}
          age={getDateOfBirth(data.dob)}
          gender={data.gender}
          date={getTime(data.date_time)}
        />
      );
    });

  useEffect(() => {
    // appointmentGraph();
    // completeListings();
    // remainingListings();
    // waitingListings();
    // cancelledListings();
    // inprogressListings();
    // holdListings();
  }, [
    props.selectedLocation,
    // completeListings,
    // appointmentGraph,
    // remainingListings,
    // waitingListings,
    // inprogressListings,
    // holdListings,
    // cancelledListings,
  ]);
  // <Row className='AppointmentStats' style={{ display: "flex", flexDirection: "row", flex:1, justifyContent: "center", marginTop: 12}}>
  // <div className="AppointmentStats-Badges" style={{marginTop: "auto", marginBottom: "auto"}} >

  return (
    <Fragment>
      {props.status ? (
        <Row>
          <Col lg={3} md={3} sm={3}>
            <div className="StatsMain">
              <h6 className="StatsTitle">Today's Status</h6>
              <div
                className="AppointmentStats"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <StatusChart
                  completed={completedAppointments}
                  remaining={remainingAppointments}
                  waiting={waitingAppointments}
                  cancelled={cancelledAppointments}
                  hold={holdAppointments}
                  inprogress={inprogressAppointments}
                  status={"today"}
                />
              </div>
            </div>
          </Col>
          <Col
            lg={2}
            md={2}
            sm={2}
            style={{ borderRight: "1px solid #efefef" }}
          >
            <div className="Statslegends">
              <Badge
                color={selectedList === "waiting" ? "#fff" : Colors.checkedin}
                text="Checked In"
                onClick={onClickWaiting}
                style={
                  selectedList === "waiting"
                    ? {
                      width: 100,
                      backgroundColor: Colors.checkedin,
                      color: "#fff",
                      borderRadius: 50,
                      marginLeft: 10,
                      marginRight: 10,
                    }
                    : { width: 100, marginLeft: 10, marginRight: 10 }
                }
              />
              <br />
              <Badge
                color={selectedList === "remaining" ? "#fff" : Colors.remaining}
                text="Remaining"
                onClick={onClickRemaining}
                style={
                  selectedList === "remaining"
                    ? {
                      width: 100,
                      backgroundColor: Colors.remaining,
                      color: "#fff",
                      borderRadius: 50,
                      marginLeft: 10,
                      marginRight: 10,
                    }
                    : { width: 100, marginLeft: 10, marginRight: 10 }
                }
              />
              <br />
              <Badge
                color={selectedList === "completed" ? "#fff" : Colors.attended}
                text="Attended"
                onClick={onClickComplete}
                style={
                  selectedList === "completed"
                    ? {
                      width: 100,
                      backgroundColor: Colors.attended,
                      color: "#fff",
                      borderRadius: 50,
                      marginLeft: 10,
                      marginRight: 10,
                    }
                    : { width: 100, marginLeft: 10, marginRight: 10 }
                }
              />
              <br />
              <Badge
                color={selectedList === "inprogress" ? "#fff" : Colors.inprogress}
                text="Inprogress"
                onClick={onClickInprogress}
                style={
                  selectedList === "inprogress"
                    ? {
                      width: 100,
                      backgroundColor: Colors.inprogress,
                      color: "#fff",
                      borderRadius: 50,
                      marginLeft: 10,
                      marginRight: 10,
                    }
                    : { width: 100, marginLeft: 10, marginRight: 10 }
                }
              />
              <br />
              <Badge
                color={selectedList === "cancelled" ? "#fff" : Colors.cancelled}
                text="Cancelled"
                onClick={onClickCancelled}
                style={
                  selectedList === "cancelled"
                    ? {
                      width: 100,
                      backgroundColor: Colors.cancelled,
                      color: "#fff",
                      borderRadius: 50,
                      marginLeft: 10,
                      marginRight: 10,
                    }
                    : { width: 100, marginLeft: 10, marginRight: 10 }
                }
              />
              <br />
              <Badge
                color={selectedList === "hold" ? "#fff" : Colors.waiting}
                text="Waiting"
                onClick={onClickHold}
                style={
                  selectedList === "hold"
                    ? {
                      width: 100,
                      backgroundColor: Colors.waiting,
                      color: "#fff",
                      borderRadius: 50,
                      marginLeft: 10,
                      marginRight: 10,
                    }
                    : { width: 100, marginLeft: 10, marginRight: 10 }
                }
              />
            </div>
          </Col>

          <Col lg={7} md={7} sm={7}>
            <div className="StatusList">
              {showRemaining ? (
                <Fragment>
                  <label className="StatsListTitle">
                    Remaining Appointments
                  </label>
                  {remainingList.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={"No Remaining Appointments"}
                    />
                  ) : (
                    renderRemainingList()
                  )}
                </Fragment>
              ) : (
                ""
              )}

              {showComplete ? (
                <Fragment>
                  <label className="StatsListTitle">
                    Attended Appointments
                  </label>
                  {completedList.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={"No Attended  Appointments"}
                    />
                  ) : (
                    renderCompletedList()
                  )}
                </Fragment>
              ) : (
                ""
              )}

              {showWaiting ? (
                <Fragment>
                  <label className="StatsListTitle">
                    Checked In Appointments
                  </label>
                  {waitingList.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={"No Checked In Appointments"}
                    />
                  ) : (
                    renderWaitingList()
                  )}
                </Fragment>
              ) : (
                ""
              )}

              {showInprogress ? (
                <Fragment>
                  <label className="StatsListTitle">
                    Inprogress Appointments
                  </label>
                  {inprogressList.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={"No Appointment is in progress"}
                    />
                  ) : (
                    renderInprogessList()
                  )}
                </Fragment>
              ) : (
                ""
              )}

              {showCancelled ? (
                <Fragment>
                  <label className="StatsListTitle">
                    Canceled Appointments
                  </label>
                  {cancelledList.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={"No Canceled Appointment"}
                    />
                  ) : (
                    renderCancelledList()
                  )}
                </Fragment>
              ) : (
                ""
              )}

              {showHold ? (
                <Fragment>
                  <label className="StatsListTitle">Waiting Appointments</label>
                  {holdList.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={"No Waiting Appointment"}
                    />
                  ) : (
                    renderHoldList()
                  )}
                </Fragment>
              ) : (
                ""
              )}
            </div>
          </Col>
        </Row>
      ) : props.toggleView === "day" ? (
        <Row>
          {moment(props.date).format("YYYY-MM-DD") ===
            moment(new Date()).format("YYYY-MM-DD") ? (
            <Col lg={12} md={12} sm={12}>
              <div className="StatsMain">
                <Row>
                  <Col lg="8" style={{ textAlign: "left" }}>
                    <label style={{ color: "grey", fontWeight: "bold" }}>
                      Today's Summary
                    </label>
                  </Col>
                </Row>
                <Divider />
                <Row style={{ marginTop: "5px" }}>
                  <Col lg="12">
                    {props.totalSlots === 0 ? (
                      <h6 className="VitalName">No doctor available</h6>
                    ) : (
                      <h6 className="VitalName" style={{ fontSize: 12 }}>
                        Available Slots:{" "}
                        <span
                          className="VitalValue"
                          style={{
                            fontSize: 22,
                            marginLeft: 5,
                            fontWeight: "normal",
                          }}
                        >
                          {Math.round(
                            100 - (props.total / props.totalSlots) * 100
                          ) + "%"}{" "}
                        </span>
                      </h6>
                    )}
                  </Col>
                </Row>
                {/* <Fragment>    
                        </Fragment> */}
                <div
                  className="AppointmentStats"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    justifyContent: "center",
                    flexWrap: "wrap-reverse"
                  }}
                >
                  <div
                    className="AppointmentStats-Badges"
                    style={{ marginTop: "auto", marginBottom: "auto" }}
                  >
                    {/* <div className='text-center Statslegends'> */}
                    <Badge
                      color={Colors.checkedin}
                      text="Checked In"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.remaining}
                      text="Remaining"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.attended}
                      text="Attended"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.inprogress}
                      text="Inprogress"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.cancelled}
                      text="Canceled"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.waiting}
                      text="Waiting"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.rescheduled}
                      text="Resheduled"
                      style={{ ...styles.badgeStyle }}
                    />
                    {/* </div> */}
                  </div>
                  <div>
                    <StatusChart
                      completed={props.completed}
                      remaining={props.remaining}
                      waiting={props.waiting}
                      cancelled={props.cancelled}
                      hold={props.hold}
                      inprogress={props.inprogress}
                      reschedule={props.reschedule}
                      status={"today"}
                    />
                  </div>
                </div>
              </div>
            </Col>
          ) : props.date < new Date().setHours(0, 0, 0, 0) ? (
            <Col lg={12} md={12} sm={12}>
              <div className="StatsMain">
                {/* <Row>
                            <Col lg='8' style={{ textAlign: 'left' }}>
                                <label style={{ color: 'grey', fontWeight: 'bold' }}>Today's Summary</label>
                            </Col>
                        </Row> */}
                <Row>
                  <Col lg="7" style={{ textAlign: "left" }}>
                    <label style={{ color: "grey", fontWeight: "bold" }}>
                      {" "}
                      Summary{" "}
                    </label>
                  </Col>
                  <Col lg="5">
                    <h6
                      style={{ textAlign: "right", color: "rgb(224, 0, 77)" }}
                    >
                      {moment(props.date).format("Do MMM, YYYY")}
                    </h6>
                  </Col>
                </Row>
                <Divider />
                <div
                  className="AppointmentStats"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    justifyContent: "center",
                    marginTop: 12,
                    flexWrap: "wrap-reverse"
                  }}
                >
                  <div
                    className="AppointmentStats-Badges"
                    style={{ marginTop: "auto", marginBottom: "auto" }}
                  >
                    {/* <div className='text-center Statslegends'> */}
                    <Badge
                      color={Colors.attended}
                      text="Attended"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.cancelled}
                      text="Canceled"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.missedPast}
                      text="Missed"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.rescheduled}
                      text="Resheduled"
                      style={{ ...styles.badgeStyle }}
                    />
                    {/* </div> */}
                  </div>
                  <div>
                    <StatusChart
                      completed={props.completed}
                      cancelled={props.cancelled}
                      remaining={props.remaining}
                      reschedule={props.reschedule}
                      status={"past"}
                    />
                  </div>
                </div>
              </div>
            </Col>
          ) : (
            <Col lg={12} md={12} sm={12}>
              <div className="StatsMain">
                <Row>
                  <Col lg="7" style={{ textAlign: "left" }}>
                    <label style={{ color: "grey", fontWeight: "bold" }}>
                      {" "}
                      Summary{" "}
                    </label>
                  </Col>
                  <Col lg="5">
                    <h6
                      style={{ textAlign: "right", color: "rgb(224, 0, 77)" }}
                    >
                      {moment(props.date).format("Do MMM, YYYY")}
                    </h6>
                  </Col>
                </Row>
                <Divider />
                <div>
                  <Row>
                    {/* <Col lg='4' md='4' sm='4'>
                                        <div className='VitalImg'>
                                            <img className='VitalImgIcon' src={Slots} />
                                        </div>
                                    </Col> */}
                    <Col className="mtt-13">
                      {props.totalSlots === 0 ? (
                        <h6 className="VitalName" style={{}}>
                          Doctor not available on this day at this location
                        </h6>
                      ) : (
                        <Fragment>
                          <h6 className="VitalName" style={{ fontSize: 12 }}>
                            Available Slots:
                            <span
                              className="VitalValue"
                              style={{
                                fontSize: 22,
                                marginLeft: 5,
                                fontWeight: "normal",
                              }}
                            >
                              {Math.round(
                                100 - (props.total / props.totalSlots) * 100
                              ) + "%"}
                            </span>
                          </h6>
                          <h6 className="VitalName" style={{ fontSize: 12 }}>
                            Scheduled Appointments:
                            <span
                              className="VitalValue"
                              style={{
                                fontSize: 22,
                                marginLeft: 5,
                                fontWeight: "normal",
                              }}
                            >
                              {" "}
                              {props.total}{" "}
                            </span>
                          </h6>
                        </Fragment>
                      )}
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          )}
        </Row>
      ) : (
        <Row>
          {moment(props.date).format("YYYY-MM-DD") ===
            moment(new Date()).format("YYYY-MM-DD") ? (
            <Col lg={12} md={12} sm={12}>
              <div className="StatsMain">
                <Row>
                  <Col lg="8" style={{ textAlign: "left" }}>
                    <label style={{ color: "grey", fontWeight: "bold" }}>
                      Current Week Summary
                    </label>
                  </Col>
                </Row>
                <Divider />
                <Row>
                  <Col lg="12" style={{ marginTop: 5 }}>
                    {props.totalSlots === 0 ? (
                      <h6 className="VitalName">No doctor available</h6>
                    ) : (
                      <h6 className="VitalName" style={{ fontSize: 12 }}>
                        Available Slots:{" "}
                        <span
                          className="VitalValue"
                          style={{
                            fontSize: 22,
                            marginLeft: 5,
                            fontWeight: "normal",
                          }}
                        >
                          {Math.round(
                            100 - (props.total / props.totalSlots) * 100
                          ) + "%"}{" "}
                        </span>
                      </h6>
                    )}
                  </Col>
                </Row>
                {/* <Fragment>    
                    </Fragment> */}
                <div
                  className="AppointmentStats"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    justifyContent: "center",
                    marginTop: 12,
                    flexWrap: "wrap-reverse"
                  }}
                >
                  <div
                    className="AppointmentStats-Badges"
                    style={{ marginTop: "auto", marginBottom: "auto" }}
                  >
                    {/* <div className='text-center Statslegends'> */}
                    <Badge
                      color={Colors.checkedin}
                      text="Checked In"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.remaining}
                      text="Remaining"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.attended}
                      text="Attended"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.inprogress}
                      text="Inprogress"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.cancelled}
                      text="Canceled"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.waiting}
                      text="Waiting"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.rescheduled}
                      text="Resheduled"
                      style={{ ...styles.badgeStyle }}
                    />
                    {/* </div> */}
                  </div>
                  <div>
                    <StatusChart
                      completed={props.completed}
                      remaining={props.remaining}
                      waiting={props.waiting}
                      cancelled={props.cancelled}
                      hold={props.hold}
                      inprogress={props.inprogress}
                      reschedule={props.reschedule}
                      status={"today"}
                    />
                  </div>
                </div>
              </div>
            </Col>
          ) : props.date < new Date().setHours(0, 0, 0, 0) ? (
            <Col lg={12} md={12} sm={12}>
              <div className="StatsMain">
                <Row>
                  <Col lg="8" style={{ textAlign: "left" }}>
                    <label style={{ color: "grey", fontWeight: "bold" }}>
                      Past Week Summary
                    </label>
                  </Col>
                </Row>
                <div
                  className="AppointmentStats"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    justifyContent: "center",
                    marginTop: 12,
                    flexWrap: "wrap-reverse"
                  }}
                >
                  <div
                    className="AppointmentStats-Badges"
                    style={{ marginTop: "auto", marginBottom: "auto" }}
                  >
                    {/* <div className='text-center Statslegends'> */}
                    <Badge
                      color={Colors.attended}
                      text="Attended"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.cancelled}
                      text="Canceled"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.missedPast}
                      text="Missed"
                      style={{ ...styles.badgeStyle }}
                    />
                    <br />
                    <Badge
                      color={Colors.rescheduled}
                      text="Resheduled"
                      style={{ ...styles.badgeStyle }}
                    />
                    {/* </div> */}
                  </div>
                  <div>
                    <StatusChart
                      completed={props.completed}
                      cancelled={props.cancelled}
                      remaining={props.remaining}
                      reschedule={props.reschedule}
                      status={"past"}
                    />
                  </div>
                </div>
              </div>
            </Col>
          ) : (
            <Col lg={12} md={12} sm={12}>
              <div>
                <Row>
                  <Col lg="8" style={{ textAlign: "left" }}>
                    <label style={{ color: "grey", fontWeight: "bold" }}>
                      Upcoming Week Summary{" "}
                    </label>
                  </Col>
                  {/* <Col lg='4'>
                            <h6 style={{ textAlign: 'right', color: 'rgb(224, 0, 77)' }}>{moment(props.date).format("D MMM, YYYY")}</h6>
                        </Col> */}
                </Row>
                <Divider />
                <div style={{ paddingBottom: 24 }}>
                  <Row>
                    {/* <Col lg='4' md='4' sm='4'>
                                        <div className='VitalImg'>
                                            <img className='VitalImgIcon' src={Slots} />
                                        </div>
                                    </Col> */}
                    <Col className="mtt-13">
                      {props.totalSlots === 0 ? (
                        <h6 className="VitalName">
                          Doctor not available on this day of week at this
                          location
                        </h6>
                      ) : (
                        <Fragment>
                          <h6 className="VitalName" style={{ fontSize: 12 }}>
                            Available Slots:
                            <span
                              className="VitalValue"
                              style={{
                                fontSize: 22,
                                marginLeft: 5,
                                fontWeight: "normal",
                              }}
                            >
                              {Math.round(
                                100 - (props.total / props.totalSlots) * 100
                              ) + "%"}
                            </span>
                          </h6>
                          <h6 className="VitalName" style={{ fontSize: 12 }}>
                            Scheduled Appointments:
                            <span
                              className="VitalValue"
                              style={{
                                fontSize: 22,
                                marginLeft: 5,
                                fontWeight: "normal",
                              }}
                            >
                              {" "}
                              {props.total}{" "}
                            </span>
                          </h6>
                        </Fragment>
                      )}
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          )}
        </Row>
      )}
    </Fragment>
  );
};

export default TodaysStats;
TodaysStats.defaultProps = {
  selectedLocation: 0,
};

const styles = {
  badgeStyle: {
    width: 100,
    marginLeft: 20,
    marginRight: 4,
    fontSize: 10,
    fontWeight: "normal",
    color: "#000000a1",
  },
};

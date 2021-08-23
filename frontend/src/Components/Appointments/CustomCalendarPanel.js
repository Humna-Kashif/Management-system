import React, { useEffect, useRef, useState } from "react"
import moment from "moment";
import SlotCard from "./SlotCard";
import { Tooltip } from 'antd';

const tc = require("time-slots-generator");

const CustomCalendarPanel = (props) => {
    const myRef = useRef(null)
    // const executeScroll = () => myRef.current.scrollIntoView();
    function scrollTo(ref) {
        if (!ref.current) return;
        ref.current.scrollIntoView({
            behavior: "auto",
            block: "center",
            // inline: "start",
            // block: "end",
            inline: "end"
        });
    }

    const [viewOption, setViewOption] = useState(!!localStorage.getItem("calenderViewOption") ? localStorage.getItem("calenderViewOption") : 'day');
    const [slotOption, setSlotOption] = useState(!!localStorage.getItem("calenderSlotOption") ? localStorage.getItem("calenderSlotOption") : 'hour');

    // const allDaySlots = Object.entries(tc.getTimeSlots([[300,900],[1200,1260]],true,"quarter"));
    let allDaySlotsKeys = Object.keys(tc.getTimeSlots([], true, slotOption));
    allDaySlotsKeys.unshift(0);

    const setDaySlotFormat = (slotOption) => {
        let tempAllSlots = Object.values(tc.getTimeSlots([], true, slotOption));
        tempAllSlots.unshift("0:00");
        return tempAllSlots
    }

    const [allDaySlotValues, setAllDaySlotValues] = useState(setDaySlotFormat(!!localStorage.getItem("calenderSlotOption") ? localStorage.getItem("calenderSlotOption") : 'hour'));
    const [dataArray, setDataArray] = useState([])
    const [weekDataArray, setWeekDataArray] = useState([])

    const timeDivider = (slotOption) => {
        const slot = slotOption;
        if (slot === "quarter")
            return 15;
        if (slot === "half")
            return 30;
        if (slot === "hour")
            return 60;
        if (slot === "two")
            return 120;
    }

    const [timeDivVal, setTimeDivVal] = useState(timeDivider(!!localStorage.getItem("calenderSlotOption") ? localStorage.getItem("calenderSlotOption") : 'hour'));


    const renderView = (slot) => {
        let popOverStyle = {}
        let topVal = -30;
        let leftVal = 70;
        if (timeStringToMinInt(slot) > 1200)
            topVal = -200;

        popOverStyle = { left: leftVal, top: topVal }
        if (slot === "0:00")
            console.log("data array", dataArray[slot])
        if (dataArray[slot] !== "" && !!dataArray[slot]) {
            return (dataArray[slot].map((item, i) =>
                <SlotCard autoOpen={props.autoOpen} popOverStyle={popOverStyle} itemData={item} refreshList={props.refreshList} currentlyActive={props.currentlyActive} />
            )
            )
        }
        return ""
    }

    const renderWeekView = (slot, day) => {
        let popOverStyle = {}
        let topVal = -30;
        let leftVal = 70;
        if (timeStringToMinInt(slot) > 1200)
            topVal = -200;

        if (day === "Sat" || day === "Sun") {
            leftVal = -300
        }
        popOverStyle = { left: leftVal, top: topVal }
        if (!!weekDataArray[day])
            if (!!weekDataArray[day][slot]) {
                return ((weekDataArray[day][slot]).map(item =>
                    <SlotCard autoOpen={props.autoOpen} small itemData={item} popOverStyle={popOverStyle} refreshList={props.refreshList} currentlyActive={props.currentlyActive} />
                )
                )
            }
        return ""
    }


    //*********  this code is to enable clickablity on empty slot: don't remove it  *************//
    //
    //****               Start                ****//
    // const [emptyContainerSlot, setEmptyContainerSlot] = useState([])
    // const [emptyContainerDate, setEmptyContainerDate] = useState([])
    // const emptySlotHandler = (slot, date) => {
    //     console.log("Empty Slot Clicked.", slot, "date", moment(date).format('DD'))      
    //     console.log("Empty new Slot List Clicked", slot);
    //     if(emptyContainerSlot === slot && emptyContainerDate===date){
    //         setEmptyContainerSlot([]);
    //         setEmptyContainerDate([]);
    //     }else{
    //         setEmptyContainerSlot(slot);
    //         setEmptyContainerDate(date);
    //     }
    // }

    // const renderEmptySlot = (slot, date) => {
    //     if(emptyContainerSlot === slot && emptyContainerDate===date)
    //     return <EmptySlotPopoverCard slot={emptyContainerSlot} date={emptyContainerDate}/>
    //     else
    //     return ""
    // }
    // 
    //****               Start                ****//

    const currentTimePositionInSlot = (startTimeString, endTimeString) => {
        let currentTime = new Date();
        let startString = startTimeString.split(":");
        let startTime = new Date();
        startTime.setHours(parseInt(startString[0]), parseInt(startString[1]), 0)
        let endString = endTimeString.split(":");
        let endTime = new Date();
        endTime.setHours(parseInt(endString[0]), parseInt(endString[1]), 0)
        return (currentTime >= startTime && currentTime < endTime)
    }

    const renderDaySlotRows = () => {
        // setTimeout(() => {
        //     scrollTo(myRef);
        // }, 1000)

        // scrollTo(myRef);

        return (
            allDaySlotValues.map((item, i) =>
                <div style={{ display: "flex", flexDirection: "row", minHeight: 40, alignItems: "center", borderBottom: "0.4px solid #00000018" }}>
                    {i !== allDaySlotValues.length - 1 && currentTimePositionInSlot(allDaySlotValues[i], allDaySlotValues[i + 1]) && <div ref={myRef}></div>}
                    <Tooltip
                        title={
                            (i !== allDaySlotValues.length - 1 && currentTimePositionInSlot(allDaySlotValues[i], allDaySlotValues[i + 1])) &&
                            `Current Time: ${(moment(new Date()).local().format("H:mm"))}`
                        }
                        placement="top"
                        trigger="hover">
                        <div
                            style={
                                (i !== allDaySlotValues.length - 1 && currentTimePositionInSlot(allDaySlotValues[i], allDaySlotValues[i + 1])) ?
                                    { width: 80, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ddddff", cursor: "pointer" }
                                    :
                                    { width: 80, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" }
                            }>
                            <div style={{ padding: 10, fontWeight: "bold", fontSize: 12, color: "#7f7f7f" }}>{allDaySlotValues[i]}</div>
                        </div>
                    </Tooltip>
                    <div style={{ padding: 10, minHeight: 40, paddingLeft: 8, borderLeft: "0.4px solid #00000018", paddingRight: 8, flexDirection: "column", display: "flex", flex: 1 }}>
                        {renderView(item)}
                    </div>
                    {/* {  (moment(new Date()).local().format("H:mm") > allDaySlotValues[i]) && <div>haahah </div>}
                    {  (allDaySlotValues[i])}
                    {  (moment(new Date()).local().format("H:mm")) }
                    { i!==allDaySlotValues.length-1 && currentTimePositionInSlot(allDaySlotValues[i],allDaySlotValues[i+1]) && "this is in range"} */}
                    {/* { i!==allDaySlotValues.length-1 && currentTimePositionInSlot(allDaySlotValues[i],allDaySlotValues[i+1]) && "this is in range"} */}
                    {/* {allDaySlotValues[i]=== "20:00" && <div ref={myRef}>{allDaySlotValues[i]}</div>} */}
                </div>
            )
        )
    }

    const renderWeekSlotRows = () => {
        return (
            allDaySlotValues.map((item) =>
                <div style={{ display: "flex", flexDirection: "row", minHeight: 40, alignItems: "center", borderBottom: "0.4px solid #00000018" }}>
                    <div style={{ width: 80, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ padding: 10, fontWeight: "bold", fontSize: 12, color: "#7f7f7f" }}>{item}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", flex: 1 }}>
                        <div style={{ padding: 10, minHeight: 40, flexDirection: "column", paddingLeft: 8, borderLeft: "0.4px solid #00000018", paddingRight: 8, display: "flex", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {renderWeekView(item, "Mon")}
                            </div>
                        </div>
                        <div style={{ padding: 10, minHeight: 40, flexDirection: "column", paddingLeft: 8, borderLeft: "0.4px solid #00000018", paddingRight: 8, display: "flex", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {renderWeekView(item, "Tue")}
                            </div>
                        </div>
                        <div style={{ padding: 10, minHeight: 40, flexDirection: "column", paddingLeft: 8, borderLeft: "0.4px solid #00000018", paddingRight: 8, display: "flex", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {renderWeekView(item, "Wed")}
                            </div>
                        </div>
                        <div style={{ padding: 10, minHeight: 40, flexDirection: "column", paddingLeft: 8, borderLeft: "0.4px solid #00000018", paddingRight: 8, display: "flex", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {renderWeekView(item, "Thu")}
                            </div>
                        </div>
                        <div style={{ padding: 10, minHeight: 40, flexDirection: "column", paddingLeft: 8, borderLeft: "0.4px solid #00000018", paddingRight: 8, display: "flex", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {renderWeekView(item, "Fri")}
                            </div>
                        </div>
                        <div style={{ padding: 10, minHeight: 40, flexDirection: "column", paddingLeft: 8, borderLeft: "0.4px solid #00000018", paddingRight: 8, display: "flex", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {renderWeekView(item, "Sat")}
                            </div>
                        </div>
                        <div style={{ padding: 10, minHeight: 40, flexDirection: "column", paddingLeft: 8, borderLeft: "0.4px solid #00000018", paddingRight: 8, display: "flex", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {renderWeekView(item, "Sun")}
                            </div>
                        </div>
                    </div>
                </div>
            )
        )
    }

    const timeStringToMinInt = (timeString) => {
        let val = timeString.split(":")
        // console.log("this is the data custom calender time function", timeString, parseInt(val[0] * 60) + parseInt(val[1]))
        return parseInt(val[0] * 60) + parseInt(val[1])
    }

    const timeFormator = (time) => {

        let timeString = moment(time).local().format("H:mm")
        let val = timeString.split(":")
        // console.log("this is the data custom calender time function", timeString, parseInt(val[0] * 60) + parseInt(val[1]))
        return parseInt(val[0] * 60) + parseInt(val[1])
    }


    useEffect(() => {
        setAllDaySlotValues(setDaySlotFormat(slotOption));
        setTimeDivVal(timeDivider(slotOption));
    }, [slotOption])

    useEffect(() => {
        console.log("this is the data custom calender input", props.appointmentData)
        if (!!props.appointmentData) {
            let tempArray = []
            allDaySlotValues.map(item => tempArray[`${item}`] = [])
            console.log("this is the data custom calender week  day all slot", allDaySlotValues, tempArray)
            props.appointmentData.map(item =>
                // !!tempArray[`${allDaySlotValues[parseInt(timeFormator(item.date_time) / timeDivVal)]}`] &&
                tempArray[`${allDaySlotValues[parseInt(timeFormator(item.date_time) / timeDivVal)]}`].push(item)
            )
            console.log("this is the data custom calender week  day all slot &&&&", allDaySlotValues, tempArray)
            setDataArray(tempArray)
        }
    }, [props.appointmentData, viewOption, allDaySlotValues, timeDivVal])

    useEffect(() => {
        console.log("this is the data custom calender week input", props.weekData)
        if (!!props.weekData["Mon"]) {
            let tempWeekData = {}
            const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            weekDays.map((dayName) => {
                let tempArray = {}
                // console.log("this is the data custom calender week all slot", allDaySlotValues)
                allDaySlotValues.map(item => tempArray[item] = [])
                console.log("this is the data custom calender week all slot", allDaySlotValues, tempArray)
                props.weekData[dayName].map(item =>
                    // !!tempArray[`${allDaySlotValues[parseInt(timeFormator(item.date_time) / timeDivVal)]}`] &&
                    tempArray[`${allDaySlotValues[parseInt(timeFormator(item.date_time) / timeDivVal)]}`].push(item)
                )
                tempWeekData[dayName] = tempArray
                return tempArray;
            })
            setWeekDataArray(tempWeekData)

        }
    }, [props.weekData, viewOption, allDaySlotValues, timeDivVal])

    useEffect(() => {
        scrollTo(myRef);
    }, [viewOption])

    const renderWeekHeader = () => {
        return (
            <div style={{ display: "flex", flexDirection: "row", borderTop: "0.4px solid #00000018" }}>
                <div style={{ width: 80, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ padding: 10, fontWeight: "bold", fontSize: 12, color: "#7f7f7f" }}>Slots</div>
                </div>
                {props.weekList.map(day =>
                    <div style={{ padding: 10, minHeight: 40, paddingLeft: 8, borderLeft: "0.4px solid #00000018", paddingRight: 8, display: "flex", flex: 1, flexDirection: "column" }}>
                        {/* <div>{moment(props.selectedDate).format('ddd')}</div> */}
                        <div>{moment(day).format('ddd')}</div>
                        <div style={moment(props.selectedDate).format('DD') === moment(day).format('DD') ?
                            { backgroundColor: "#e0004d", color: "white", borderRadius: 100 } :
                            { backgroundColor: "white" }}>{moment(day).format('DD')}</div>
                    </div>
                )}
                {/* <div style={{padding: 10, minHeight: 40 , paddingLeft:8,borderLeft: "0.4px solid #00000018", paddingRight: 8, display: "flex", flex: 1}}>
                    Day+3
                </div> */}
            </div>
        )
    }

    return (
        <div style={{ overflowY: "auto", height: "90vh" }}>
            {/* Head */}
            <div style={{
                minHeight: 60,
                position: "sticky",
                top: 0,
                backgroundColor: "#fff",
                alignItems: "center",
                zIndex: 60,
                borderBottom: "1px solid #00000018"
            }}>
                <div style={{ display: "flex", flexDirection: "row", padding: 20, alignItems: "baseline" }}>
                    <div style={{ display: "flex", flex: 1, alignItems: "baseline" }}>
                        {
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline" }}>
                                <div style={{ fontWeight: "300", fontSize: 22 }}>{moment(props.selectedDate).format('dddd')}</div>
                                <div style={{ backgroundColor: "#e0004d", color: "white", marginLeft: 8, width: 30, height: 30, borderRadius: 100, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <div>
                                        {moment(props.selectedDate).format('DD')}
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline" }}>
                        {/* <div style={{fontSize: 14, color: "grey"}}>{slotOption} and {viewOption} and {timeDivVal} </div> */}
                        <div style={{ fontSize: 14, color: "grey" }}>Slot size:</div>
                        <select
                            style={{ borderColor: "lightgrey", cursor: "pointer", marginRight: 16, marginLeft: 8 }}
                            value={slotOption}
                            onChange={(e) => {
                                setSlotOption(e.target.value);
                                localStorage.setItem("calenderSlotOption", e.target.value);
                            }}>
                            <option value={"quarter"} >{"15 Mins"}</option>
                            <option value={"half"} >{"30 Mins"}</option>
                            <option value={"hour"} >{"1 Hour"}</option>
                            <option value={"two"} >{"2 Hours"}</option>
                        </select>
                    </div>
                    {/* <div style={{backgroundColor: "lightblue", cursor: "pointer"}} onClick={e => scrollTo(myRef)}>
                        Scroll to
                    </div> */}
                    <div>
                        <select
                            style={{ borderColor: "lightgrey", cursor: "pointer" }}
                            value={viewOption}
                            onChange={(e) => {
                                setViewOption(e.target.value);
                                localStorage.setItem("calenderViewOption", e.target.value);
                                props.toggleView(e.target.value);
                            }}>
                            <option value={"day"} >{"Day"}</option>
                            <option value={"week"} >{"Week"}</option>
                        </select>
                    </div>
                </div>
                {viewOption === "week" && renderWeekHeader()}
            </div>
            {/* content */}
            <div key={viewOption}>
                {viewOption === "day" ? renderDaySlotRows() : renderWeekSlotRows()}
            </div>
        </div>
    )
}

export default CustomCalendarPanel

CustomCalendarPanel.defaultProps = {
    appointmentData: [],
    weekData: [{ "Mon": [], "Tue": [], "Wed": [], "Thu": [], "Fri": [], "Sat": [], "Sun": [] }],
    refreshList: () => { },
    autoOpen: () => { }
}
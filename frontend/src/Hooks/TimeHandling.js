//Instructions
//const testDate = new Date(); // this value is coming from db
// {moment(testDate).utc().format("h:mm A")} will show the global time i.e. utc
// {moment(testDate).format("h:mm A")} {moment(testDate).local().format("h:mm A")} will show local time i.e +5 for Pakistan, (our real time)

import moment from 'moment'

export function getSlot(time) {
    if (time !== null) {
        return moment.utc(time, "hh:mm A").local().format("LT");
    }
    else
        return "Invalid"
}
//Set Time
export function setTime(timeString) {
    if (timeString !== null) {
        return moment(timeString, "HH:mm").utc().format("LT");
    }
    else
        return "Invalid"
}
//Set Time
export function setSlot(time) {
    if (time !== null) {
        // moment(slotValue,"H:mm A").utc().format("H:mm A")
        return moment(time, "H:mm A").utc().format("LT");
    }
    else
        return "Invalid"
}

export function getTimeString(timeString) {
    if (timeString !== null) {
        return moment.utc(timeString, "hh:mm A").local().format("hh:mm A");
    }
    else
        return "Invalid"
}

export function getDatetoSet(time) {
    console.log(" my date is ", time)
    if (time !== null) {
        console.log(" my date is ", moment(time).format("YYYY-MM-DD"))
        return moment(time).format("YYYY-MM-DD");
    }
    else
        return "Invalid"
}

export function getDate(time) {
    if (time !== null) {
        return moment(time).local().format("Do MMM, YYYY");
    }
    else
        return "Invalid"
}

export function getTime(time) {
    if (time !== null) {
        return moment(time).local().format("hh:mm A")
    }
    else
        return "Invalid"
}

export function getDateTime(time) {
    if (time !== null) {
        let dateTime = getDate(time) + " " + moment(time).local().format("hh:mm A")
        return dateTime
    }
    else
        return "Invalid"
}

export function getDateOfBirth(time) {
    if (time !== null) {
        return moment().diff(time, "years")
    }
    else
        return "Invalid"
}

//  reference function calls of moment library
// console.log('setSLots valueee today: comparison time slot : \n',
// result[0].available_time_slots[0].time_slot, " and \n",
// moment(result[0].available_time_slots[0].time_slot, "HH:mm:ss").format("HH:mm"), " and \n",
// moment(result[0].available_time_slots[0].time_slot, "HH:mm:ss").local().format("HH:mm"), " and \n",
// moment(result[0].available_time_slots[0].time_slot, "HH:mm:ss").utc().format("HH:mm"), " and \n utc formats \n",
// moment.utc(result[0].available_time_slots[0].time_slot, "HH:mm:ss").format("HH:mm"), " and \n",
// moment(new Date()).utc().format("HH:mm"), " \n ",
// moment(new Date()).format("HH:mm"), " \n ",
// moment.utc(result[0].available_time_slots[0].time_slot, "HH:mm:ss").local().format("HH:mm"), " and \n current time \n",
// )
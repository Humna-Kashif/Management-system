import React, { useContext, useEffect, useState } from 'react'
import { availableSlotsAPI } from '../Hooks/API'
import { Divider } from "@material-ui/core";
import Button from '@material-ui/core/Button';
import AccessTimeTwoToneIcon from '@material-ui/icons/AccessTimeTwoTone';
import '../Styles/PatientProfileHeader.css';
import { getDatetoSet, getSlot } from '../Hooks/TimeHandling';
import moment from 'moment';
import { GlobalContext } from '../Context/GlobalState';

const AvailableSlots = (props) => {

    const {elementDocId} = useContext(GlobalContext)
    const [slots, setSlots] = useState([]);
    const [slotList, setSlotList] = useState([])

    const Listings = (dataArray) => {
        const slotArray = [];
        dataArray.map((item, i) => {
            slotArray.push({
                key: i,
                slot: getSlot(item.time_slot)
            })
        })
        return slotArray;
    }

    const availableSlots = (location_id, date) => {
        console.log("setSLots valueee Date comparison ", moment(date).format("DD MM YYYY, hh:mm A"), moment(new Date()).utc().format("HH:mm"))
        const newdate = getDatetoSet(date);
        console.log("my date is ", newdate)
        availableSlotsAPI(elementDocId, location_id, "PUT", newdate).then((result) => {
            console.log("available", result);
            if (!!result[0] && !!result[0].available_time_slots) {
                if (moment(date).format("DD MM YYYY") === moment(new Date()).format("DD MM YYYY")) { //if today is selected
                    let filteredSlots = result[0].available_time_slots.filter(s => moment.utc(s.time_slot, "HH:mm:ss").local().format("HH:mm") >= moment(new Date()).format("HH:mm"))
                    setSlots(filteredSlots);
                    console.log('setSLots valueee today', slots, result[0].available_time_slots, "filtered", filteredSlots)
                    const slotsCopy = [...filteredSlots];
                    setSlotList(Listings(slotsCopy))
                    console.log('Slotssss results are:', Listings(slotsCopy))
                    setSlotList(...filteredSlots)

                } else {
                    setSlots(result[0].available_time_slots);
                    console.log('setSLots valueee', slots, result[0].available_time_slots)
                    const slotsCopy = [...result[0].available_time_slots];
                    setSlotList(Listings(slotsCopy))
                    console.log('Slotssss results are:', Listings(slotsCopy))
                    setSlotList(...result[0].available_time_slots)
                }
            }
        });
    };

    const renderAvailableSlots = () => {
        return (
            <div style={{ flexDirection: "row", flexWrap: "wrap" }} className='ModalSlots'>
                <div className='SlotsHead'>
                    <b> Available Slots </b>
                    {/* <Radio.Group onChange={e => setSlotTime(e.target.value)} defaultValue="AM" size='small'>
                    <Radio.Button value="AM"> AM</Radio.Button>
                    <Radio.Button value="PM">PM</Radio.Button>
                </Radio.Group> */}
                </div>
                <Divider className='AppointmentDivder' />
                {/* {slotTime === "AM" ? 
                    slotTime === "AM" !== '' ?
                    slotList.filter(item => item.slot.includes("AM")).map((filteredName,i) => (
                        <Button
                            key={i}
                            variant="contained"
                            color="default"
                            className='SlotsInput'
                            onClick={() => props.returnTimeSlot(filteredName.slot)}
                            startIcon={<AccessTimeTwoToneIcon/>}
                        >
                            {filteredName.slot}
                        </Button>
                        // <input
                        //     key={i}
                        //     className='SlotsInput'
                        //     onClick={() => props.returnTimeSlot(filteredName.slot)}
                        //     type="button"
                        //     value={filteredName.slot}
                        // ></input>
                    )) : 'No Morning Slots Available'
                : 
                slotTime === "PM".length !== 0 ?
                    slotList.filter(item => item.slot.includes("PM")).map((filteredName,i) => (
                        <Button
                            key={i}
                            variant="contained"
                            color="default"
                            className='MuiButton-contained{'
                            onClick={() => props.returnTimeSlot(filteredName.slot)}
                            startIcon={<AccessTimeTwoToneIcon/>}
                        >
                            {filteredName.slot}
                        </Button>
                    )) : 'No Evening Slots Available'
                } */}

                {!!slots && slots.map((item, i) => (
                    <Button
                        key={i}
                        variant="contained"
                        color="default"
                        className='MuiButton-contained{'
                        onClick={() => { props.returnTimeSlot(getSlot(item.time_slot)); }}
                        startIcon={<AccessTimeTwoToneIcon />}
                    >
                        {getSlot(item.time_slot)}
                    </Button>
                    // <input key={i}
                    //     className='SlotsInput'
                    //     onClick={() => props.returnTimeSlot(getSlot(item.time_slot))}
                    //     type="button"
                    //     value={getSlot(item.time_slot)}
                    // ></input>
                ))}
                {!!slots && slots.length === 0 &&
                    (props.date === "" ?
                        <div>Select date to show slots</div>
                        :
                        <div>Slots not available</div>
                    )
                }

            </div>
        );
    };

    useEffect(() => {
        if (props.locationID !== '' && props.date !== '')
            availableSlots(props.locationID, props.date);

    }, [props.locationID, props.date]);

    return (
        <div className='SelectBox'>
            {renderAvailableSlots()}
        </div>
    )
}

export default AvailableSlots

AvailableSlots.defaultProps = {
    locationID: "",
    date: ""
}
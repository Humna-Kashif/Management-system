import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { Form, Input, message, TimePicker, Select } from 'antd';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import DialogTitle from '@material-ui/core/DialogTitle';
import CheckBoxOutlineBlankRoundedIcon from '@material-ui/icons/CheckBoxOutlineBlankRounded';
import StopRoundedIcon from '@material-ui/icons/StopRounded';
import AsyncSelect from 'react-select/async';
import { addLocationAPI, searchLocationsAPI, locationsAPI, searchHospitals } from '../../Hooks/API';
import AppointmentMethods from '../AppointmentMethods';
import moment from 'moment';
import { setTime, getTimeString } from '../../Hooks/TimeHandling'
const { Option } = Select;
const { RangePicker } = TimePicker;

const AddLocations = (props) => {
    const doc_Id = useLocation().state.userId;
    const [data, setData] = useState([]);
    const [hospData, setHospData] = useState([]);
    const [searchHospList, setSearchHospList] = useState([]);
    const [open, setOpen] = useState(false);
    const [locations, setLocations] = useState([]);
    const [selectedValue, setSelectedValue] = useState("");
    const [selectedHosp, setSelectedHosp] = useState("");
    const [locList, setLocList] = useState([]);
    const [searchLocList, setSearchLocList] = useState([]);
    const [feeValue, setFeeValue] = useState('');
    const [error, setError] = useState(false);
    const [appointmentTypeValue, setAppointmentTypeValue] = useState('');
    const [indeterminate, setIndeterminate] = useState(true);
    const [checkAll, setCheckAll] = useState(false);
    const [plainOptions, setPlainOptions] = useState([
        { day_of_week: "monday", is_open: false, start_time: '', end_time: '' },
        { day_of_week: "tuesday", is_open: false, start_time: '', end_time: '' },
        { day_of_week: "wednesday", is_open: false, start_time: '', end_time: '' },
        { day_of_week: "thursday", is_open: false, start_time: '', end_time: '' },
        { day_of_week: "friday", is_open: false, start_time: '', end_time: '' },
        { day_of_week: "saturday", is_open: false, start_time: '', end_time: '' },
        { day_of_week: "sunday", is_open: false, start_time: '', end_time: '' }
    ]);
    //
    function onChangeLoc(value) {
        console.log(`selected ${value}`);
    }

    const resetModal = () => {
        console.log("Inside reset modal ");
        setPlainOptions([
            { day_of_week: "monday", is_open: false, start_time: '', end_time: '' },
            { day_of_week: "tuesday", is_open: false, start_time: '', end_time: '' },
            { day_of_week: "wednesday", is_open: false, start_time: '', end_time: '' },
            { day_of_week: "thursday", is_open: false, start_time: '', end_time: '' },
            { day_of_week: "friday", is_open: false, start_time: '', end_time: '' },
            { day_of_week: "saturday", is_open: false, start_time: '', end_time: '' },
            { day_of_week: "sunday", is_open: false, start_time: '', end_time: '' }
        ]);
        setSelectedValue("");
        setFeeValue("");
        setAppointmentTypeValue("");
        setCheckAll(false);
        // setError(false);
        setIndeterminate(false);
    }

    //Selecting All Time SLot
    const rangeAll = (time, timeString) => {
        console.log('time All,', 'Chosen Time', timeString[0], 'Set Time', setTime(timeString[0]), 'Get Time', getTimeString(timeString[0]), timeString[1], setTime(timeString[1]))
        let tempArray = [];
        if (checkAll) {
            plainOptions.forEach((item) => {
                item.start_time = setTime(timeString[0])
                item.end_time = setTime(timeString[1])
                return tempArray.push(item);
            });

            setPlainOptions(tempArray);
            console.log('Temp Araay value is', tempArray)
        }

    }
    //Set Individual Range
    const onRangeChange = (dayValue, timeString) => {
        console.log(dayValue, timeString[0], timeString[1]);
        // console.log('Time value is',timeString[0], timeString[1])

        let days = []
        plainOptions.forEach(day => {
            if (day.day_of_week === dayValue) {
                day.start_time = setTime(timeString[0])
                day.end_time = setTime(timeString[1])

            }
            return days.push(day);
        })
        setPlainOptions(days)
        console.log('Dayss ', days)
    }

    //Dialog Functions
    const handleClose = () => {
        setOpen(false);
        resetModal();
    };

    //On Adding
    const success = () => {
        message.loading('Adding Location', 1.5)
            .then(() => message.success('Location Added Successfully', 2.5))
    };

    const handleAddLocation = () => {
        addLocationAPI(doc_Id, "POST", selectedValue, feeValue, appointmentTypeValue, plainOptions).then(result => {
            // setError(true)
            setOpen(false);
            props.hide();
            console.log("Add location Success", result);
            success();
            props.refreshList();

        });
    }

    //onClickedAgree
    const handleAgree = () => {
        console.log("Adding New Location : ", doc_Id, selectedValue, feeValue, appointmentTypeValue, plainOptions, props.LocationsData)
        let count = 0;
        if (props.LocationsData.length !== 0) {
            for (let i = 0; i < props.LocationsData.length; i++) {
                if (props.LocationsData[i].location === selectedValue) {
                    count++;
                }
            }
            count === 1 ? message.error("Failed! Location Already Exsist") :
                count === 0 ? selectedValue !== "" ?
                    handleAddLocation() :
                    console.error("Failed! null value error") :
                    console.error("Failed! Invalid call")

        }
        else {
            handleAddLocation();
        }
        setOpen(false);
        props.hide();
    }
    //Selecting All Days
    const chooseAllDays = (e) => {
        let tempArray = [];
        plainOptions.forEach((item) => {
            item.is_open = e.target.checked;
            return tempArray.push(item);
        });
        console.log('Choose All Value is', tempArray)
        if (e.target.checked) {
            setCheckAll(true)
        }
        else setCheckAll(false)

        setIndeterminate(false)
        setPlainOptions(tempArray);
    }
    //On Select Custom Days
    const onChangeCheck = (e) => {
        let days = []
        plainOptions.forEach(day => {
            if (day.day_of_week === e.target.value) {
                day.is_open = e.target.checked

            }
            return days.push(day);
        })
        setIndeterminate(true)
        setCheckAll(false)
        setPlainOptions(days)
        console.log('Daysss are : ', days)
    };

    //Adding Location Button
    const setTempLocation = () => {
        let regex = /^\s$/;
        if (
            (selectedValue !== "") &&
            (plainOptions.some(list => list.is_open == true)) &&
            (plainOptions.some(list => list.start_time !== '')) &&
            (plainOptions.some(list => list.end_time !== '')) &&
            (appointmentTypeValue !== "")
            &&
            (feeValue !== "" && !feeValue.match(regex))
        ) {
            setOpen(true)
        }
        else {
            message.error('Please select all the fields')
        }

    }

    const formattedSearchList = () => {
        let formattedList = [];
        !!(searchLocList) && (
            searchLocList.map((item) => {
                console.log("Loop");
                return formattedList.push({
                    value: item.location_id, label: item.name
                });
            })
        );
        console.log("Formatted list: ", formattedList);
        return formattedList;
    }

    const loadOptions = (inputValue, callback) => {
        setTimeout(() => {
            callback(formattedSearchList());
        }, 1000);
        locationsAPI(doc_Id).then(result => {
            console.log('Already Added Locations are: ', result)
            setLocations(result);
        });
    };

    const formattedHospSearchList = () => {
        console.log("search results are ", searchHospList);
        let formattedList = [];
        !!(searchHospList) && (
            searchHospList.map((item) => {
                console.log("Loop");
                return formattedList.push({
                    value: item.hospital_id,
                    label: item.name,
                    locations: item.locations

                });
            })
        );
        console.log("Formatted list hospitals are: ", formattedList);
        return formattedList;
    }
    const loadHospOptions = (inputValue, callback) => {
        console.log("search results are loadoptions ", searchHospList);
        setTimeout(() => {
            callback(formattedHospSearchList());
        }, 1000);

    };
    const handleInputChange = value => {
        console.log("selected values is ", value)
        const inValue = value;
        if (inValue !== '') {
            searchLocationsAPI(doc_Id, inValue).then((data) => {
                console.log('This is search location data:', data);
                setSearchLocList(data);
                setData(data)
            })
                .catch((error) => console.error(error))
                .finally(() => loadOptions);
        }
    };

    const handleInputValChange = value => {
        console.log("selected values is ", value)
        const inValue = value;
        if (inValue !== '') {
            searchHospitals(doc_Id, inValue).then((data) => {
                console.log('This is search hospital data:', data);
                setSearchHospList(data);
                setHospData(data);
            })
                .catch((error) => console.error(error))
                .finally(() => loadHospOptions);
        }
    };

    const handleChange = (value) => {
        console.log("Value chossen is", value)
        setSelectedValue(value);
        // if (locations.some(list => list.location === value.label)){
        //     message
        //     .error('Please select a unique location',2.5);
        //     props.hide()

        // }  
        // else{
        //     console.log('unique location')
        //     setSelectedValue(value);
        // }
    }
    const handleChangeHosp = (value) => {
        console.log("Value chossen is", value.label, value, value.locations)
        setSelectedHosp(value)
        setLocList(value.locations)
        // if (locations.some(list => list.location === value.label)){
        //     message
        //     .error('Please select a unique location',2.5);
        //     props.hide()

        // }  
        // else{
        //     console.log('unique location')
        //     setSelectedValue(value);
        // }
    }
    return (
        <Modal
            show={props.show}
            onHide={() => {
                props.hide();
                resetModal();
            }}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
            <Modal.Header closeButton>
                <Modal.Title className='ModalTitle'>
                    Add New Location
                </Modal.Title>
            </Modal.Header>
            <Form>
                <Modal.Body>
                    <Row>
                        <Col lg='4' className='SectionList'>
                            <label> Select Hospital: </label>
                        </Col>
                        <Col lg='7' className='SectionInfo'>
                            <Form.Item name={'Hospital'} rules={[{ required: true }]}>
                                <AsyncSelect
                                    className='LocationSelect'
                                    placeholder={data.name}
                                    cacheOptions
                                    defaultOptions
                                    value={selectedHosp}
                                    onInputChange={handleInputValChange}
                                    loadOptions={loadHospOptions}
                                    onChange={value => handleChangeHosp(value)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='4' className='SectionList'>
                            <label> Select Locations: </label>
                        </Col>
                        <Col lg='7' className='SectionInfo'>
                            <Form.Item name={'Location'} rules={[{ required: true }]}>
                                <Select
                                    showSearch
                                    style={{ width: '100%' }}
                                    placeholder="Select Location"
                                    optionFilterProp="children"
                                    onChange={handleChange}
                                    value={selectedValue}
                                    // onFocus={onFocus}
                                    // onBlur={onBlur}
                                    // onSearch={onSearch}
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {/* <Option value="jack">Jack</Option> */}
                                    {locList.map((item, i) => (
                                        <Option value={item.name} key={item.location_id}>
                                            {item.name}
                                        </Option>))
                                    }


                                </Select>
                                {/* <AsyncSelect 
                            className='LocationSelect mtt-min-9'
                            placeholder={data.location}
                            // cacheOptions
                            defaultOptions
                            value={selectedValue}
                            loadOptions={loadOptions}
                            onInputChange={handleInputChange}
                            onChange={value => handleChange(value)}
                        /> */}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg='4' className='SectionList'>
                            <label> Fee: </label>
                        </Col>
                        <Col lg='7' className='SectionInfo'>
                            <Form.Item name={'Fee'} rules={[{ required: true, whitespace: true }]}>
                                <Input
                                    className='EditInput'
                                    placeholder="Fee"
                                    type="text"
                                    value={feeValue}
                                    noValidate
                                    onChange={e => setFeeValue(e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <FormGroup>
                        <Row>
                            <Col lg='4' className='SectionList'>
                                <label> Working Hours : </label>
                            </Col>
                            <Col lg='3' className='SectionInfo'>
                                <FormControlLabel
                                    control={
                                        <Checkbox icon={<CheckBoxOutlineBlankRoundedIcon />}
                                            checkedIcon={<StopRoundedIcon />}
                                            name="Days"
                                            onChange={e => chooseAllDays(e)}
                                            value="checkedall"
                                            indeterminate={indeterminate}
                                        />
                                    }
                                    label="Choose All"
                                />
                            </Col>
                            <Col lg='4' className='SectionInfo'>
                                {checkAll &&
                                    <TimePicker.RangePicker
                                        use12Hours format="HH:mm"
                                        minuteStep={30}
                                        onChange={rangeAll}
                                        getPopupContainer={trigger => trigger.parentNode} />
                                        
                                        }
                            </Col>
                        </Row>

                        <br />
                        {plainOptions.map((item, i) => {
                            return (
                                <Row key={i}>
                                    <Col lg='4' className='SectionList'>
                                    </Col>
                                    <Col lg='3' className='SectionInfo'>
                                        <FormControlLabel
                                            control={<Checkbox icon={<CheckBoxOutlineBlankRoundedIcon />} checked={item.is_open} checkedIcon={<StopRoundedIcon />} value={item.day_of_week} onChange={e => onChangeCheck(e)} />}
                                            label={item.day_of_week}
                                        />
                                    </Col>
                                    <Col lg='4' className='SectionInfo' key={item.start_time}>
                                        {item.is_open == false || checkAll ? '' :
                                            //  <div style={{display:'flex'}}>
                                            //     <TimePicker
                                            //         format="HH:mm"
                                            //         showNow={false}
                                            //         value={moment(selectedStartTime, "HH:mm")}
                                            //         onSelect={(value) => {
                                            //         const timeString = moment(value).format("HH:mm");
                                            //         setSelectedStartTime(timeString)
                                            //     }} />

                                            //     <TimePicker
                                            //         format="HH:mm"
                                            //         showNow={false}
                                            //         value={moment(selectedEndTime, "HH:mm")}
                                            //         onSelect={(value) => {
                                            //         const timeString = moment(value).format("HH:mm");
                                            //         setSelectedEndTime(timeString)
                                            //         onRangeChange(item.day_of_week)
                                            //     }} />
                                            //  </div>
                                            <RangePicker
                                                getPopupContainer={trigger => trigger.parentNode}
                                                allowClear={false}
                                                onChange={(time, timeString) => {
                                                    console.log(timeString)
                                                    onRangeChange(item.day_of_week, timeString)
                                                }}
                                                // popupStyle
                                                // value={moment(selectedEndTime, "HH:mm")}
                                                // onBlur={(value) => {

                                                //     const timeString = moment(value).format("HH:mm");
                                                //     onRangeChange(item.day_of_week, timeString)
                                                //     // setSelectedTime(timeString);
                                                //     console.log(timeString);
                                                // }} 
                                                // value={moment(selectedTime, "HH:mm")}
                                                minuteStep={30}
                                                picker="hours"
                                                Footer={null}
                                                use12Hours
                                                format="HH:mm"
                                                defaultValue={item.start_time !== '' &&
                                                    [moment.utc(item.start_time, "HH:mm A").local(),
                                                    moment.utc(item.end_time, "HH:mm A").local()]} />

                                        }
                                    </Col>
                                </Row>
                            )
                        })}
                    </FormGroup>
                    <Row>

                        <Col lg='4' className='SectionList'>
                            <label>Treatment Method: </label>
                        </Col>
                        <Col lg='7' className='SectionInfo'>
                            <AppointmentMethods displayMode={"set"} methodsValue={appointmentTypeValue} returnHook={setAppointmentTypeValue} style={{ justifyContent: "flex-start", color: "#000000" }} />
                        </Col>
                    </Row>

                </Modal.Body>
                <Modal.Footer>
                    <Form.Item >
                        <Button variant="outline-secondary" onClick={() => {
                            props.hide();
                            resetModal();
                        }} style={{ marginRight: "10px" }}>
                            Cancel
                        </Button>
                    </Form.Item >
                    <Form.Item>
                        <Button variant="primary" type='submit' onClick={setTempLocation}>
                            Add Location
                        </Button>
                    </Form.Item>
                </Modal.Footer>
            </Form>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title">
                <DialogTitle id="responsive-dialog-title">{"Are you sure you want to add this location?"}</DialogTitle>
                <DialogActions>
                    <Button autoFocus onClick={() => { handleClose() }} color="default">
                        Cancel
                    </Button>
                    <Button onClick={() => {
                        handleAgree();
                        resetModal();
                    }}
                        // disabled={error} 
                        color="primary"
                        autoFocus>
                        Okay
                    </Button>
                </DialogActions>
            </Dialog>
        </Modal>

    )
}



export default AddLocations
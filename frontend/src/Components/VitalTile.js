import React, { useState, useContext } from "react"
import moment from 'moment'
import { Input, Radio, message } from 'antd'
import EditIcon from '@material-ui/icons/Edit';
import { Col, Row } from "react-bootstrap";
import { addVitalAPI, EditVitalAPI } from '../Hooks/API'
import { GlobalContext } from "../Context/GlobalState"
import { Fragment } from "react";


const VitalTile = (props) => {
    const { accountId,elementDocId } = useContext(GlobalContext)
    const data = props.itemData;
    const iconsList = props.icons;
    const pat_ID = props.patientID;
    console.log('Vital Tile data is', data)
    console.log("Patient info ", pat_ID);
    const [showRescheduleModal, setRescheduleModal] = useState(false);
    const [vitalValue, setVitalValue] = useState("");
    const [vitalVal, setVitalVal] = useState([]);
    const [contentEditable, setContenteditable] = useState(false);
    const [contentAddable, setContentAddable] = useState(false);
    const [heightValue, setHeightValue] = useState('')
    const [weightValue, setWeightValue] = useState('')
    const [tempValue, setTempValue] = useState('')
    const [rateValue, setRateValue] = useState('')
    const [bmiValue, setBMIValue] = useState('')
    const [sugarValue, setSugarValue] = useState('')
    const [sugarRandom, setSugarRandom] = useState('')
    const [bpValue, setBpValue] = useState('')
    const [sugarType, setSugarType] = useState('');
    const [sugarInput, setSugarInput] = useState(false);
    const vitalsList = [
        {
            vital_id: 1,
            new_value: heightValue
        },
        {
            vital_id: 2,
            new_value: weightValue
        },
        {
            vital_id: 3,
            new_value: bpValue
        }
        , {
            vital_id: 4,
            new_value: rateValue
        },
        {
            vital_id: 5,
            new_value: tempValue
        },
        {
            vital_id: 6,
            new_value: bmiValue
        },
        {
            vital_id: 7,
            new_value: sugarValue + sugarType
        },

    ]
    const formatVitalList = () => {
        let tempList = [];
        vitalsList.map((item) => {
            if (item.new_value !== 0 && item.new_value !== "") {
                tempList.push(item)
            }
        })
        setVitalVal(tempList)
        return tempList;

    }

    const addVitals = (patient_id) => {
        console.log('Adding Vital Values', formatVitalList())
        addVitalAPI(elementDocId, patient_id, "POST", formatVitalList()).then(result => {
            console.log(" Vital Success", result);
            message.success('Vitals added succesfully')
            props.onCallBAck()
        });
    }
    const EditVital = (patient_id, vital_id, value) => {
        EditVitalAPI(elementDocId, patient_id, vital_id, value).then(result => {
            console.log(" Vital Success", result);
            message.success('Vitals updated succesfully')
            props.onCallBAck()
        });
    }
    const EditSugarVital = (patient_id, vital_id, value) => {
        if (value !== "") {
            EditVitalAPI(elementDocId, patient_id, vital_id, value + sugarType).then(result => {
                console.log(" Vital Success", result);
                message.success('Vitals updated succesfully')
                setSugarInput(false)
                setContenteditable(false)
                props.onCallBAck()
            });

        }
        else {
            message.error('please enter a value or press Esc')
        }
    }

    const handleEditable = () => {
        setContenteditable(true)
    }
    return (
        <div className={props.selected ? 'VitalsSelectedCard' : 'VitalsCard'} onClick={() => props.onTileSelect(data.vital_id)}>
            <div className='VitalInfo'>
                <Row>
                    <Col lg='4' md='4' sm='4'>
                        <div className='VitalImg'>
                            <img className='VitalImgIcon' src={
                                data.vital_id === 1 ? iconsList[0].icon : 
                                data.vital_id === 2 ? iconsList[1].icon : 
                                data.vital_id === 3 ? iconsList[2].icon : 
                                data.vital_id === 4 ? iconsList[3].icon : 
                                data.vital_id === 5 ? iconsList[4].icon :
                                data.vital_id === 6 ? iconsList[5].icon : 
                                data.vital_id === 7 ? iconsList[6].icon :
                                data.vital_id === 8 ? iconsList[6].icon : ""} />

                        </div>
                    </Col>
                    <Col lg='8' md='8' sm='8'>
                        {contentEditable && data.vital_id !== 7 ?
                            <Input defaultValue={data.vital_current[0].current_value}
                                onChange={e => setVitalValue(e.target.value)}
                                onKeyUp={e => {
                                    if (e.key === 'Escape') {
                                        setContenteditable(false);
                                    }
                                    if (e.key === 'Enter') {
                                        setContenteditable(false)
                                        EditVital(pat_ID, data.vital_current[0].patient_vital_id, vitalValue)
                                    }
                                }} /> :
                            data.vital_id === 7 && contentEditable ?
                                <Fragment>
                                    <Radio.Group style={{ marginLeft: '10px' }} className={sugarInput ? 'dp-none' : ''} size="small" buttonStyle="solid" onChange={e => { setSugarType(e.target.value); setSugarInput(true); console.log('Sugar Type', e.target.value) }}>
                                        <Radio.Button value="(G)">Gen.</Radio.Button>
                                        <Radio.Button value="(F)">Fast</Radio.Button>
                                    </Radio.Group>
                                    {sugarType &&
                                        <Input
                                            className={(sugarType && sugarInput === true) ? 'EditInput' : 'dp-none'}
                                            placeholder={`Enter ${data.vital_info.name} value ...`}
                                            type="text"
                                            defaultValue={data.vital_current[0].current_value.split('(')[0]}
                                            onKeyUp={e => {
                                                if (e.key === 'Escape') {
                                                    setContenteditable(false);
                                                    setSugarInput(false)
                                                }
                                                if (e.key === 'Enter') {
                                                    EditSugarVital(pat_ID, data.vital_current[0].patient_vital_id, vitalValue)
                                                }
                                            }}
                                            noValidate
                                            onChange={e => setVitalValue(e.target.value)} />
                                    } </Fragment> :
                                contentAddable ?
                                    <Fragment>
                                        {data.vital_id === 1 ?
                                            <Input
                                                className='EditInput'
                                                placeholder={`Enter ${data.vital_info.name} value ...`}
                                                type="text"
                                                value={heightValue}
                                                onKeyUp={e => {
                                                    if (e.key === 'Escape') {
                                                        setContentAddable(false);
                                                    }
                                                    if (e.key === 'Enter') {
                                                        setContentAddable(false)
                                                        addVitals(pat_ID)
                                                    }
                                                }}
                                                noValidate
                                                onChange={e => { setHeightValue(e.target.value) }} />
                                            :
                                            data.vital_id === 2 ?
                                                <Input
                                                    className='EditInput'
                                                    placeholder={`Enter ${data.vital_info.name} value ...`}
                                                    type="text"
                                                    value={weightValue}
                                                    onKeyUp={e => {
                                                        if (e.key === 'Escape') {
                                                            setContentAddable(false);
                                                        }
                                                        if (e.key === 'Enter') {
                                                            setContentAddable(false)
                                                            addVitals(pat_ID)
                                                        }
                                                    }}
                                                    noValidate
                                                    onChange={e => { setWeightValue(e.target.value) }} />
                                                :
                                                data.vital_id === 3 ?
                                                    <Input
                                                        className='EditInput'
                                                        placeholder={`Enter ${data.vital_info.name} value ...`}
                                                        type="text"
                                                        value={bpValue}
                                                        onKeyUp={e => {
                                                            if (e.key === 'Escape') {
                                                                setContentAddable(false);
                                                            }
                                                            if (e.key === 'Enter') {
                                                                setContentAddable(false)
                                                                addVitals(pat_ID)
                                                            }
                                                        }}
                                                        noValidate
                                                        onChange={e => { setBpValue(e.target.value) }} />
                                                    :
                                                    data.vital_id === 4 ?
                                                        <Input
                                                            className='EditInput'
                                                            placeholder={`Enter ${data.vital_info.name} value ...`}
                                                            type="text"
                                                            value={rateValue}
                                                            onKeyUp={e => {
                                                                if (e.key === 'Escape') {
                                                                    setContentAddable(false);
                                                                }
                                                                if (e.key === 'Enter') {
                                                                    setContentAddable(false)
                                                                    addVitals(pat_ID)
                                                                }
                                                            }}
                                                            noValidate
                                                            onChange={e => { setRateValue(e.target.value) }} />
                                                        :
                                                        data.vital_id === 5 ?
                                                            <Input
                                                                className='EditInput'
                                                                placeholder={`Enter ${data.vital_info.name} value ...`}
                                                                type="text"
                                                                value={tempValue}
                                                                noValidate
                                                                onKeyUp={e => {
                                                                    if (e.key === 'Escape') {
                                                                        setContentAddable(false);
                                                                    }
                                                                    if (e.key === 'Enter') {
                                                                        setContentAddable(false)
                                                                        addVitals(pat_ID)
                                                                    }
                                                                }}
                                                                onChange={e => { setTempValue(e.target.value) }}

                                                            />
                                                            :
                                                            data.vital_id === 7 ?
                                                                <Fragment>
                                                                    <Radio.Group style={{ marginLeft: '10px' }} className={sugarInput ? 'dp-none' : ''} size="small" buttonStyle="solid" onChange={e => { setSugarType(e.target.value); setSugarInput(true); console.log('Sugar Type', e.target.value) }}>
                                                                        <Radio.Button value="(G)">Gen.</Radio.Button>
                                                                        <Radio.Button value="(F)">Fast</Radio.Button>
                                                                    </Radio.Group>
                                                                    {sugarType &&
                                                                        <Input
                                                                            className={(sugarType && sugarInput === true) ? 'EditInput' : 'dp-none'}
                                                                            placeholder={`Enter ${data.vital_info.name} value ...`}
                                                                            type="text"
                                                                            value={sugarValue}
                                                                            onKeyUp={e => {
                                                                                if (e.key === 'Escape') {
                                                                                    setSugarInput(false)
                                                                                    setContentAddable(false);
                                                                                }
                                                                                if (e.key === 'Enter') {
                                                                                    setContentAddable(false)
                                                                                    setSugarInput(false)
                                                                                    addVitals(pat_ID)
                                                                                }
                                                                            }}
                                                                            noValidate
                                                                            onChange={e => { setSugarValue(e.target.value) }} />
                                                                    } </Fragment>
                                                                :

                                                                ''}
                                    </Fragment>
                                    :

                                    <h6 className='VitalValue'>
                                        {
                                            (!!data.vital_current && data.vital_current[0] && data.vital_id !== 6) ?
                                                data.vital_current[0].current_value : data.vital_id === 6 ? props.bmi !== "NaN" ? props.bmi : 'No Data' : 'Not Added'
                                        }
                                        <sup className='VitalUnit'>
                                            {!!data.vital_current ?
                                                (data.vital_info.unit === 'kg/msq' ?
                                                    <span> kg/m <sup> 2</sup> </span>
                                                    :
                                                    data.vital_info.unit)
                                                : ''}
                                        </sup>
                                        {
                                            (!!data.vital_id && data.vital_id === 1) ?
                                                !!data.vital_current &&
                                                <span>
                                                    <span style={{ color: '#bababa' }}> |  </span>
                                                    {Math.floor(data.vital_current[0].current_value * 0.03)}'
                                                    {(data.vital_current[0].current_value * 0.03).toString().slice(2, 3)}
                                                    <sup className='VitalUnit'>ft </sup>
                                                </span>
                                                :
                                                (!!data.vital_id && data.vital_id === 2) ?
                                                    !!data.vital_current &&
                                                    <span> <span style={{ color: '#bababa' }}> |  </span>
                                                        {!!data.vital_current[0].current_value && (data.vital_current[0].current_value * 2.2).toString().slice(0, 3)} <sup className='VitalUnit'> lb </sup></span>
                                                    :
                                                    ''}
                                    </h6>
                        }
                        <div style={{ fontWeight: "bolder", color: "#e0004d", textAlign: "right", top: -5, right: 5, position: "absolute" }}>
                            {(!!data.vital_current && data.vital_current !== null && data.vital_id !== 6 && contentEditable === false && contentAddable === false) ?
                                <span className='VitalEditBtn' >
                                    <EditIcon onClick={handleEditable} />
                                </span> : ''
                            }
                        </div>
                        <h6 className='VitalName'>{data.vital_info.name}</h6>
                        <label className='VitalMoment'>
                            {!!data.vital_current && data.vital_current[0] && data.vital_id !== 6 ? moment(data.vital_current[0].date_time).format('Do MMM, YYYY') : ""}
                        </label>
                    </Col>
                </Row>


            </div>
            {(!!data.vital_id && data.vital_id !== 6) && <div style={{ fontWeight: "bolder", fontSize: 20, color: "#e0004d", textAlign: "right", bottom: 0, right: 5, position: "absolute" }}>
                <span className='VitalAddBtn'
                    onClick={() =>
                        // (e) => {  e.stopPropagation(); }
                        setContentAddable(true)
                    }>
                    +</span>

            </div>}

        </div>
    )
}
export default VitalTile

VitalTile.defaultProps = {
    vitalData: {
        title: "Title"
    }
}

const styles = {
    label: { fontSize: 14, textAlign: "Left", marginRight: 10, marginLeft: '10px', marginBottom: '0px', },
    display_value: { textAlign: "left", display: "flex", flex: 1 },
    about_row: { alignItems: "center", padding: 8, minHeight: 40, margin: 0, display: "flex", flex: 1, flexDirection: "row" },
    text_area: {
        fontSize: 14,
        paddingLeft: 8,
        paddingRight: 8,
        borderRadius: "5px",
        outline: "none",
        border: "1px solid #cfcfcf",
        boxShadow: "0px 5px 25px whitesmoke",
        backgroundColor: "whitesmoke",
        width: "100%"
    },
    input: { fontSize: 14, padding: 8, borderRadius: "5px" },

}
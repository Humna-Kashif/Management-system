import React, { useEffect,useState  } from 'react';
import InpersonIcon from '../Styles/Assets/heart.png'
import TelehealthIcon from '../Styles/Assets/doctor.png';
import {Radio,Form} from 'antd';
import '../Styles/DocProfile.css';

const defaultStyles = { styles: { display: "flex", flexDirection: "row", justifyContent: "center" } }

const AppointmentMethods = (props) => {

    const methodsValue = props.methodsValue;
    const displayMode = props.displayMode;
    const [handleTypeError, setHandleTypeError] = useState(false);
    const [inpersonVal, setInpersonVal] = useState(methodsValue === "inperson" || methodsValue === "both");
    const [telehealthVal, setTelehealthVal] = useState(methodsValue === "telehealth" || methodsValue === "both");
    // const [methodChoice, setMethodChoice] = useState(methodsValue==="both" ? "": methodsValue);
    const [methodChoice, setMethodChoice] = useState('');

    useEffect(() => {
        if (displayMode === 'choice') {
            let defaultChoice = '' ;
            props.methodsChoice === "both" ? defaultChoice = 'inperson' : defaultChoice = props.methodsChoice
            console.log('Method Choice Value is', methodChoice, 'prop is' , props.methodsChoice  )
            setMethodChoice(defaultChoice)
            props.returnHook (defaultChoice)
        }
    }, [props.methodsChoice, props.methodsValue])

    useEffect(() => {
        if (displayMode === 'set') {
            props.returnHook (methodsValue)
        }
    }, [props.methodsValue])

    const renderView = () => {
        return methodsValue === "both" ? (
            <div style={{ ...defaultStyles.styles, ...props.style }}>
                <div style={{ width: 160, display: "flex", justifyContent: "flex-start" }}>
                    <label className='TreatmentLabel'>
                        <img src={InpersonIcon} className='TreatmentImg' /> In Person
                    </label>
                </div>
                <div style={{ width: 160, display: "flex", justifyContent: "flex-start" }}>
                    <label className='TreatmentLabel'>
                        <img src={TelehealthIcon} className='TreatmentImg' /> TeleHealth
                    </label>
                </div>
            </div>
        ) : (
            <div style={{ ...defaultStyles.styles, ...props.style }}>
                <label className='TreatmentLabel'>
                    {methodsValue === "inperson" && <img
                        src={InpersonIcon}
                        className='TreatmentImg' />}
                    {methodsValue === "telehealth" && <img
                        src={TelehealthIcon}
                        className='TreatmentImg' />}
                    {methodsValue === "inperson" && "In Person"}
                    {methodsValue === "telehealth" && "TeleHealth"}
                </label>
            </div>
        )
    };

    const setValues = (value) => {
        if (value === "inperson") {
            let newVal = !inpersonVal;
            setMethodsValueReturn(newVal, telehealthVal);
        } else if (value === "telehealth") {
            let newVal = !telehealthVal;
            setMethodsValueReturn(inpersonVal, newVal);
        }
    }

    const setMethodsValueReturn = (inpersonVal, telehealthVal) => {
        if (inpersonVal && telehealthVal) {
            props.returnHook('both');
            // setMethodValue("both");
            setHandleTypeError(false);
        } else if (!inpersonVal && !telehealthVal) {
            // setMethodValue("Error");
            props.returnHook('Error');
            setHandleTypeError(true);
        } else if (inpersonVal && !telehealthVal) {
            // setMethodValue("inperson");
            props.returnHook('inperson');
            setHandleTypeError(false);
        } else if (!inpersonVal && telehealthVal) {
            // setMethodValue("telehealth");
            props.returnHook('telehealth');
            setHandleTypeError(false);
        }
    }

    const renderSet = () => {
        return (
            <div>
           
                {/* {methodsValue} */}
                <div
                    className='TreatmentLabel'
                    onChange={(e) => {
                        if (e.target.value === "inperson") {
                            setInpersonVal(!inpersonVal);
                        } else if (e.target.value === "telehealth") {
                            setTelehealthVal(!telehealthVal);
                        }
                        setValues(e.target.value);
                    }}>
                    <input
                        style={{ width: 20 }}
                        type="checkbox"
                        value="inperson"
                        name="Appointment Type"
                        checked={inpersonVal} /><span style={{ paddingRight: 20 }}>Inperson</span>
                    <input
                        style={{ width: 20 }}
                        type="checkbox"
                        value="telehealth"
                        name="Appointment Type"
                        checked={telehealthVal} /><span style={{ paddingRight: 20 }}>TeleHealth</span>
                    <div hidden={!handleTypeError} style={{ fontSize: 14, color: 'red' }}>Please select atleast one!</div>
                </div>

            </div>
        )
    }

    const renderChoiceView = () => {
        props.returnHook(props.methodsChoice)
        return renderView()
    }

    const renderChoice = () => {
        return (
            <div>
                {/* choice {methodChoice} */}
                {methodsValue === "both" ?

                <div className='TreatmentLabel'>
                    <Form.Item  rules={[{required: true, message:'Select Appointment Type'}]}>
                {/* <div className='TreatmentLabel' onChange={e => {setMethodChoice(e.target.value); props.returnHook(e.target.value)}}> */}
                          <Radio.Group name="Appointment Type"  onChange={e => {setMethodChoice(e.target.value); props.returnHook(e.target.value)}} defaultValue={'inperson'} >
                            <Radio value="inperson" checked={methodChoice === "inperson"}>Inperson</Radio>
                            <Radio value="telehealth" checked={methodChoice === "telehealth"} >Telehealth</Radio>
                            </Radio.Group>
                    </Form.Item>
                        {/* <input
                            style={{ width: 20 }}
                            type="radio"
                            value="inperson"
                            name="Appointment Type"
                            checked={methodChoice === "inperson"} /><span style={{ paddingRight: 20 }}>In person</span>
                        <input
                            style={{ width: 20 }}
                            type="radio"
                            value="telehealth"
                            name="Appointment Type"
                            checked={methodChoice === "telehealth"} /><span style={{ paddingRight: 20 }}>TeleHealth</span> */}
                    </div> :
                    renderChoiceView()
                }
            </div>
        )
    }

    return (
        displayMode === "view" && renderView() ||
        displayMode === "set" && renderSet() ||
        displayMode === "choice" && renderChoice()
    )
}

export default AppointmentMethods

AppointmentMethods.defaultProps = {
    displayMode: 'view',
    methodsValue: '',
    methodsChoice: '',
    style: {},
    returnHook: () => { }
}

import React,{useState, useContext} from 'react'
import { Input,message,Form,Button,Radio } from 'antd';
import {Row,Col,Modal,} from 'react-bootstrap';
import {addVitalAPI} from '../../Hooks/API'
import { GlobalContext } from '../../Context/GlobalState';
const AddVitals=(props)=>{
    const patient_id = props.patientID;
    const [heightValue, setHeightValue] = useState('')
    const [weightValue, setWeightValue] = useState('')
    const [tempValue, setTempValue] = useState('')
    const [rateValue, setRateValue] = useState('')
    const [bmiValue, setBMIValue] = useState('')
    const [sugarValue, setSugarValue] = useState('')
    const [sugarRandom, setSugarRandom] = useState('')
    const [bpValue, setBPValue] = useState('')
    const [loading, setLoading]= useState(false)
    const [vitalVal,setVitalVal] = useState([]);
    const [sugarType,setSugarType] = useState('general');
    const vitalsList = [
        {
            vital_id:1,
            new_value:heightValue
        },
        {
            vital_id:2,
            new_value:weightValue
        },
        {
            vital_id:3,
            new_value:bpValue
        }
        ,{
            vital_id:4,
            new_value:rateValue
        },
        {
            vital_id:5,
            new_value:tempValue
        },
        {
            vital_id:6,
            new_value:bmiValue
        },
        {
            vital_id:7,
            new_value:sugarValue
        },
        {
            vital_id:8,
            new_value:sugarRandom
        }
    
    ]
    const {accountId} = useContext(GlobalContext)

    const formatVitalList=()=>{
        let tempList=[];
        vitalsList.map((item)=>{
            if(item.new_value !== 0 && item.new_value !== ""){
                tempList.push(item)
            }
        })
        setVitalVal(tempList)
        return tempList;
        
    }

    const onOkay=(Id)=>{
        setLoading(true);
        console.log('New Vital List is:', formatVitalList())
        console.log('New Vital List is:', vitalVal)
        addVitalAPI(accountId, Id, "POST", formatVitalList()).then(result => {
            console.log("Succesfully Added Vitals", result);
            if (formatVitalList().some(list => list.new_value !== '')){
                setLoading(false)
                props.hide()
                message.success('Vitals added succesfully') 
            }
            else if(result.error_code === 404){
                message.error('Vitals not added')
                setLoading(false)
            }
            else{
                message.error('Please add vital values') 
                setLoading(false)
            }
            props.onCallBAck()
            
            
        });
    }

    return(
        <Modal
            show={props.show}
            onHide={props.hide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
                <Modal.Header closeButton>
                    <Modal.Title className='ModalTitle'>
                        Add Vitals
                    </Modal.Title>
                </Modal.Header>
                <Form >
                    <Modal.Body>
                        <Row> 
                            <Col lg='4' className='FormElementLabel'>
                                <label> Height: </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                                <Form.Item name='height' rules={[{ required: false, message: 'Please input value', whitespace:true }]}>
                                        <Input
                                            className='EditInput'
                                            placeholder="Height"
                                            addonAfter={'cm'}
                                            value={heightValue}
                                            type="text"
                                            onChange={(e) => setHeightValue(e.target.value)}/> 
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row> 
                            <Col lg='4' className='FormElementLabel'>
                                <label> Weight: </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                                <Form.Item name='weight' rules={[{ required: false, message: 'Please input value', whitespace:true }]}>
                                    <Input
                                        className='EditInput'
                                        placeholder="Weight"
                                        addonAfter={'kg'}
                                        value={weightValue}
                                        type="text"
                                        onChange={e => setWeightValue(e.target.value)}
                                        
                                        
                                    /> 
                                    </Form.Item>
                            </Col>
                        </Row>         
                        <Row> 
                            <Col lg='4' className='FormElementLabel'>
                                <label> Temperature: </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                            <Form.Item  name='temperature' rules={[{ required: false, message: 'Please input value', whitespace:true }]}>
                                    <Input
                                        className='EditInput'
                                        placeholder="Temperature"
                                        addonAfter={'F'}
                                        value={tempValue}
                                        type="text"
                                        onChange={e => {setTempValue(e.target.value)}}
                                        
                                    /> 
                                    </Form.Item>
                            </Col>
                        </Row>
                        <Row> 
                            <Col lg='4' className='FormElementLabel'>
                                <label> Heart Rate : </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                            <Form.Item name='heart rate'  rules={[{ required: false, message: 'Please input value', whitespace:true }]}>
                                    <Input
                                        className='EditInput'
                                        placeholder="Heart Rate"
                                        addonAfter={'bpm'}
                                        type="text"
                                        value={rateValue}
                                        onChange={e => {setRateValue(e.target.value)}}
                                        
                                        
                                    /> 
                                    </Form.Item>
                            </Col>
                        </Row>
                        <Row> 
                            <Col lg='4' className='FormElementLabel'>
                                <label> Blood Pressure: </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                            <Form.Item  name='systolic' rules={[{ required: false, message: 'Please input value', whitespace:true }]}>
                                    <Input
                                        className='EditInput'
                                        placeholder="Blood Pressure"
                                        addonAfter={'mmHg'}
                                        type="text"
                                        value={bpValue}
                                        onChange={e => {setBPValue(e.target.value)}}
                                        
                                    /> 
                                    </Form.Item>
                            </Col>
                        </Row>
                        {/* <Row> 
                            <Col lg='4' className='FormElementLabel'>
                                <label> Blood Pressure (diastolic): </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                            <Form.Item name='diastolic' rules={[{ required: false, message: 'Please input value', whitespace:true }]}>
                                    <Input
                                        className='EditInput'
                                        placeholder="Blood Pressure"
                                        addonAfter={'mmHg'}
                                        type="text"
                                        value={bpValue}
                                        onChange={e => {setBPValue(e.target.value)}}
                                        
                                    /> 
                                    </Form.Item>
                            </Col>
                        </Row> */}
                        {/* <Row> 
                            <Col lg='4' className='FormElementLabel'>
                                <label> BMI: </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                            <Form.Item name='BMI' rules={[{ required: false, message: 'Please input value', whitespace:true }]}>
                                    <Input
                                        className='EditInput'
                                        placeholder="BMI"
                                        value={bmiValue}
                                        addonAfter={<div>kg/ m<sup>2</sup></div>}
                                        type="text"
                                        onChange={e => {setBMIValue(e.target.value)}}
                                        
                                        
                                    /> 
                                    </Form.Item>
                            </Col>
                        </Row> */}
                        <Row> 
                            <Col lg='4' className='FormElementLabel'>
                                <label> Sugar: </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                                {sugarType === 'general' ? 
                                    <Form.Item  rules={[{ required: false, message: 'Please input value', whitespace:true }]}>
                                        <Input
                                            className='EditInput'
                                            placeholder="Sugar random"
                                            addonAfter={'mg/ dL'}
                                            value={sugarRandom}
                                            type="text"
                                            onChange={e => { setSugarRandom(e.target.value)}}
                                            
                                        /> 
                                    </Form.Item>
                                     :    
                                     <Form.Item name='sugar'  rules={[{ required: false, message: 'Please input value', whitespace:true }]}>
                                        <Input
                                            className='EditInput'
                                            placeholder="Sugar fasting"
                                            addonAfter={'mg/ dL'}
                                            value={sugarValue}
                                            type="text"
                                            onChange={e => { setSugarValue(e.target.value)}}  
                                        /> 
                                     </Form.Item>  
                                     
                            }
                             <Radio.Group style={{marginLeft:'10px'}} defaultValue="general" size="small" buttonStyle="solid" onChange={e => {setSugarType(e.target.value); console.log('Sugar Type', e.target.value)}}>
                                <Radio.Button value="general">General</Radio.Button>
                                <Radio.Button value="fasting">Fasting</Radio.Button>
                            </Radio.Group>
                           
                            </Col>
                        </Row>
                        {/* <Row> 
                            <Col lg='4' className='FormElementLabel'>
                                <label> Sugar (random): </label>
                            </Col>
                            <Col lg='6' className='SectionInfo'>
                            <Form.Item  rules={[{ required: false, message: 'Please input value', whitespace:true }]}>
                                    <Input
                                        className='EditInput'
                                        placeholder="Sugar (random"
                                        addonAfter={'mg/ dL'}
                                        value={sugarRandom}
                                        type="text"
                                        onChange={e => { setSugarRandom(e.target.value)}}
                                        
                                    /> 
                                    </Form.Item>
                            </Col>
                        </Row> */}
         
                    </Modal.Body>
                    <Modal.Footer>
                        <Form.Item> 
                            <Button type="secondary" className='mrr-20' onClick={props.hide}>
                                Return
                            </Button> 
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType='submit' onClick={() => onOkay(patient_id)} loading={loading} >
                                Okay
                            </Button>
                        </Form.Item>
                    </Modal.Footer>
                </Form>
        </Modal>
      
          
          
   
    )
}

export default AddVitals
import React, { useContext, useEffect, useState } from 'react'
import { Modal,Row,Col } from "react-bootstrap";
import { Select,Input, Button} from 'antd';
import { addfee, searchReasonsAPI } from '../../Hooks/API';
import { GlobalContext } from '../../Context/GlobalState';

const { Option } = Select;


const FeeModal = (props) => {
    const {elementDocId} = useContext(GlobalContext)
    const data = props.itemData;
    
  const [discountValue,setDiscountValue] = useState('');
  const [reason,setReason] = useState("")
  const [payment,setPayment] = useState(!!data.appointment_location && data.appointment_location.fees);
  const [suggestList, setSuggestionList] =useState([]);

  useEffect(() => {
    console.log("Fee modal data: ", props.itemData)
    searchReasonsAPI(0,0,0).then(result => {
        console.log("Search result: ",result);
        // if(!result.error)
        setSuggestionList(result);
      });
  }, [props.itemData]);

    const renderReasons = () => {
        console.log("Fee modal reasons");
    return suggestList.map((item, i) => (
        <Option value={item.discount_reason} key={i}>
        {item.discount_reason}
        </Option>
    ));
    };

    const handleAddFee = () => {
        console.log("Fee modal Add Fee");
        console.log("Doc fee ", elementDocId,0,data.patient.patient_id,data.appointment_id,"POST",data.appointment_location.fees,discountValue,reason);
        addfee(elementDocId,0,data.patient.patient_id,data.appointment_id,"POST",data.appointment_location.fees,discountValue,reason).then((result)=>{
        console.log("fee result is ",result);
        setPayment(result)
        props.feeAdded(true);
        props.callback(0,0);
        props.closeModal(false);
        })
    }
    function onSelectChange(value) {
        console.log("Fee modal reason changes");
        setReason(`${value}`);
    }
    
    function onSearch(val) {
        console.log('search:', val);
    }
    
    function calculatePayment()
    {
        console.log("Fee modal payment calculated");
        var x = (discountValue/100)*data.appointment_location.fees;
        x=data.appointment_location.fees-x;
        setPayment(x);
    }
    
    return(
        <div>

        <Modal
        show={props.show}
        onHide={() => props.closeModal(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
            <Modal.Header closeButton>
                 <Modal.Title className='ModalTitle'>Update Fee</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col lg={4} className='SectionList'>
                        <label> Doctor Fee:  </label>
                    </Col>
                    <Col lg={7} className='SectionInfo'>
                        <h6> <b> {!!data.appointment_location && data.appointment_location.fees}  </b> </h6>
                    </Col>
                </Row>

                <Row>
                    <Col lg={4} className='SectionList'>
                        <label> Discount (%):  </label>
                    </Col>
                    <Col lg={7} className='SectionInfo'>
                        <Input addonAfter="%"  placeholder='0' value={discountValue} onBlur={calculatePayment} onChange={(e)=>{setDiscountValue(e.target.value)}}  style={{width:'100%'}}/>
                    </Col>
                </Row>

                <Row>
                    <Col lg={4} className='SectionList'>
                        <label> Reason:  </label>
                    </Col>
                    <Col lg={7} className='SectionInfo'>
                        <Select
                            showSearch
                            onChange={onSelectChange}
                            onSearch={onSearch}
                            onFocus={calculatePayment}
                            style={{ width: "100%" }}
                            placeholder="Select Reason"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                        >
                            {renderReasons()}
                        </Select>
                    </Col>
                </Row>
                
                <Row>
                    <Col lg={4} className='SectionList'>
                        <label> Payment:   </label>
                    </Col>
                    <Col lg={7} className='SectionInfo'>
                    <Input defaultValue={payment} value={payment} style={{width:'100%'}}/>
                    </Col>
                </Row>
                
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    type="primary" 
                    onClick={() => {
                        console.log("Fee modal payment okay btn");
                        handleAddFee();
                    }}>
                    Okay 
                </Button>
            </Modal.Footer>
        </Modal>
        </div>
    )
}

export default FeeModal

FeeModal.defaultProps = {
    closeModal: () => {},
    callback: () => {},
    itemData: {
        appointment_location: { fees : ""}
    }
}
import React from 'react'
import { Container, Row,Col } from 'react-bootstrap';
import HelpBg from '../../Styles/Assets/Healthcare.jpg';
import { Descriptions,Typography } from 'antd';
import { Divider } from '@material-ui/core';
import config from "../../config";
import preval from 'preval.macro'
const aibers = require('../../../package.json');
const { Paragraph } = Typography;

const HelpAndSupport=()=>{
   const baseDate  = config.baseDate
    return(
        <Container fluid>
             <div className='MainSecDiv'> 
                 <img src={HelpBg} className='BgHelp' alt='help and support'/>
                            {/* {accountType} */}
                            {/* <input value={accountType} onChange={(e)=> setAccountType(e.target.value)}/>  */}

                         {/* {/* {info.admin.length !==0 && info.admin[0].admin_id} */}
                         {/* {info.admin.length !==0 && info.admin[0].admin_id}
                        { info.doctor.length !==0 && info.doctor[0].doctor_id} 
                        {info.session_id && info.session_id} 
                         {info.staff.length !==0 && info.staff[0].doctor_staff_id}  */}
                  
                <Row style={{marginTop:'10px'}}>
                   <Col lg={1}></Col>
                   <Col lg={10}>
                    <Paragraph>
                        Without planning and administrative input, it would be difficult for doctors and other medical professionals to deliver their services. Some people in administrative roles are responsible for scheduling appointments, 
                        while others may be in charge of running an office, nursing home, or hospital.
                        </Paragraph>
                        <Paragraph>
                         Aibers is a trusted partner to many of the nation’s top healthcare organizations, providing national healthcare and medical recruiting services with the highest degree of success. Our specific focus is in healthcare recruiting and we have developed an industry-leading approach that places the top healthcare professionals with the top companies.
                        </Paragraph>
                        <Paragraph> 
                         The acquisition of talent in the ultra-complex healthcare industry is essential. At HealthCare Support, our goal is to provide a bandwidth of employment solutions to our clients so that the candidates we deliver will meet their talent requirements for becoming long-term pillars of their organization.
                         Please contact us to discuss recruiting options with HealthCare Support.For Technical Support or technical questions about our products, please contact us via following details.
                         </Paragraph>
                   </Col>
                   <Col lg={1}></Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <Descriptions
                                title="For Help & Support"
                                bordered
                                column={{ xxl: 6, xl: 6, lg: 6, md: 6, sm: 6, xs: 6}}
                                >
                                <Descriptions.Item label="Email:">info@aibers.com</Descriptions.Item>
                                <Descriptions.Item label="Phone:">+92 348 4263403</Descriptions.Item>
                                <Descriptions.Item label="Address:">F-10/3 Islamabad</Descriptions.Item>
                                
                            </Descriptions>
                    </Col>
                </Row>
                <br/>
                            <Divider/>
                <Row>
                    <Col lg={12}>
                        <Descriptions
                                title="Product Details"
                                bordered
                                column={{ xxl: 6, xl: 6, lg: 6, md: 6, sm: 6, xs: 6}}
                                >
                               <Descriptions.Item label="Version:">{aibers.version}</Descriptions.Item>
                                <Descriptions.Item label="Date:"> 
                                {/* {moment(baseDate).format('DD-MM-YYYY')}  */}
                                {/* {baseDate} */}
                                {preval`module.exports = new Date().toDateString();`}
                                </Descriptions.Item>
                                <Descriptions.Item label="Branch:">{aibers.branch}</Descriptions.Item>
                            </Descriptions>
                    </Col>
                </Row>
            </div>
        </Container>
    )
}

export default HelpAndSupport
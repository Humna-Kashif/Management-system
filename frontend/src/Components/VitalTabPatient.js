import React, { useContext, useState } from "react"
import { Col, Container, Row } from "react-bootstrap";
import VitalTile from "./VitalTile";
import VitalsList from './VitalsList'
import VitalsChart from './VitalsChart'
import { getVitalsAPI } from '../Hooks/API';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import moment from 'moment'
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import { withStyles } from '@material-ui/core/styles';
import '../Styles/Vitals.css';
import { Divider, Tabs } from 'antd';
import heightIcon from '../Styles/Assets/height.png';
import weightIcon from '../Styles/Assets/body-scale.png'
import tempIcon from '../Styles/Assets/thermometer.png'
import bloodPressIcon from '../Styles/Assets/blood-pressure.png';
import BmiIcon from '../Styles/Assets/bathroom-scale.png';
import heartRate from '../Styles/Assets/heart-beat.png'
import sugar from '../Styles/Assets/glucometer.png'
import AddVitals from "./Vitals/AddVitals";
import { Fragment } from "react";
import { GlobalContext } from "../Context/GlobalState";


const { TabPane } = Tabs;

const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

const VitalTabPatient = (props) => {
    const { accountId,elementDocId } = useContext(GlobalContext)
    const data = props.vitals;
    const pat_ID = props.patientID;
    console.log("patient info data...... ", data);
    const [vitalValue, setVitalValue] = useState([]);
    const [normalValue, setNormalValue] = useState("");
    const [vitalData, setVitalData] = useState([]);
    const [selectedVital, setSelectedVital] = useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [addVitals, setAddVitals] = useState(false)
    const [bmiHeight, setBMIHeight] = useState('')
    const [bmiWeight, setBMIWeight] = useState('')
    const [bmi, setBMI] = useState('')
    let BMI = ((parseInt(!!data[1] && data[1].vital_current !== null && data[1].vital_current[0].current_value) / parseInt(!!data[0] && data[0].vital_current !== null && data[0].vital_current[0].current_value) / parseInt(!!data[0] && data[0].vital_current !== null && data[0].vital_current[0].current_value)) * 10000).toFixed(2)
    console.log('vitalsssss bmi value is', BMI)


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const showModal = () => {
        setAddVitals(true)
    }
    const hideModal = () => {
        setAddVitals(false)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const VitalIcons = [
        {
            icon: heightIcon,
        },
        {
            icon: weightIcon,
        },

        {
            icon: bloodPressIcon,
        },

        {
            icon: heartRate,
        },

        {
            icon: tempIcon,
        },

        {
            icon: BmiIcon,
        },
        {
            icon: sugar
        }


    ]

    const getAllVitalsValues = (vital_id) => {
        console.log("vitalsssss on Vital selection ", pat_ID, " vital id ", vital_id, elementDocId);
        setSelectedVital(vital_id);
        getVitalsAPI(elementDocId, pat_ID, vital_id, "GET").then(result => {
            console.log("vitalsssss Vitals Values results", pat_ID, vital_id, result);
            if (result.length !== 0) {
                setVitalData(result);
                if (result[0]) {
                    if (result[0].vital_data) {
                        setVitalValue(result[0].vital_data);
                    }
                    else setVitalValue('')
                    if (result[0].vital_info.normal_range) {
                        setNormalValue(result[0].vital_info.normal_range);
                    }
                    else setNormalValue('')
                }


            }
            // setVitalChart(renderVitalChart());
        });
    }

    const handleCallBack = () => {
        props.backCall();
        return (
            data.map((item, i) => (
                //<VitalTile itemData={item} onTileSelect={handleVitalTile}></VitalTile>
                <VitalTile itemData={item} key={i} onTileSelect={getAllVitalsValues}></VitalTile>
            ))
        )

    }



    const renderVitalList = () => {
        console.log("vitalsssss ", BMI, data)
        // setBMIHeight(parseInt(!!props.vitals[0] && props.vitals[0].vital_current.current_value))
        // console.log('vitalsssss bmi height value is',bmiHeight)
        return (
            data.map((item, i) => (
                //<VitalTile itemData={item} onTileSelect={handleVitalTile}></VitalTile>
                <VitalTile key={i} itemData={item} icons={VitalIcons} bmi={BMI} patientID={pat_ID} onCallBAck={handleCallBack} onTileSelect={getAllVitalsValues} selected={item.vital_id === selectedVital}></VitalTile>
            ))
        )
    }

    const renderVitals = () => {
        return (
            <div className='TableList'>
                {/* <Row style={{margin: 10,display:"flex",flexDirection:"row",alignItems:"center"}}>
                    <Col style={styles.label}><b>Current Values</b></Col>
                    <Col style={styles.label}><b>Date</b></Col>
                    <Col style={styles.label}><b>Normal Range</b></Col>
                </Row>
                {vitalValue.map((item)=>(   
                        <VitalTile itemData={item} onTileSelect={handleVitalTile}></VitalTile>
                        <VitalsList itemData={item} range={normalValue} ></VitalsList>
                    ))} */}
                <TableContainer>
                    <Table stickyHeader aria-label="Vitals List">
                        <TableHead >
                            <TableRow>
                                <StyledTableCell align="center">Current Values</StyledTableCell>
                                <StyledTableCell align="center">Date</StyledTableCell>
                                <StyledTableCell align="center">Normal Range</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!!vitalValue && vitalValue.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, i) => (
                                <VitalsList key={i} itemData={item} range={normalValue} ></VitalsList>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 25, 100]}
                    component="div"
                    count={vitalValue.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </div>
        )
    }

    //  Chart Code

    // const renderVitalsChart = () =>{
    //     return(
    //         vitalValue.map((item)=>(   
    //             //<VitalTile itemData={item} onTileSelect={handleVitalTile}></VitalTile>
    //             <VitalsChart itemData={item} range={normalValue} ></VitalsChart>
    //         ))  
    //     )
    // }

    // const renderEditingItem = () => {
    //     return (
    //         <div>
    //             <Col style={styles.about_row}>
    //                 <label style={styles.label}>Add Vitals:</label>
    //                 <div style={styles.display_value}>
    //                     <input style={styles.input}
    //                         placeholder="Enter vital value ..."
    //                         type="text"
    //                         value={vitalValue}
    //                         noValidate
    //                         onChange={e => {setVitalValue(e.target.value)}}
    //                         />
    //                 </div>
    //                 <Button style={{marginLeft:10}}>ADD</Button>
    //             </Col>
    //         </div>
    //     )
    // }





    return (
        <Container fluid style={{ paddingTop: 10 }}>
            {/* list */}
            <Row>
                <Col lg={9}>
                    <h6 className='DetHead'> Vital Statistics   </h6>
                    <label style={{ textAlign: 'left', color: 'rgb(123 122 122)', marginTop: '-22px', float: 'left', textIndent: '3px' }}>
                        {moment().format('dddd Do MMM, YYYY')} </label>

                </Col>
                {/* <Col lg={3}>
                                <div style={{textAlign:'right'}} onClick={showModal}>
                                    <label style={{color:"#868383", fontWeight:'550', cursor:'pointer'}} > Add Vitals
                                        <i>
                                            <AddIcon style={{height:20,width:20, marginBottom:4}}/>
                                        </i>
                                    </label>
                                </div>
                            </Col> */}

            </Row>
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                {renderVitalList()}

            </div>
            {/* <Row> */}
            {/* <Col lg={6}> */}
            {/* You need to display a list here */}
            {/* <Row>
                        <Col style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                            {renderVitalList()}
                        </Col>
                    </Row> */}
            {/* </Col> */}
            {/* <Col lg={6}> */}
            {selectedVital !== 6 ?
                <Tabs type="card">
                    <TabPane tab="Chart" key="1">
                        <VitalsChart data={vitalData} key={vitalValue.length} id={selectedVital} />
                    </TabPane>
                    <TabPane tab="Table" key="2">
                        {renderVitals()}
                    </TabPane>

                </Tabs>
                : selectedVital === 6 ?
                    <Fragment>
                        <Divider />

                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontSize: 16, fontWeight: 'bold' }}>  BMI Categories: </label>
                            <h6> Underweight =  <b> less than 18.5</b> </h6>
                            <h6> Normal weight =  <b>  18.5–24.9 </b> </h6>
                            <h6> Overweight = <b> 25–29.9  </b></h6>
                            <h6>  Obesity =  <b>  BMI of 30 or greater </b></h6>
                        </div>

                        <Divider />
                        {BMI <= 18.5 ?
                            <div className={"bmi-result alert alert-danger"}>
                                <div>{BMI !== "Nan" && BMI || '--.-'}</div>
                                <div>Underweight</div>
                            </div>

                            :
                            BMI <= 24.9 ?
                                <div className={"bmi-result alert alert-success"}>
                                    <div>{BMI !== "Nan" && BMI || '--.-'}</div>
                                    <div>Normal Weight</div>
                                </div>
                                :
                                BMI <= 29.9 ?
                                    <div className={"bmi-result alert alert-warning"}>
                                        <div>{BMI !== "Nan" && BMI || '--.-'}</div>
                                        <div>Overweight</div>
                                    </div>
                                    :
                                    BMI >= 30 ?
                                        <div className={"bmi-result alert alert-danger"}>
                                            <div>{BMI !== "Nan" && BMI || '--.-'}</div>
                                            <div>Obesity</div>
                                        </div>
                                        :
                                        <div className={"bmi-result alert alert-primary"}>
                                            <div>{BMI === "Nan" ? 'No Data Yet' : ''}</div>
                                            <div>Please enter height and weight for calculation</div>
                                        </div>
                        }
                    </Fragment>
                    :
                    ""
            }


            <AddVitals show={addVitals} hide={hideModal} patientID={pat_ID} onCallBAck={handleCallBack} />
            {/* </Col>
            </Row> */}

        </Container>
    )
}

export default VitalTabPatient

VitalTabPatient.defaultProps = {
    vitals: [
        {
            vital_current: {
                patient_id: 0,
                vital_id: 1
            }
        }
    ]
}



import React,{useState, useEffect,useCallback, useContext} from 'react'
import { Container, Row, Col  } from 'react-bootstrap';
import { Select, Input } from 'antd';
import {getAppointmentsStats,locationsAPI} from "../../Hooks/API";
import PatientAnalysis from './PatientAnalysisUi';
import FinancialAnalytics from './FinancialAnalytics';
import TreatmentStats from './TreatmantStats';
import TodaysStats from '../Statistics/TodaysStats';
import moment from 'moment';
import '../../Styles/Dashboard.css';
import { GlobalContext } from '../../Context/GlobalState';
import IntervalDropdown from './IntervalDropdown';
const { Option } = Select;
const DashboardUi=()=>{
    const {accountId,elementDocId} = useContext(GlobalContext);
    const intervalRange = [];
    const [locationData,setLocationData] = useState([]);
    const [interval, setInterval] = useState("month");
    const [range, setRange] = useState(1);
    const [location,setSelectLocation] = useState(0);
    const [selectedLocationValue,setSelectedLocationValue]=useState(0);
    const [intervalVal,setIntervalVal] = useState('past month');
    const [intervalEnd,setIntervalEnd] = useState(new Date().toISOString());
    const [intervalStart,setIntervalStart] = useState(new Date().toISOString());
    const [today,setToday]=useState("day");

    const getLocationsOfDoctor = useCallback(() =>{
        locationsAPI(elementDocId).then(result => {
            console.log("location api in calender results",result);
            if(result)
            {
            setLocationData(result);
            }
        });
      },[elementDocId])

    const displayPatientQue = useCallback(()=>{
        getAppointmentsStats(elementDocId,0, moment(new Date()).format("YYYY-MM-DD")).then(result => {
            console.log("appointment patient stats is: ",result[0])
            if(result[0])
            {
              setToday(result[0].today);
            }
            else{setToday(new Date())}
        });
    },[elementDocId])

    const renderLocationDropdown = () =>{
        console.log("my location data in dashboard ", locationData)
        return locationData.map((item, i) => (
          <Option value={item.doctors_hospital_location_id} key={item.doctors_hospital_location_id}>
            {item.location}
          </Option>
        ));
      }
      function onLocationChange(value) {
        setSelectLocation(value);
        setSelectedLocationValue(`${value}`);
        console.log('Selected Location Value', value)
        // getAnalytics(`${value}`,range,interval); 
         
      }
      function onIntervalChange(value) {
        setInterval(value);
        // // setInterval(`${value}`);
        // getAnalytics(selectedLocationValue,range,`${value}`);
      }
      function onRangeSelect(value) {
        setRange(`${value}`)
        console.log(`${value}`);
        // getAnalytics(selectedLocationValue,`${value}`,interval);
      }

      for (let i = 1; i <= 31; i++) {
        intervalRange.push(<Option key={i}>{i}</Option>);
      }
   
    useEffect(() => {
      if(locationData.length ===1){
        setSelectLocation(locationData[0].doctors_hospital_location_id);
      }
        getLocationsOfDoctor();
        displayPatientQue(); 
    },[displayPatientQue,getLocationsOfDoctor]);
    
    return(
        <Container fluid>

            <h6 className='ColHeader'> DASHBOARD FILTERS </h6>
            <div className='AnaylyticsDiv'> 
            <Row className='mtt-5'>
                    <Col lg='3'></Col>
                    <Col lg='3' className={locationData.length > 1 ?'p-0':"mtt-5"}>
                        <label className= 'DbLabel' > Locations :  
                            &nbsp;&nbsp;
                            {locationData.length > 1 ? 
                            <Select
                            showSearch
                            style={{ width: 200 }}
                            placeholder="Select a location"
                            optionFilterProp="children"
                            value={location}
                            onChange={onLocationChange}
                            filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }>
                               <Option value={0} key={0}>{'All'}</Option>
                                {renderLocationDropdown()}
                            </Select> : locationData.length === 1 ? 
                            locationData.map((item, i) => (
                              <label key={i}>   {item.location? item.location:'Selected Location'} </label>
                             )) 
                             : <label >   No Location Added </label>
                            }
                        </label>   
                    </Col>
                    <Col lg='3'>
                      <label className= 'DbLabel' > Interval :  
                              &nbsp;&nbsp;
                              <IntervalDropdown returnHook={setIntervalVal} defaultInterval={intervalVal} returnEndTime={setIntervalEnd} returnStartTime={setIntervalStart} defaultStartTime={intervalStart}/>
                        </label>
                    </Col>
                </Row>
            </div>
            {/* <Row>
                <Col lg={8}> */}
                    {/* <h6 className='ColHeader'> APPOINTMENT STATS</h6>
                    <div className='DashStatsDiv'>
                        <TodaysStats selectedLocation={selectedLocationValue} status={true} startDate={intervalStart} endDate={intervalEnd} />
                    </div> */}
                {/* </Col> */}
                {/* <Col lg={4} style={{marginTop:'6px'}}>
                    <h6 style={{marginBottom:0,textAlign:'right'}}> <b> Today:</b>  <label> {moment().format('dddd  YYYY-MM-DD')} </label></h6>
                    <div className='DahProgressDiv' >
                        <TodaysQueue ColSize={12}/>
                    </div>
                </Col> */}
            {/* </Row> */}
            <PatientAnalysis location={selectedLocationValue} range={intervalStart} interval={intervalEnd}/>
            <FinancialAnalytics location={selectedLocationValue} range={intervalStart} interval={intervalEnd}/>
            <TreatmentStats location={selectedLocationValue} range={intervalStart} interval={intervalEnd}/>
        </Container>
    )
}

export default DashboardUi;

import React, { useState, useEffect, Fragment, useCallback, useContext } from 'react'
import { Col, Row } from "react-bootstrap";
import { Empty } from 'antd';
import { Divider } from '@material-ui/core';
import InsertChartIcon from '@material-ui/icons/InsertChart';
import { Area } from '@ant-design/charts';
import { showAnalyticalStats } from '../../Hooks/API'
import { getDate } from '../../Hooks/TimeHandling';
import { GlobalContext } from '../../Context/GlobalState';

const PatientAnalysis = (props) => {
  const selectedLocation = props.location;
  const selectedRange = props.range;
  const selectedInterval = props.interval;
  const [totalPatients, setTotalPatients] = useState('');
  const [averagePatients, setAveragePatients] = useState('');
  const [analytics, setAnalytics] = useState([]);
  const { accountId,elementDocId } = useContext(GlobalContext)

  const graphValues = (dataArray) => {
    const graphArray = [];
    dataArray.map((item, i) => (
      graphArray.push({
        key: { i },
        date: `${getDate(item.date_time)}`,
        patient: parseInt(item.patients)
      })
    ))
    return graphArray
  }

  const getAnalytics = useCallback((location_value, range, interval_value) => {
    console.log("location id ", location_value, " range ", range, " interval ", interval_value)
    showAnalyticalStats(elementDocId, location_value, 0, range, interval_value).then((result) => {
      console.log('Analytics Stats data:', result);
      console.log('Total patients are:', result.end_line[0].total_check_ups);
      setTotalPatients(result.end_line[0].total_check_ups);
      setAveragePatients(result.end_line[0].average_per_day);
      console.log('setAnalytics:', result.graph);
      const analyticsCopy = [...result.graph];
      setAnalytics(graphValues(analyticsCopy));
    });
  }, [elementDocId])

  useEffect(() => {
    getAnalytics(selectedLocation, selectedRange, selectedInterval);
  }, [getAnalytics, selectedLocation, selectedRange, selectedInterval]);

  var analyticalData = {
    data: analytics,
    xField: 'date',
    yField: 'patient',
    xAxis: { tickCount: 5 },
  };
  return (
    <Fragment>
      <h6 className='ColHeader'> PATIENT ANALYTICS</h6>
      <div className='AnaylyticsDiv'>
        <div className='AnalysisChart'>
          {analytics.length > 3 ?  <Area {...analyticalData} /> :
            <Empty
              image={<InsertChartIcon style={{ height: '70px', width:'70px', marginLeft:'auto', marginRight:'auto',color:'rgba(0, 0, 0, 0.25)'}}/>}
              imageStyle={{marginBottom:'-24px'}}
              description={ <span style={{ color:'rgba(0, 0, 0, 0.25)'}}> Not enough data to plot </span>}/>
            }
        </div>
        <br />
        <Divider />
        <br />
        <Row>
          <Col lg={6}>
            <label> Total Patients: <b>{totalPatients ? totalPatients : 0}</b></label>
          </Col>
          <Col lg={6}>
            <label>Average Patients per day: <b>{averagePatients ? parseInt(averagePatients) : 0} </b></label>
          </Col>
        </Row>
      </div>
    </Fragment>
  )
}

export default PatientAnalysis
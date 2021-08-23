import React, { useState, useEffect,Fragment, useCallback, useContext }  from 'react'
import { Col,Row } from "react-bootstrap";
import { Area,Column } from '@ant-design/charts';
import { Empty } from 'antd';
import { Divider } from '@material-ui/core';
import {showDiscountStats,showRevenueStats} from '../../Hooks/API'
import InsertChartIcon from '@material-ui/icons/InsertChart';
import {getDate} from '../../Hooks/TimeHandling';
import { GlobalContext } from '../../Context/GlobalState';

const FinancialAnalytics= (props)=>{
  const selectedLocation = props.location;
  const selectedRange = props.range;
  const selectedInterval = props.interval;
  const [familyDiscount, SetFamilyDiscount] = useState(0);
  const [followupDiscount, setFollowUpDiscount] = useState(0);
  const [CSRDiscount, setCSRDiscount] = useState(0);
  const [othersDiscount, setOthersDiscount] = useState(0);
  const [totalDiscount,setTotalDiscount] = useState(0);
  const [totalRevenue, setTotalRevenue]=useState(0);
  const [RevenueData, setRevenueData]=useState([]);
  const {accountId,elementDocId} = useContext(GlobalContext)

  const revenueGraph=(dataArray)=>{
    const graphArray=[];
    dataArray.map((item,i)=>(
      graphArray.push({
        key:{i},
        date:`${getDate(item.date_time)}`,
        revenue: parseInt(item.total_payment)
        })
    ))
    return graphArray
  }

  const asyncFetch = useCallback (() => {
    showRevenueStats(elementDocId,selectedLocation,0,selectedRange,selectedInterval).then((result)=>{
      console.log("Revenue results are:", result);
      if(result){
        if(result.total_payment){
          console.log('Revenue Results are:',result.total_payment);
          const revenueCopy = [...result.total_payment];
          setRevenueData(revenueGraph(revenueCopy));  
        }
        else setRevenueData([]);  
      }
    });
  },[elementDocId,selectedLocation,selectedRange,selectedInterval])
  
  const renderRevenues = useCallback(()=>{
    showRevenueStats(elementDocId,selectedLocation,0,selectedRange,selectedInterval).then((result)=>{
      console.log("Revenue results are:", result);
      if(result){
        if(result.total_revenue[0]){
          if(result.total_revenue[0].total_revenue){
            setTotalRevenue(result.total_revenue[0].total_revenue)
          }
          else setTotalRevenue(0);
        }
      }
    })
  },[elementDocId,selectedLocation,selectedRange,selectedInterval])

  const renderDiscountStats = useCallback (() =>{
    showDiscountStats(elementDocId,selectedLocation,0,selectedRange,selectedInterval).then((result)=>{console.log("discount result is ",result)
      if(result) {
        if(result.csr[0]!==null) {
          if(result.csr[0].discount_csr!==null) {
            setCSRDiscount(parseInt(result.csr[0].discount_csr))
          }
          else setCSRDiscount(0);
        }
        else setCSRDiscount(0);

        if(result.follow_ups[0]) {
          if(result.follow_ups[0].discount_followups) {
            setFollowUpDiscount(parseInt(result.follow_ups[0].discount_followups))
          }
          else setFollowUpDiscount(0);
        }

        if(result.friend_and_family[0]) {
          if(result.friend_and_family[0].discount_friend_family) {
            SetFamilyDiscount(parseInt(result.friend_and_family[0].discount_friend_family))
          }
          else SetFamilyDiscount(0);
        }

        if(result.other[0]) {
          if(result.other[0].discount_other) {
            setOthersDiscount(parseInt(result.other[0].discount_other))
          }
          else setOthersDiscount(0);
        }

        if(result.total_discount[0]) {
          if(result.total_discount[0].discount) {
            setTotalDiscount(result.total_discount[0].discount)
          }
          else setTotalDiscount(0);
        }
      }
    });
  },[elementDocId,selectedLocation,selectedRange,selectedInterval])

  useEffect(() => {
    renderDiscountStats();
    renderRevenues();
    asyncFetch();
  },[asyncFetch,renderRevenues,renderDiscountStats]);

    
    var discountData = [
      {
        name: 'Followups',
        Type: 'Followups',
        Discount: followupDiscount,
      },
      {
        name: 'Family & Friends',
        Type: 'Family & Friends',
        Discount: familyDiscount,
      },
      {
        name: 'CSR',
        Type: 'CSR',
        Discount: CSRDiscount,
      },
      {
        name: 'Other',
        Type: 'Other',
        Discount: othersDiscount,
      },
    ]
    var discount = {
      data: discountData,
      isGroup: true,
      xField: 'Type',
      yField: 'Discount',
      seriesField: 'name',
      label: {
        position: 'middle',
        layout: [
          { type: 'interval-adjust-position' },
          { type: 'interval-hide-overlap' },
          { type: 'adjust-color' },
        ],
      },
    };
    var revenue = {
      data: RevenueData,
      xField: 'date',
      yField: 'revenue',
      color: ['#e0004d'],
      };
    
    return(
        <Fragment>
             <h6 className='ColHeader'> FINANCIAL ANALYTICS</h6>
             <div className='AnaylyticsDiv'> 
                <br/>
                <br/>
                <Row className='m-0'>
                    <Col lg={6}> 
                      <div className='AnalysisChart EmptyChartCont'>
                        {RevenueData.length >= 5 ? <Area {...revenue} /> : 
                          <Empty
                          image={<InsertChartIcon style={{ height: '70px', width:'70px', marginLeft:'auto', marginRight:'auto',color:'rgba(0, 0, 0, 0.25)'}}/>}
                          imageStyle={{marginBottom:'-24px'}}
                          description={ <span style={{ color:'rgba(0, 0, 0, 0.25)'}}> Not enough data to plot </span>}/>
                        }
                      </div>
                      <br/>
                      <br/>
                        <div style={{marginBottom:0}}>
                        <Divider/>
                          <label> Total Revenue: <b>{totalRevenue} PKR </b></label>
                        </div>
                    </Col>
                    <Col lg={6}>
                      <div className='AnalysisChart EmptyChartCont'>
                        {followupDiscount > 0 || familyDiscount > 0 || CSRDiscount > 0 || othersDiscount > 0 ? <Column {...discount} /> :  
                          <Empty
                          image={<InsertChartIcon style={{ height: '70px', width:'70px', marginLeft:'auto', marginRight:'auto',color:'rgba(0, 0, 0, 0.25)'}}/>}
                          imageStyle={{marginBottom:'-24px'}}
                          description={ <span style={{ color:'rgba(0, 0, 0, 0.25)'}}> Not enough data to plot </span>}/>
                        }
                      </div>
                      <br/>
                      <br/>
                      <Divider/>
                      <label> Total Discount: <b>{totalDiscount} PKR </b></label>
                    </Col>
                </Row>
            </div>
        </Fragment>
    )
}

export default FinancialAnalytics
import React, { useEffect, useState,useCallback, useContext } from 'react'
import { Fragment } from 'react'
import {Empty} from 'antd';
import StatsItem from './StatsItem';
import {showTopDiagnosisStats} from '../../Hooks/API'
import { GlobalContext } from '../../Context/GlobalState';

const TopDiagnosis=(props)=>{
    const selectLocation = props.location;
    const selectedRange = props.range;
    const selectedInterval = props.interval;
    const [diagnosis,setDiagnosis] = useState([]);
    const [totalValue,setTotalValue] = useState(0);
    const {accountId,elementDocId} = useContext(GlobalContext)
    
    const renderTopDiagnosis = useCallback(() =>{
        showTopDiagnosisStats(elementDocId,selectLocation,selectedRange,selectedInterval).then((result)=>{
            console.log("Top diagnosis are ",result);
            if(result)
            {
                setDiagnosis(result);
                if(result[0])
                {
                    console.log("Top diagnosis are ",result[0].frequency);
                    setTotalValue(result[0].frequency)
                }
        }
        })
    },[elementDocId,selectLocation,selectedRange,selectedInterval])

    useEffect(() => {
        renderTopDiagnosis();
      },[renderTopDiagnosis]);

    const renderItems=()=>diagnosis.map((item,i)=>
    <StatsItem item_Name={item.diagnosis_name} value={item.frequency/totalValue * 100} total={item.frequency} key={i}/>)

return(
<Fragment>
     <div className='StatisticDiv'> 
    <h6 className='TreatmentTitle'> Top Diagnosis</h6>
    <br/>
    <div className='TreamentList'>
        {diagnosis.length!==0 ? 
            <ol>
                {renderItems()}
            </ol> : 
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Diagnosis'} />
        }
    </div>
   </div>
</Fragment>
)}


export default TopDiagnosis
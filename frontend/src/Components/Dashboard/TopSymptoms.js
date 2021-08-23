import React, { useEffect, useState,useCallback, useContext } from 'react'
import { Fragment } from 'react'
import {Empty} from 'antd'
import StatsItem from './StatsItem';
import {showTopSymptomsStats} from '../../Hooks/API'
import { GlobalContext } from '../../Context/GlobalState';


const TopSymptoms=(props)=>{
    const selectLocation = props.location;
    const selectedRange = props.range;
    const selectedInterval = props.interval;
    const [symptoms,setSymptoms] = useState([]);
    const [totalValue,setTotalValue] = useState(0);
    const {accountId,elementDocId} = useContext(GlobalContext)

    const renderTopSymptoms = useCallback(() =>{
        showTopSymptomsStats(elementDocId,selectLocation,selectedRange,selectedInterval).then((result)=>{
            console.log("Top symptoms are ",result);
            if(result)
            {
            setSymptoms(result);
            if (result[0]){
                setTotalValue(result[0].frequency)
            }
            }
        })
    },[elementDocId,selectLocation,selectedRange,selectedInterval])

    useEffect(() => {
        renderTopSymptoms();
      },[renderTopSymptoms]);
    const renderItems=()=>symptoms.map((item,i)=>
    <StatsItem item_Name={item.symptom_name} value={item.frequency/totalValue * 100} total={item.frequency} key={i}/>)

return(
<Fragment>
     <div className='StatisticDiv'> 
    <h6 className='TreatmentTitle'> Top Symptoms</h6>
    <br/>
    <div className='TreamentList'>
    {symptoms.length!==0 ? 
        <ol>
            {renderItems()}
        </ol> : 
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Symptoms'} />
    }
    </div>
   </div>
</Fragment>
)}



export default TopSymptoms
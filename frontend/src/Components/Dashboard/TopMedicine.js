import React, { useEffect, useState,useCallback,Fragment, useContext } from 'react'
import StatsItem from './StatsItem';
import {Empty} from 'antd'
import {showTopMedicinesStats} from '../../Hooks/API'
import { GlobalContext } from '../../Context/GlobalState';

const TopMedicine=(props)=>{
    const selectLocation = props.location;
    const selectedRange = props.range;
    const selectedInterval = props.interval;
    const [Medicines,setMedicines] = useState([]);
    const [totalValue,setTotalValue] = useState(0);
    const {accountId,elementDocId} = useContext(GlobalContext)

    const renderTopMedicines =useCallback (() =>{
        showTopMedicinesStats(elementDocId,selectLocation,selectedRange,selectedInterval).then((result)=>{
            console.log("Top medicines are ",result);
            if(result){
                setMedicines(result);
                if (result[0]){
                    setTotalValue(result[0].frequency)
                }
                
            }
            else{
                setMedicines('');
                setTotalValue('')
            }
        })
    },[elementDocId,selectLocation,selectedRange,selectedInterval])

    useEffect(() => {
        renderTopMedicines();
    },[renderTopMedicines]);
 
    const renderItems=()=>Medicines.map((item,i)=>
        <StatsItem item_Name={item.medicine_name} value={item.frequency/totalValue * 100} total={item.frequency} key={i}/>
    )
    
    return(
        <Fragment>
            <div className='StatisticDiv'> 
                <h6 className='TreatmentTitle'> Top Medicine</h6>
                <br/>
                <div className='TreamentList'>
                    {Medicines.length!==0 ? <ol>
                        {renderItems()}
                    </ol> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Medicines'} />
                    }
                    
                </div>
            </div>
        </Fragment>
    )
}

export default TopMedicine
import React, { useEffect, useState, Fragment, useCallback, useContext } from 'react';
import StatsItem from './StatsItem';
import {Empty} from 'antd'
import {showTopTestsStats} from '../../Hooks/API'
import { GlobalContext } from '../../Context/GlobalState';

const TopTests=(props)=>{
    const selectLocation = props.location;
    const selectedRange = props.range;
    const selectedInterval = props.interval;
    const [Tests,setTest] = useState([]);
    const [totalValue,setTotalValue] = useState(0);
    const {accountId,elementDocId} = useContext(GlobalContext)

    const renderTopTests = useCallback(() =>{
        return showTopTestsStats(elementDocId,selectLocation,selectedRange,selectedInterval).then((result)=>{
            console.log("Top tests are ",result);
            if(result){
                setTest(result);
                if (result[0]){
                    setTotalValue(result[0].frequency)
                }
            }
            else {
                setTest('');
                setTotalValue('')
            }
        })
    },[elementDocId,selectLocation,selectedRange,selectedInterval])

    useEffect(() => {
        renderTopTests();
    },[renderTopTests]);

    const renderItems = () => {
        return Tests.map((item,i)=>
        <StatsItem item_Name={item.test_name?item.test_name:'Test Error'} value={item.frequency/totalValue * 100} total={item.frequency} key={i}/>
        )
    }


return(
<Fragment>
     <div className='StatisticDiv'> 
        <h6 className='TreatmentTitle'> Top Tests</h6>
        <br/>
        <div className='TreamentList'>
        {Tests.length!==0 ? 
        <ol>
            {renderItems()}
        </ol> : 
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Tests'} />
    }
        </div>
     </div>
</Fragment>
)}


export default TopTests
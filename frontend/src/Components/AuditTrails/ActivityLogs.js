import React, {useContext, useEffect, useState}from 'react'
import {getActivityLogs, getAdminActivityLogs} from '../../Hooks/API'
import { downloadFile } from '../../Hooks/ImageAPI'
import { Card, Button, Spin } from 'antd';
import '../../Styles/AppointmentItem.css';
import { Divider } from '@material-ui/core';
import ActivityLogItem from '../AuditTrails/ActivityLogItem'
import { Fragment } from 'react';
import { GlobalContext } from '../../Context/GlobalState';

const ActivityLogs = () =>{
    const [loader, setLoader] = useState(true);
    const [activitiesList, setActivitesList] = useState([]);
    const {accountType, accountId, elementDocId} = useContext(GlobalContext)
      // Array of all activities 
    const allActivities = activitiesList;

    // State for the list
    const [list, setList] = useState([])

    // State of whether there is more to load
    const [hasMore, setHasMore] = useState('')

    const ActivityLogsAPI=()=>{
      if(accountType ==='doctors' || accountType==='nurses' || accountType==='fd' || accountType==='pa'){
        getActivityLogs(accountId).then((result)=>{
          console.log("Activity Logs result without if    ",result.length,result);
          if(result.code !== 404)
          {
              setActivitesList(result);
              setLoader(false);
              // console.log("Activity Logs result",result);
              let Lists=[...result.slice(0, 12)]
              setList(Lists)
              setHasMore(result.length > 12)
          }
      })
      }else{
        getAdminActivityLogs(accountId).then((result)=>{
          console.log("Activity Logs for admin    ",result.length,result, accountId);
          if(result.code !== 404)
          {
              setActivitesList(result);
              setLoader(false);
              // console.log("Activity Logs result",result);
              let Lists=[...result.slice(0, 12)]
              setList(Lists)
              setHasMore(result.length > 12)
          }
          else if(result.length !== 0)
          {
            setLoader(false);
          }
      })
      }
    }


    // Load more button click
    const Loadmore=()=>{
        if (hasMore) {
          const currentLength = list.length
          const isMore = currentLength < allActivities.length
          const nextResults = isMore
            ? allActivities.slice(currentLength, currentLength + 5)
            : []
          setList([...list, ...nextResults])
        }
          setHasMore(list.length < allActivities.length)
      }

    const renderActivityLogs =  () =>{
        return (
            <Fragment>
              {list.map((item,i)=>(
                <ActivityLogItem key={i} ActivityItem={item} image={image} />
              ))}
            </Fragment>
        )
    }

    const [image,setImage] = useState('');

    const showImage = () =>{
        downloadFile(accountType, accountId, 'profile')
            .then((json) => { 
              if(json)
              {
                setImage("data:image;charset=utf-8;base64," + json.encodedData); 
              }
            })
            .catch((error) => console.error(error))
            .finally(() => {
          });
    }

    useEffect(()=>{
        ActivityLogsAPI();
        showImage()
    },[accountId]);
    return(
          <Card size="small" style={{ width: '100%', textAlign: 'left' }}>
            <h5 className='TitleMain'>Activity Logs</h5>
            <Divider/>
            <br/>
            {loader? <div className='text-center'> <Spin/> </div>:<Fragment>
              {renderActivityLogs()}
            {hasMore ? 
                (
                  <div className="text-center">
                    <Button  style={{color:'grey', marginBottom:10, marginTop:2}} type='default' onClick={Loadmore}>Load More</Button>
                  </div>
                ) 
              : 
                (
                <p style={{color:'grey', marginBottom:3,marginTop:2}}>
                   <Divider/>
                  No more results
                  </p>
                )
              }
              </Fragment>}
          </Card>
        )
}
export default ActivityLogs 
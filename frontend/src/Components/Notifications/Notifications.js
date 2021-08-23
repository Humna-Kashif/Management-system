import React, { useContext, useEffect, useState } from 'react'
import { Scrollbars } from "react-custom-scrollbars";
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import { Button } from 'antd';
import { makeStyles } from '@material-ui/core/styles';
import NotificationsIcon from '@material-ui/icons/Notifications';
import './Notifications.css';
import { Fragment } from 'react';
import { showNotificationListAPI, saveNotificationStatus } from '../../Hooks/API';
import NotificationsList from './NotificationItem'
import { GlobalContext } from '../../Context/GlobalState';


const useStyles = makeStyles((theme) => ({

  drawer: {
    width: 300,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 300,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    background: '#e3464d',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
}));

const Notifications = ({ open, onClick }) => {
  const [doctorNotificationList, setDoctorNotificationList] = useState([]);
  const { accountId,elementDocId } = useContext(GlobalContext)

  // Array of all notifications 
  const allNotifications = doctorNotificationList

  // State for the list
  const [list, setList] = useState([])

  // State of whether there is more to load
  const [hasMore, setHasMore] = useState('')

  const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
      borderRadius: 3,
      backgroundColor: "#e0004d",
      width: 4
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };

  const CustomScrollbars = (props) => (
    <Scrollbars
      renderThumbVertical={renderThumb}
      {...props}
    />
  );


  const showNotification = (id) => {
    showNotificationListAPI(id, 0, 0, 0).then((result) => {
      console.log("Notification Results are ", result)
      if (!!result) {
          setDoctorNotificationList(result);
          let Lists = [...result.slice(0, 7)]
          console.log('Listingsss', Lists)
          setList(Lists)
          setHasMore(result.length > 7)
      }
      else {
        setDoctorNotificationList('');
      }
    })
  }

  const setNotificationStatus = (notification_Id, value) => {
    if (value != '') {
      saveNotificationStatus(elementDocId, 0, "PUT", 0, notification_Id, value).then(result => {
        console.log("Status Updated Succesfully", result);
        showNotification(elementDocId);
      });
    }
    else {
      console.log('eror in submission')
    }
  }
  // Load more button click
  const Loadmore = () => {
    if (hasMore) {
      const currentLength = list.length
      const isMore = currentLength < allNotifications.length
      const nextResults = isMore
        ? allNotifications.slice(currentLength, currentLength + 7)
        : []
      setList([...list, ...nextResults])
    }
    setHasMore(list.length < allNotifications.length)
  }

  useEffect(() => {
    showNotification(elementDocId);
  }, [elementDocId]);




  const classes = useStyles();

  const renderList = () => {
    console.log('render list console', list)
    return (
      list.map((data, i) => (
        <NotificationsList key={i} data={data} NotificationStatus={setNotificationStatus} />
      ))
    )
  }

  return (

    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={open}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>

        {/* <h6 className='HeadTitle'>  {doctorNotificationList.length} - Notifications </h6> */}
        <IconButton onClick={onClick} className='HeadBtn'>
          <ClearIcon />
        </IconButton>

      </div>
      <Divider />
      <div className='Notification-Container'>
        {list.length !== 0 ?
          <CustomScrollbars autoHide autoHideTimeout={500} autoHideDuration={200}>
            {renderList()}
            {hasMore ?
              (
                <Button size='small' style={{ color: 'grey', marginBottom: 10, marginTop: 2 }} type='default' onClick={Loadmore}>Load More</Button>
              )
              :
              (
                <p style={{ color: 'grey', marginBottom: 3, marginTop: 2 }}>
                  {/* <Divider/> */}
                  No more results
                </p>
              )
            }
          </CustomScrollbars>
          :
          <Fragment>
            <label className='EmptyMoment'> No Notifications Yet
              <br />
              <NotificationsIcon />
            </label>
          </Fragment>}

      </div>
    </Drawer>
  )
}


export default Notifications

Notifications.defaultProps = {
  doctorNotificationList: {
    image: '',
    name: "",
    notification_type: '',
    date_time: '',
    notification_date_time: ''
  }
}
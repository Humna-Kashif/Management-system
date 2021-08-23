import React, { useContext, useEffect, useState } from 'react'
import { getSessionsLogs } from '../../Hooks/API'
import { Card, Popover, Tooltip, Button, Spin } from 'antd';
import moment from 'moment'
import '../../Styles/AppointmentItem.css';
import { Divider } from '@material-ui/core';
import {
    BsDisplay,
    BsPhone,
    BsTabletLandscape
} from "react-icons/bs";
import { Fragment } from 'react';
import { GlobalContext } from '../../Context/GlobalState';

const SessionsLogs = () => {

    const [sessionsList, setSessionsList] = useState([]);
    const [loader, setLoader] = useState(true);
    // Array of all Sessions 
    const allSessions = sessionsList;
    // State for the list
    const [list, setList] = useState([])
    // State of whether there is more to load
    const [hasMore, setHasMore] = useState('')
    const { accountType, accountId, info, } = useContext(GlobalContext)


    const SessionsLogsAPI = () => {
        getSessionsLogs(accountId).then((result) => {
            if (result) {
                setSessionsList(result);
                // reLocations(result)
                setLoader(false)
                console.log("Sessions Logs result", result);
                let Lists = [...result.slice(0, 25)]
                setList(Lists)
                setHasMore(result.length > 25)
            }
        })
    }

    // Load more button click
    const Loadmore = () => {
        if (hasMore) {
            const currentLength = list.length
            const isMore = currentLength < allSessions.length
            const nextResults = isMore
                ? allSessions.slice(currentLength, currentLength + 5)
                : []
            setList([...list, ...nextResults])
        }
        setHasMore(list.length < allSessions.length)
    }

    const returnStatus = (value, id) => {
        if (value == null && id === info.session_id) {
            console.log("session id is ", id, info.session_id);
            return <h6 className='StatusActive'> Active Now</h6>
        }
    }

    function getOs(userAgent) {

        //Converts the user-agent to a lower case string
        userAgent = !!userAgent && userAgent.toLowerCase();

        //Fallback in case the operating system can't be identified
        var os = "Unknown OS Platform";

        //Corresponding arrays of user-agent strings and operating systems
        let match = [
            "windows nt 10",
            "windows nt 6.3",
            "windows nt 6.2",
            "windows nt 6.1", "windows nt 6.0", "windows nt 5.2", "windows nt 5.1", "windows xp", "windows nt 5.0", "windows me", "win98", "win95", "win16", "macintosh", "mac os x", "mac_powerpc", "android", "linux", "ubuntu", "iphone", "ipod", "ipad", "blackberry", "webos"];
        let result = ["Windows 10 PC", "Windows 8.1 PC", "Windows 8 PC", "Windows 7 PC", "Windows Vista PC", "Windows Server 2003/XP x64 PC", "Windows XP PC", "Windows XP PC", "Windows 2000 PC", "Windows ME PC", "Windows 98 PC", "Windows 95 PC", "Windows 3.11 PC", "Mac OS X PC", "Mac OS X PC", "Mac OS 9 PC", "Android Ph", "Linux PC", "Ubuntu PC", "iPhone Ph", "iPod Tab", "iPad Tab", "BlackBerry Ph", "Mobile Ph"];

        var browser = "Unknown Browser";

        //Corresponding arrays of user-agent strings and operating systems
        let match_browser = ["chrome", "firefox", "opera", "internet explorer",];
        let result_browser = ["Chrome", "Firefox", "Opera", "Internet Explorer"];

        //For each item in match array
        for (var i = 0; i < match.length; i++) {

            //If the string is contained within the user-agent then set the os 
            if (userAgent.indexOf(match[i]) !== -1) {
                os = result[i];
                break;
            }
        }

        //For each item in match array
        for (var i = 0; i < match_browser.length; i++) {

            //If the string is contained within the user-agent then set the os 
            if (!!userAgent.indexOf()) {
                if (userAgent.indexOf(match_browser[i]) !== -1) {
                    browser = result_browser[i];
                    break;
                }
            }
        }

        if (os.includes("Windows") || os.includes("Mac") || os.includes("Ubuntu") || os.includes("Linux")) {
            return <Fragment> <BsDisplay className='PanelIcon' /> <span className='PanelTitle'> {os} / {getBrowser(userAgent)} </span>  </Fragment>
        }
        else if (os.includes("BlackBerry") || os.includes("Android") || os.includes("Mobile") || os.includes("iPhone")) {
            return <Fragment> <BsPhone className='PanelIcon' /> <span className='PanelTitle'> {os}/Aibers App / {getBrowser(userAgent)} </span> </Fragment>
        }
        else if (os.includes("Tab")) {
            return <Fragment>
                <BsTabletLandscape className='PanelIcon' /> <span className='PanelTitle'> {os} / {getBrowser(userAgent)} </span>
            </Fragment>
        } else
            return <span className='PanelTitle'> {os} / {getBrowser(userAgent)} </span>



        //Return the determined os

    }

    function getBrowser(userAgent) {

        //Converts the user-agent to a lower case string
        var userAgent = userAgent.toLowerCase();


        var browser = "Unknown Browser";

        //Corresponding arrays of user-agent strings and operating systems
        let match_browser = ["chrome", "firefox", "opera", "internet explorer"];
        let result_browser = ["Chrome", "Firefox", "Opera", "Internet Explorer"];

        //For each item in match array
        for (var i = 0; i < match_browser.length; i++) {

            //If the string is contained within the user-agent then set the os 
            if (userAgent.indexOf(match_browser[i]) !== -1) {
                browser = result_browser[i];
                break;
            }
        }

        //Return the determined os
        return browser;
    }

    const renderSessionLogs = () => {
        return (list.map((item, i) => (
            <div style={{ display: "flex", flex: 1, marginTop: "10px" }}>
                <div style={{ display: "flex", flex: 5 }}>
                    <h6 style={{ marginBottom: 0 }}> {getOs(!!item.os_browser_info && item.os_browser_info)}</h6> -
                    <div>
                        <Tooltip title={`${item.ip_address}`} color='#e0004d'>
                            {item.ip_location}
                            {/* {reLocations(item.ip_address)} */}
                        </Tooltip>
                    </div>
                </div>
                <div style={{ display: "flex", flex: 4 }}>
                    <h6 className='cardSub'>
                        <i> SignedIn : </i>
                        <span className='statusLogout'>
                            <Popover content={` ${moment(item.login_timestamp).format("dddd, Do MMM, YYYY, h:mm:ss a")}`} placement='top'>
                                {moment(item.login_timestamp).month(0).from(moment().month(0))}
                            </Popover>
                        </span>
                    </h6>
                </div>
                <div style={{ display: "flex", flex: 3, flexDirection: "row-reverse" }}>
                    <h6>
                        <label> {returnStatus(item.logout_timestamp, item.session_id)} </label>
                    </h6>
                </div>
            </div>
        ))
        )
    }
    useEffect(() => {
        SessionsLogsAPI();
    }, [accountId]);
    return (
        <Card
            className="activity_card"
            size="small"
            style={{
                width: '100%',
                textAlign: 'left'
            }}>
            <div>
                <h5 className='TitleMain'>Sessions Logs</h5>
                <Divider />
                <br />
                {loader ? <div className='text-center'> <Spin /> </div> :
                    <Fragment>
                        {renderSessionLogs()}
                        {hasMore ?
                            (
                                <div className="text-center">
                                    <Button style={{ color: 'grey', marginBottom: 10, marginTop: 2 }} type='default' onClick={Loadmore}>Load More</Button>
                                </div>
                            )
                            :
                            (<p style={{ color: 'grey', marginBottom: 3, marginTop: 2 }}>
                                <Divider />
                                No more results
                            </p>)}
                    </Fragment>}
            </div>

        </Card>
    )
}


export default SessionsLogs
import React from 'react'
import { Progress } from 'antd';

const StatsItem = ({ item_Name, value, total }) => {
    console.log("Progress bar ", item_Name, value, total)
    return (
        <li className='ListItem'>
            <label > {item_Name} </label>
            <Progress percent={value} strokeLinecap="square" format={() => `${total}`} strokeColor="#e0004d" />
            <br />
        </li>
    )
}

export default StatsItem
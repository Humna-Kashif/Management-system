import React, { useCallback, useEffect, useState } from "react"
import { downloadFile } from '../../Hooks/ImageAPI'
import { Avatar } from "@material-ui/core";
import { Tooltip } from 'antd';

const ActivePatientImages = (props) => {
    console.log("Images data is ",props.item)
    const [image, setImage] = useState(null);

    const getActivePatientImage = useCallback( () => {
        if(!!props.item.image){
            downloadFile('patients', props.item.patient_id, 'profile')
            .then((json) => {
                setImage("data:image;charset=utf-8;base64," + json.encodedData);
            })
            .catch((error) => console.error(error))
            .finally(() => {
            })
        } else {
            console.log("Downloading Image Failed! image is null")
        }
    }, [props.item.image, props.item.patient_id])

    useEffect(() => {
        getActivePatientImage();
    }, [getActivePatientImage]);

    return(
        <Tooltip title={props.item.name} placement="left" trigger="hover">
            <Avatar src={image} style={styles.avatar}/>              
        </Tooltip>
    )
}

export default ActivePatientImages
const styles = {
    avatar: { height: "40px", width: "40px", display: "flex", border: '1px solid #e0004d', margin: 10 },
}
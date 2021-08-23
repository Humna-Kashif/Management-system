import React from "react"

import "../../Styles/PageLoading.scss";

const PageLoading = (props) => {
    return (
        <div style={{ height: "80vh", alignItems: "center", justifyContent: "center", display: "flex", ...props.style}}>
                <div style={{position: "relative"}}>
                    <img src={require('../../Images/aibers_in.png')} alt='heart heartbeat' className="heart heartbeat" style={{width:100, height:100, marginLeft:4, marginRight: 4, position: "absolute"}} />
                    <img src={require('../../Images/aibers_out.png')} alt='ring ringRotate' className="ring ringRotate" style={{width:100, height:100, marginLeft:4, marginRight: 4,}} />
                    {/* <div style={{paddingTop: 20, fontSize: 20, color: "#e0004d"}}>Loading! Please wait... </div> */}
                </div>
        </div>
    )
}

export default PageLoading;

PageLoading.defaultProps = {
    style: {}
}



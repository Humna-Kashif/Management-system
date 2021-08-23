import React from "react"

const TagItem = (props) => {
    const itemData = props.itemData
    console.log("symptoms data is in tags", itemData)
    
    return (
    <div className='TagsList'>
        <div >{itemData.name}</div>
        <div className='LabelCross' onClick={() => props.handleTag(itemData.name)}> x
        </div>
    </div>
    )
}

export default TagItem
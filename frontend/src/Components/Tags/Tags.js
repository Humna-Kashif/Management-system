import React from "react"
import TagItem from "./TagItem";

const Tags = (props) => {
    const TagsList=props.tagsList;
    console.log("Tags: Tags array: ", TagsList)
    const handleTag = (val) => {
        console.log("tag call back val: ", val)
        props.delete(val);
    }

    const renderTags = () => {
        return (
            props.tagsList.map((item, i) => 
                <TagItem handleTag={handleTag} itemData={item} key={i} />   
            )
        )
    }

    return (
        <div style={{display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap"}}>
            {renderTags()} 
        </div>
    )
}

export default Tags

Tags.defaultProps = {
    tagsList : []
}
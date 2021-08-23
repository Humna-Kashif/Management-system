import React from "react"
import { useState } from "react";

const InputDropDown = (props) => {

    const [input, setInput] = useState("");
    const [isSuggestion, setIsSuggestion] = useState(false);
    const suggestList = props.suggestList;
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            console.log("Input: ", input);
            props.onValueSelected(input);
            setInput("");
            setIsSuggestion(false)
        }
        console.log("New list:", suggestList, "incoming list: ", props.suggestList)
    }

    const handleDropDown = (item) => {
        console.log("Input: ", item);
        props.onValueSelected(item);
        setInput("");
        setIsSuggestion(false)
    }

    const renderDropdownItems = () => {
        console.log("suggestList is ", suggestList)
        return (
            suggestList.map((item, i) => (
                <div style={styles.dropdownItem} onClick={() => handleDropDown(item.name)}>{item.name}</div>
            ))
        )
    }

    const renderDropDown = () => {
        return (
            <div hidden={!isSuggestion} key={suggestList.length}
                style={styles.dropdownContainer}>
                {renderDropdownItems()}
            </div>
        )
    }

    return (
        <div style={{ position: "relative" }}>
            <input
                style={styles.input}
                placeholder={`Add ${props.title}...`}
                type="text"
                value={input}
                onKeyDown={handleKeyDown}
                noValidate
                // onBlur={() => setIsSuggestion(false)}
                onChange={e => {setInput(e.target.value); setIsSuggestion(true); props.onValueChange(e.target.value)}}
                />
            {renderDropDown()}
        </div>
    )
}

export default InputDropDown

InputDropDown.defaultProps = {
    title: "",
    suggestList: [],
    onValueChange: () => { }
}

const styles = {
    input: { fontSize: 14, padding: 8, borderRadius: "5px", boxShadow: "none", backgroundColor: '#fbfbfb' },
    dropdownContainer: {
        backgroundColor: "#f9f9f9",
        width: "98%",
        zIndex: 100,
        overflowY: "scroll",
        maxHeight: "170px",
        position: "absolute",
        right: 5,
        left: 5,
        paddingTop: '5px',
        borderColor: "#e0e0e0",
        borderStyle: "solid",
        borderTop: 'none',
        borderWidth: 0.6
    },
    dropdownItem: { padding: 4, paddingLeft: 8, borderBottomWidth: 0.6, borderBottomStyle: "solid", borderBottomColor: "#e8e8e8", color: 'rgb(107 105 105)', textTransfrom: 'Capitalize', fontSize: 14 }
}


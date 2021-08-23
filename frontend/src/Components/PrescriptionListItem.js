import React from "react";


const PrescriptionListItem = (props) => {
    const isUploaded = props.isUploaded;
    const itemData = props.itemData;
    const onItemPress = () => {
        console.log("onItemPressPresciption", itemData.title);
    };
  return (
    <div style={[props.containerStyle]}>
      <div onClick={onItemPress}>
          <div
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              paddingTop: 0,
              justifyContent: "space-between",
            }}
          >
            <div style={{ flex: 2 }}>{itemData.title}</div>

            <div
              style={{
                flexDirection: "row",
                flex: 1.2,
                justifyContent: "center",
              }}
            >
              <div>|| Day/Night</div>
            </div>
            <div
              style={{
                flexDirection: "row",
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              <div>250</div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default PrescriptionListItem

PrescriptionListItem.defaultProps = {
  itemData: {
    title: "title"
  }
}

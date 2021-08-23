import React from "react";
import { Avatar } from "@material-ui/core";


const CommentItem = (props) => {
  const data = props.commentData;

  return (
    <div style={{ padding: 10 }}>
      <div style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Avatar src={props.imageURL} style={styles.avatar} />
        <div style={{ flex: 1 }}>
          <div style={{ flexDirection: "row", paddingTop: 5, paddingRight: 10 }}>
            <div style={{ flex: 1, fontWeight: 'bold', fontSize: 16, opacity: 0.8 }}>{data.username}</div>
            <div style={{ opacity: 0.4, fontSize: 14, fontWeight: "bold" }}>{data.commentTime}</div>
          </div>
          <div>
            <div style={{ opacity: 0.6 }}>
              {data.commentdiv}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem

CommentItem.defaultProps = {
  commentData: {
    username: "",
    commentTime: "",
    commentdiv: ""
  },
  imageURL: ""
}

const styles = {

}
import React, { useState, Fragment } from "react"
import TestItem from "./TestItem";

const TestsList = (props) => {
    const currentData = props.data;
    const [TestsList, updateList] = useState(props.testsList);
    // props.parentList(TestsList);
    const handleTests = (val) => {
        console.log("tag call back val: ", val)
        props.delete(val);
        let newList = TestsList.slice(0);
        console.log("OldList:", TestsList, "Newlist: ", newList);
        newList.filter((c, i, a) => {
            if (c.name === val) {
                newList.splice(i, 1);
            }
        });
        console.log("OldList:", TestsList, "Newlist: deleted ", newList);
        updateList(newList)

    }

    const renderTests = () => {
        console.log("Render Test ", TestsList)
        let totalPrice = 0;
        if (TestsList.length !== 0) {
            for (let i = 0; i < TestsList.length; i++) {
                totalPrice += TestsList[i].price_in_pkr;
            }
            props.amount(totalPrice);
            // totalPriceCount+=totalPrice;
        }
        return (
            <Fragment>
                {TestsList.map((item, i) =>
                    <TestItem handleTest={handleTests} data={currentData} itemData={item} key={i} refreshList={props.refreshList} />
                )}
                <tr>
                    <td colSpan='5' style={{textAlign:'right'}}>
                        <label className='MedPriceLabel' style={{marginRight:'47px'}}>Total (Estd.): <b> {totalPrice} </b> PKR </label>
                    </td>
                </tr>
            </Fragment>
        )
    }


    return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, flexWrap: "wrap", marginTop: 8 }}>
            { TestsList.length !== 0 &&
                <Fragment>
                    <table className="table table-bordered ListData mtt-20">
                        <thead>
                            <tr>
                                <th>Test</th>
                                <th>Result</th>
                                <th>Option</th>
                                <th>Remove</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderTests()}
                        </tbody>
                    </table>
                </Fragment>
            }
        </div>
    )
}

export default TestsList

TestsList.defaultProps = {
    TestsList: [],
    refreshList: () => { }
}
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import moment from 'moment';
import Empty from '../Styles/Assets/empty.png'

const VitalsChart = (props) => {
    // const data = props.data[0];
    const [data, setData] = useState(-1);
    const [vitalId,setVitalId] = useState('');
    const [chartData, setChartData] = useState({});
    const SugarGen = !!props.data[0] && props.data[0].vital_id ===7  && props.data[0].vital_data.filter( (list) => list.current_value.includes("(G)"));
    const sugarF = !!props.data[0] && props.data[0].vital_data.filter( (list) => list.current_value.includes("(F)"))
    console.log("vitals charts component", props.data);
    console.log("vitals charts component for filtering G", SugarGen);
    console.log("vitals charts component for filtering F", sugarF);
    let observedRange = [];
    let normalRange = [];
    let datesArray = [];
    let diastolicArray = [];
    let systolicArray = [];
    let diastolicNormalArray = [];
    let systolicNormalArray = [];
    let gen =[];
    let fast =[]; 
    let genNormal =[];
    let fastNormal =[];
    const [generalVal, setGenVal] = useState([])
    const [fastVal, setFastVal] = useState([])
    // const [observedRange,setObservedRange] = useState([]);
    // const [normalRange,setNormalRange] = useState([]);
    // const [datesArray,setDatesArray] = useState([]);
    const prepareChartData = (data) => {
        let observed = [];
        let normal = [];
        let dates = [];
        let diastolic =[];
        let systolic =[];
        let diastolicNormal =[];
        let systolicNormal =[];
        let sugarValues =[];
        let sugarFasting =[];
        let sugarGeneral =[];
        let generalNormal =[];
        let fastingNormal =[];
        let sugarData =[];
       


        for (var i = 0; i < data[0].vital_data.length; i++) {
            dates.push(moment(data[0].vital_data[i].date_time).format('LL'))
            observed.push(!!data[0].vital_data[i].current_value ? parseInt(data[0].vital_data[i].current_value) : 0)
            normal.push(!!data[0].vital_info.normal_range ? parseInt(data[0].vital_info.normal_range) : 0)
            systolic.push((data[0].vital_id === 3 && data[0].vital_data[i].current_value.split('/')) ? parseInt(data[0].vital_data[i].current_value.split('/')[0]) : 0)
            diastolic.push((data[0].vital_id === 3 && data[0].vital_data[i].current_value.split('/')) ? parseInt(data[0].vital_data[i].current_value.split('/')[1]) : 0)
            systolicNormal.push((data[0].vital_id === 3 && data[0].vital_info.normal_range.split('/')) ? parseInt(data[0].vital_info.normal_range.split('/')[0]) : 0)
            diastolicNormal.push((data[0].vital_id === 3 && data[0].vital_info.normal_range.split('/')) ? parseInt(data[0].vital_info.normal_range.split('/')[1]) : 0)
            sugarValues.push((data[0].vital_id === 7 && !!data[0].vital_data[i].current_value) ? data[0].vital_data[i].current_value : 0)
            generalNormal.push((data[0].vital_id === 7 && data[0].vital_info.normal_range.split('-')) ? parseInt(data[0].vital_info.normal_range.split('-')[1]) : 0)
            fastingNormal.push((data[0].vital_id === 7 && data[0].vital_info.normal_range.split('-')) ? parseInt(data[0].vital_info.normal_range.split('-')[0]) : 0)
            
        }
        console.log("a ", observed, " b ", dates, " c ", normal, 'diastolic',diastolic,systolic,"systolic", 'sugar  values are', generalNormal);
    diastolicArray = diastolic.reverse();
    systolicArray = systolic.reverse();
    systolicNormalArray = systolicNormal.reverse();
    diastolicNormalArray = diastolicNormal.reverse();
    observedRange = observed.reverse();
    normalRange = normal.reverse();
    datesArray = dates.reverse();
    genNormal = generalNormal.reverse();
    fastNormal = fastingNormal.reverse()
    sugarData = sugarValues.reverse()

    if(data[0]. vital_id === 7){
    sugarGeneral = !!sugarData && sugarData.filter(list => list.includes("(G)"))
    sugarFasting = !!sugarData &&  sugarData.filter(list => list.includes("(F)"))
    gen = sugarGeneral.map((item,i) => parseInt(item.split('('))? parseInt(item.split('(')[0]) : 0)
    fast = sugarFasting.map((item,i) => parseInt(item.split('('))? parseInt(item.split('(')[0]) : 0)
    console.log("a ", observed, " b ", dates, " c ", normal, 'diastolic',diastolic,systolic,"systolic", 'sugar  values are', sugarFasting, 'sugar  values are splitting', gen);
    }
  

}

useEffect(() => {
    if(!!props.data[0]){
        setVitalId(props.data[0].vital_id);
    }
    // setData();
    if (props.data.length > 0) {
        console.log("Vital Chart Data ", props.data[0].vital_id);
        if (props.data[0].vital_id !== data) {
            prepareChartData(props.data);
            console.log("Arrays ", datesArray, " ", observedRange, " ", normalRange);
            chart();
            setData(props.data[0].vital_id);
        }
    }
}, []);

    const chart = () => {
        console.log("Chart Array", datesArray, " ", observedRange, " ", normalRange);
        let empSal = datesArray;
        let empAge1 = observedRange;
        let empAge2 = normalRange;
        if(props.data[0].vital_id === 3){
            console.log('Vital Id is selected Vital Id 3 is selected')
            setChartData({
                labels: empSal,
                datasets: [
                    {
                        label: "Observed Diastolic",
                        data: diastolicArray,
                        borderColor: "rgba(255, 0, 0)",
                        backgroundColor: ["rgba(255, 0, 0, 0.6)"],
                        fill: false,
                        borderWidth: 4
                    },
                    {
                        label: "Diastolic Normal Range",
                        data: diastolicNormalArray,
                        borderColor: "rgba(75, 182, 180)",
                        backgroundColor: ["rgba(75, 182, 180, 0.6)"],
                        fill: false,
                        borderWidth: 2
                    },
                    {
                        label: "Systolic Normal Range",
                        data: systolicNormalArray,
                        borderColor: "#FFD027",
                        backgroundColor: ["rgba(75, 182, 180, 0.6)"],
                        fill: false,
                        borderWidth: 2
                    },
                    {
                        label: "Observed Systolic",
                        data: systolicArray,
                        borderColor: "#162C9a",
                        backgroundColor: ["rgba(255, 0, 0, 0.6)"],
                        fill: false,
                        borderWidth: 4
                    },
                   
                ]
            });
        }
        else if(props.data[0].vital_id === 7){
            console.log('Vital Id is selected Vital Id 7 is selected')
            setChartData({
                labels: empSal,
                datasets: [
                    {
                        label: "Observed General",
                        data: gen,
                        borderColor: "rgba(255, 0, 0)",
                        backgroundColor: ["rgba(255, 0, 0, 0.6)"],
                        fill: false,
                        borderWidth: 4
                    },
                    {
                        label: "General Normal Range",
                        data: genNormal,
                        borderColor: "rgba(75, 182, 180)",
                        backgroundColor: ["rgba(75, 182, 180, 0.6)"],
                        fill: false,
                        borderWidth: 2
                    },
                    {
                        label: "Fasting Normal Range",
                        data: fastNormal,
                        borderColor: "#FFD027",
                        backgroundColor: ["rgba(75, 182, 180, 0.6)"],
                        fill: false,
                        borderWidth: 2
                    },
                    {
                        label: "Observed Fasting",
                        data: fast,
                        borderColor: "#162C9a",
                        backgroundColor: ["rgba(255, 0, 0, 0.6)"],
                        fill: false,
                        borderWidth: 4
                    },
                   
                ]
            });
        }
        else{
            console.log('Vital Id is selected',props.data[0].vital_id)
            setChartData({
                labels: empSal,
                datasets: [
                    {
                        label: "Observed",
                        data: empAge1,
                        borderColor: "rgba(255, 0, 0)",
                        backgroundColor: ["rgba(255, 0, 0, 0.6)"],
                        fill: false,
                        borderWidth: 4
                    },
                    {
                        label: "Normal Range",
                        data: empAge2,
                        borderColor: "rgba(75, 182, 180)",
                        backgroundColor: ["rgba(75, 182, 180, 0.6)"],
                        fill: false,
                        borderWidth: 2
                    },
                
                ]
            });
         }
    }

    return (
        <div className="ChartsDiv">
            {props.data.length > 0 ?
                <div>
                    <div>
                        <Line
                            data={chartData}
                            options={{
                                responsive: true,
                                interaction:
                                {
                                    mode: 'index'
                                },
                                stacked: false,
                                plugins: {
                                    title:
                                    {
                                        display: true,
                                        text: 'Chart.js Line Chart - Multi Axis'
                                    }
                                },
                                title: {
                                    text: "Vitals Observed Visualization",
                                    display: true
                                },
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            autoSkip: true,
                                            maxTicksLimit: 10,
                                            beginAtZero: true
                                        },
                                        gridLines: {
                                            drawOnChartArea: false,
                                        }
                                    },],
                                    yAxes2: [{
                                        ticks: {
                                            autoSkip: true,
                                            maxTicksLimit: 6,
                                            beginAtZero: true
                                        },
                                        gridLines: {
                                            drawOnChartArea: false,
                                        }
                                    },],
                                    xAxes: [{
                                        gridLines: {
                                            drawOnChartArea: false,
                                        }
                                    }]
                                }
                            }}
                        />
                    </div>
                </div>
                :
                <div className='text-center'>
                    <img src={Empty} className='EmptyImg' />
                    <br />
                    <label className='EmptyLabel'> No Data Found </label>
                </div>
            }
        </div>
    );

}
export default VitalsChart
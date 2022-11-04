import React, {useState} from "react";
import './FlowLogs.css';
import {FiAlertTriangle} from "react-icons/fi";
import {VscError} from "react-icons/vsc";
import {AiOutlineCheckCircle} from "react-icons/ai";
import JsonStringify from "../elements/misc/JsonStingify";
import DateValue from "../elements/misc/DateValue";
import PropertyField from "../elements/details/PropertyField";

const Row = ({log}) => {

    const [showDetails, setShowDetails] = useState(false);

    const Icon = ({type}) => {
        let icon;
        if(type === 'warning') {
            icon = <FiAlertTriangle size={25} style={{color: 'orange', marginRight: 5}}/>
        } else if (type === 'error') {
            icon = <VscError size={25} style={{color: 'red', marginRight: 5}}/>
        } else {
            icon = <AiOutlineCheckCircle size={25} style={{color: 'green', marginRight: 5}}/>
        }

        return <span style={{minWidth: 35, display: "flex", alignItems: 'center'}}>{icon}</span>
    }

    return <div className="FlowLogRow" onClick={()=>setShowDetails(!showDetails)}>
        <PropertyField name="Date" content={<><Icon type={log.type}/><DateValue date={log.metadata.timestamp}/></>}></PropertyField>
        <PropertyField name="Origin" content={log.origin}></PropertyField>
        <PropertyField name="Module" content={log.module}></PropertyField>
        <PropertyField name="Class" content={log.class_name}></PropertyField>
        {log?.flow_id && <PropertyField name="Flow" content={log.flow_id}></PropertyField>}
        {log?.event_id && <PropertyField name="Event" content={log.event_id}></PropertyField>}
        {log?.profile_id && <PropertyField name="Profile" content={log.profile_id}></PropertyField>}
        <fieldset>
            <legend>Message</legend>
            {log.message}
        </fieldset>
        {showDetails && <div className="FlowLogDetails">
            <fieldset style={{width: "100%", margin: 5, padding: 10}}>
                <legend>Traceback</legend>
                <JsonStringify data={{module:log.module, class: log.class_name, traceback: log.traceback}}/>
            </fieldset>

        </div>}
    </div>
}

const FlowLogs = ({logs}) => {

    return <div className="FlowLog">
        <div className="FlowLogHeader">Message</div>
        <div className="FlowLogRows">
            {Array.isArray(logs) && logs.map((log, index)=> {
                return <Row
                    key={index}
                    log={log}
                />
            })}
        </div>
    </div>

}

export default FlowLogs;
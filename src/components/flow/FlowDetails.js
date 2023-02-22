import FlowNode from "./FlowNode";
import FlowNodeWithEvents from "./FlowNodeWithEvents";
import StartNode from "./StartNode";
import CondNode from "./CondNode";
import React, {Suspense, useCallback, useEffect, useState} from "react";
import {asyncRemote, getError} from "../../remote_api/entrypoint";
import CenteredCircularProgress from "../elements/progress/CenteredCircularProgress";
import {Background, useEdgesState, useNodesState} from 'reactflow';
import {connect} from "react-redux";
import {showAlert} from "../../redux/reducers/alertSlice";
import './FlowEditor.css'

const nodeTypes = {
    flowNode: FlowNode,
    flowNodeWithEvents: FlowNodeWithEvents,
    startNode: StartNode,
    condNode: CondNode
};

const ReactFlow = React.lazy(() => import('reactflow'))


export function FlowDisplay({showAlert, id}) {

    const [flowLoading, setFlowLoading] = useState(false);
    const [nodes, setNodes, handleNodesChange] = useNodesState([]);
    const [edges, setEdges, handleEdgesChange] = useEdgesState([]);

    const updateFlow = useCallback((data) => {
        if (data) {
            if (data?.flowGraph) {
                setNodes(data.flowGraph.nodes)
                setEdges(data.flowGraph.edges)
            }
        } else if (data === null) {
            // Missing flow
            if (showAlert) {
                showAlert({message: "This workflow is missing", type: "warning", hideAfter: 2000});
            } else {
                alert("This workflow is missing")
            }
        }
    }, [setNodes, setEdges, showAlert]);

    useEffect(() => {
        setFlowLoading(true);
        let isSubscribed = true;
        asyncRemote({
            url: "/flow/production/" + id,
        }).then(response => {
            if (response && isSubscribed === true) {
                if (response?.data?.flowGraph) {

                    updateFlow(response?.data)
                }
            }
        }).catch(e => {
            if (e && isSubscribed === true) {
                const errors = getError(e)
                showAlert({message: errors[0].msg, type: "error", hideAfter: 4000});
            }
        }).finally(() => {
            if (isSubscribed === true) setFlowLoading(false)
        })

        return () => {
            isSubscribed = false
        }
    }, [id, showAlert])

    return <div style={{flex: 1, height: "inherit"}}>
        {flowLoading && <CenteredCircularProgress/>}
        <Suspense fallback={<CenteredCircularProgress/>}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                zoomOnDoubleClick={false}
                zoomOnScroll={false}
                panOnScroll={true}
                snapToGrid={true}
                nodeTypes={nodeTypes}
                nodesDraggable={false}
                style={{background: "white"}}
                defaultViewport={{ x: 100, y: 100, zoom: 1 }}
            >
                <Background color="#555" gap={16}/>
            </ReactFlow>
        </Suspense>
    </div>
}

const mapProps = (state) => {
    return {
        notification: state.notificationReducer,
    }
};
export default connect(
    mapProps,
    {showAlert}
)(FlowDisplay)
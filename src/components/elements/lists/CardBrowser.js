import React, {useEffect, useState} from "react";
import './CardBrowser.css';
import CenteredCircularProgress from "../../elements/progress/CenteredCircularProgress";
import FormDrawer from "../../elements/drawers/FormDrawer";
import FilterAddForm from "../../elements/forms/inputs/FilterAddForm";
import {TuiForm, TuiFormGroup, TuiFormGroupContent, TuiFormGroupField, TuiFormGroupHeader} from "../tui/TuiForm";
import ErrorsBox from "../../errors/ErrorsBox";
import {getError} from "../../../remote_api/entrypoint";
import {isEmptyObjectOrNull} from "../../../misc/typeChecking";
import NoData from "../misc/NoData";
import {BsGrid, BsList} from "react-icons/bs";
import IconButton from "../misc/IconButton";
import {BsStar} from "react-icons/bs";
import {useRequest} from "../../../remote_api/requestClient";

const CardBrowser = ({
                         label,
                         description,
                         urlFunc,
                         cardFunc,
                         rowFunc = null,
                         buttonLabel = null,
                         buttonIcon,
                         drawerDetailsWidth = 600,
                         detailsFunc = () => {},
                         drawerAddWidth = 600,
                         addFunc = () => {},
                         className,
                         refresh: forceRefresh,
                         defaultLayout="cards",
                         noDataInfo,
                     }) => {

    const Content = ({query, onClick, urlFunc, refresh, forceRefresh}) => {

        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(false);
        const [errors, setErrors] = useState(null);
        const [layoutVert, setLayoutVert] = useState(defaultLayout!=="cards");
        const [noLicense, setNotLicense] = useState(false)

        const {request} = useRequest()

        useEffect(() => {
                setData(null);
                const url = urlFunc(query)
                setLoading(true);
                setNotLicense(false)
                let isSubscribed = true
                request({url})
                    .then((response) => {
                        if (response && isSubscribed) {
                            setData(response.data);
                        }
                    })
                    .catch((e) => {
                        if(e?.response?.status === 402) {
                            setNotLicense(true)
                        }
                        if (e && isSubscribed) {
                            setErrors(getError(e))
                        }
                    })
                    .finally(() => {
                            if (isSubscribed) {
                                setLoading(false);
                            }
                        }
                    )
                return () => {
                    isSubscribed = false
                }
            }
            , [query, refresh, urlFunc, forceRefresh])

        if (loading) {
            return <CenteredCircularProgress/>
        }

        if (!loading && isEmptyObjectOrNull(data?.grouped)) {
            if (noLicense === true) {
                return <NoData header="This feature requires license." icon={<BsStar size={50}/>}>
                    <p>Please contact Tracardi for a license key.</p>
                </NoData>
            }
            return <NoData header="There is no data here.">
                <p>{noDataInfo ? noDataInfo : "Please click create button in the upper right corner."}</p>
            </NoData>
        }

        if (!loading && !isEmptyObjectOrNull(data?.grouped))
            return <TuiForm style={{margin: 20, marginTop: 0}}>
                <TuiFormGroup fitHeight={true}>
                    <TuiFormGroupHeader header={label} description={description}/>
                    <TuiFormGroupContent>
                        <TuiFormGroupField>
                            {cardFunc && rowFunc && <div style={{display: "flex", justifyContent: "flex-end", color: "#333"}}>
                                <IconButton onClick={()=>setLayoutVert(false)} selected={!layoutVert}>
                                    <BsGrid size={20}/>
                                </IconButton>
                                <IconButton onClick={()=>setLayoutVert(true)} selected={layoutVert}>
                                    <BsList size={20}/>
                                </IconButton>
                            </div>}
                            <section className={className} style={{display: "flex", flexWrap: "wrap", width: "100%"}}>
                                {!layoutVert && data && cardFunc && cardFunc(data, onClick)}
                                {layoutVert  && data && rowFunc && rowFunc(data, onClick)}
                                {errors && <ErrorsBox errorList={errors}/>}
                            </section>
                        </TuiFormGroupField>
                    </TuiFormGroupContent>
                </TuiFormGroup>
            </TuiForm>
    }

    const Container = ({forceRefresh}) => {

        const [cardId, setCardId] = useState(null);
        const [displayAddForm, setDisplayAddForm] = useState(false);
        const [refresh, setRefresh] = useState(forceRefresh || 0);
        const [query, setQuery] = useState(null);

        const handleFilter = (query) => {
            setQuery(query);
        }

        const handleCloseAdd = () => {
            setDisplayAddForm(false);
            setRefresh(refresh + 1);
        }

        const handleOpenAdd = () => {
            setDisplayAddForm(true)
        }

        const handleCloseDetails = () => {
            setCardId(null);
            setRefresh(refresh + 1);
        }

        return <div className="CardBrowser">

            <FilterAddForm
                style={{margin: "0 20px", marginTop: 5}}
                textFieldLabel="Type to filter"
                buttonLabel={buttonLabel}
                buttonIcon={buttonIcon}
                onFilter={handleFilter}
                onAdd={handleOpenAdd}/>

            <Content
                query={query}
                onClick={(id) => setCardId(id)}
                urlFunc={urlFunc}
                refresh={refresh}
                forceRefresh={forceRefresh}
            />

            <FormDrawer
                width={drawerDetailsWidth}
                onClose={handleCloseDetails}
                open={cardId !== null}>
                {cardId && detailsFunc(cardId, handleCloseDetails)}
            </FormDrawer>

            <FormDrawer
                width={drawerAddWidth}
                onClose={handleCloseAdd}
                open={displayAddForm}>
                {addFunc && buttonLabel && addFunc(handleCloseAdd)}
            </FormDrawer>

        </div>
    }

    return <Container forceRefresh={forceRefresh}/>

}

export default CardBrowser;
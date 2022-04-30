import { useState, useEffect, useMemo } from 'react'

// react hot toast
import { toast, Toaster } from 'react-hot-toast'

// axios
import axios from '../config/axios.config'

// globalStore
import { useGlobalStore } from '../store/useStore'

// validators
import validators from '../utils/validator'

// isMobile

// states 
import NaijaStates from 'naija-state-local-government';

// router
import { useRouter } from 'next/router'

// Skeleton
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


// useLiveFeed
import useLiveFeed from '../hooks/useLiveFeed'

// google places autocomplete
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';

//import date dns
import { format } from 'date-fns'

// Modal
import Modal from 'rsuite/Modal'


// Button Group
import ButtonGroup from 'rsuite/ButtonGroup'
import IconButton from 'rsuite/IconButton'
import Button from 'rsuite/Button';
import ButtonToolbar from 'rsuite/ButtonToolbar';

// import link
import Link from "next/link"






//init function
const Home = () => {

    // init router
    const router = useRouter()

    // init state
    const [stateList, setStateList] = useState([])

    // init lgaList
    const [lgaList, setLgaList] = useState([])

    // init selected State
    const [selectedState, setSelectedState] = useState("")

    // init selectedLga
    const [selectedLga, setSelectedLga] = useState("")

    // invoke useLiveFeed
    const { data, isLoading, isError } = useLiveFeed()

    console.log(data && data.data)


    // init useEffect
    useEffect(() => {

        // check if error
        if (isError) {
            return toast.error("Oops! an error has occurred")
        }


        // update stateList
        setStateList(NaijaStates.all())

    }, [])


    // init formattedAddress
    const [formattedAddress, setFormattedAddress] = useState({})

    // init addressLoading
    const [addressLoading, setAddressLoading] = useState(false)

    // init weather
    const [openWeather, setOpenWeather] = useState(false);

    // init openResponseModal
    const [openResponseModal, setOpenResponseModal] = useState(false)

    // init weatherLocation
    const [weatherLocation, setWeatherLocation] = useState({})

    // init weatherLocationArr
    const [weatherLocationArr, setWeatherLocationArr] = useState([])

    // init isSearchLoading state 
    const [isSearchLoading, setIsSearchLoading] = useState(false)

    // init isResponseLoading
    const [isResponseLoading, setIsResponseLoading] = useState(false)

    // init alertList
    const [alertList, setAlertList] = useState([])

    // init alertId
    const [alertId, setAlertId] = useState("")

    // init showAlert state
    const [showAlert, setShowAlert] = useState(false)

    // init showNemaContact
    const [showNemaContact, setShowNemaContact] = useState(false)



    // ======RESPONSE FORM STATE
    // init fullName state
    const [fullName, setFullName] = useState("")

    // init phone
    const [phoneNumber, setPhoneNumber] = useState("")

    // init address
    const [locationAddress, setLocationAddress] = useState({})

    // init isAffected
    const [isAffected, setIsAffected] = useState(null)





    // init handleAddress
    const handleAddress = async () => {
        try {

            // update addressLoading
            setAddressLoading(true)

            // init address
            const address = formattedAddress.label

            // get latitude and longitude
            const results = await geocodeByAddress(address)

            // get lat lng
            const { lat, lng } = await getLatLng(results[0])

            // make request to request to fetch api
            const response = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=0233d84416ab4098ba0142642221202&q=${lat},${lng}&days=7&aqi=no&alerts=no`)

            // check if not success
            if (response.status !== 200) {
                setAddressLoading(false)
                return toast.error("Error getting weather forecast")
            }

            // open weather modal
            setOpenWeather(true)

            console.log(response.data)

            // init forecast
            const forecastLocation = response.data && response.data.location

            // init foreCast
            const foreCast = response.data && response.data.forecast

            // init foreCastArray
            const foreCastArr = [...foreCast.forecastday]

            // update weatherLocation
            setWeatherLocation(forecastLocation)

            // update weatherLocationArr
            setWeatherLocationArr(foreCastArr)

            console.log(forecastLocation)
            console.log(foreCastArr)

            // update addressLoading
            setAddressLoading(false)

        } catch (error) {
            // update addressLoading
            setAddressLoading(false)
            console.log(error)
            return toast.error("Oops! failed to fetch address")
        }
    }





    // init handleSelectedState
    const handleSelectedState = (selected_state) => {

        // init selected_state 
        const lga = NaijaStates.lgas(selected_state)

        // update setSelectedState 
        setSelectedState(selected_state)

        // update lgaList
        setLgaList(lga.lgas)
    }






    // init handleSearch function
    const handleSearch = async () => {
        try {

            // init searchLoading
            setIsSearchLoading(true)

            // init alertData
            const alertData = {
                state: selectedState,
                lga: selectedLga
            }


            // validate
            if (!alertData.state) {
                setIsSearchLoading(false)
                return toast.error("Please select state")
            }

            if (!alertData.lga) {
                setIsSearchLoading(false)
                return toast.error("Please select LGA")
            }


            // make api request to fetch alerts
            const response = await axios.post(`${process.env.API_ROOT}/query/alerts`, alertData)


            // if not success
            if (!response.data.success) {
                setIsSearchLoading(false)
                return response.data.message
            }


            // init alert list
            const _alertList = response.data.data

            // update alertList
            setAlertList(_alertList)

            // set show alert to true
            setShowAlert(true)

            return setIsSearchLoading(false)


        } catch (error) {
            setIsSearchLoading(false)
            console.log(error)
            return toast.error("Oops! an error has occurred")
        }
    }




    // init handleOpenResponseModal
    const handleOpenResponseModal = (alertId) => {

        // update alertId
        setAlertId(alertId)

        // update response modal
        setOpenResponseModal(true)

    }




    // init handleCreateResponse function: People fill the response form to create response and then display Nema contact details
    const handleCreateResponse = async () => {
        try {

            setIsResponseLoading(true)

            // get responseData
            const responseData = {
                fullName: fullName,
                phoneNumber: phoneNumber,
                isAffected: isAffected,
                formattedAddress: locationAddress && locationAddress.label ? locationAddress.label : ""
            }


            // validate
            const error = validators.createResponseValidator(responseData)

            // check if error
            if (error) {
                setIsResponseLoading(false)
                return toast.error(error, { style: { maxWidth: 500 } })
            }


            // update responseData
            responseData.isAffected = isAffected === "yes" ? true : false

            // geocode address
            const results = await geocodeByAddress(responseData.formattedAddress)

            // get lat lng
            const { lat, lng } = await getLatLng(results[0])

            
            // update responseData
            responseData['latitude'] = lat
            responseData['longitude'] = lng


            // make request to create response
            const response = await axios.post(`${process.env.API_ROOT}/create/alert/response/${alertId}`, responseData)


            // check if no success
            if(!response.data.success) {
                return toast.error(response.data.message)
            }

            // show success
            toast.success("Response sent successfully")

            // update responseLoading
            setIsResponseLoading(false)

            // clear
            setFullName("")
            setPhoneNumber("")
            setLocationAddress({})

            // // close currentModal
            setOpenResponseModal(false)

            // update showNemaContact
           return setShowNemaContact(true)



        } catch (error) {
            setIsResponseLoading(false)
            console.log(error)
            return toast.error("Oops! an error has occurred")
        }
    }



    return (
        <>
            <Toaster />
            <section className="section-padding pt-5 pb-0 mt-3">
                <div className="container pb-5 text-center text-md-start">
                    <div className="row">
                        <div className="col-12 col-md-6 mx-auto px-3 px-md-3 px-lg-3">
                            <div className="mb-4">
                                {/* <input type="text" className="form-control form-input" onChange={(event) => setWeatherQuery(event.target.value)} value={weatherQuery} placeholder="Search by town/city" /> */}
                                {useMemo(() => <GooglePlacesAutocomplete
                                    autocompletionRequest={{ componentRestrictions: { country: "ng" } }}
                                    apiOptions={{ region: "ng", language: 'en' }}
                                    apiKey={process.env.googleApiKey}
                                    selectProps={{
                                        formattedAddress,
                                        onChange: setFormattedAddress,
                                    }}
                                />, [])}


                                {addressLoading ? <button className="mt-2 btn btn-primary-color btn-normal fw-bold text-white btn-lg btn-text text-center text-md-start" disabled>Please wait...</button>

                                    :
                                    <>
                                        {formattedAddress && formattedAddress.label ?
                                            <button onClick={() => handleAddress()} className="mt-2 btn btn-primary-color btn-normal fw-bold text-white btn-lg btn-text text-center text-md-start">Forecast <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                fill="currentColor"
                                                className="bi bi-search ms-2"
                                                viewBox="0 0 16 16"
                                            >
                                                <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"></path>
                                            </svg></button>

                                            :
                                            <button className="mt-2 btn btn-primary-color btn-normal fw-bold text-white btn-lg btn-text text-center text-md-start" disabled>Forecast <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                fill="currentColor"
                                                className="bi bi-search ms-2"
                                                viewBox="0 0 16 16"
                                            >
                                                <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"></path>
                                            </svg></button>
                                        }
                                    </>
                                }
                            </div>
                        </div>



                    </div>
                </div>

                <div className="container pb-5 text-center text-md-start py-5 px-3">
                    <div className="row pb-5">
                        {/* Live feed */}
                        <div className="col-md-5" >
                            <h3 className="text-center primary-text-color fs-4">VERIFIED FLOOD DISASTER REPORTS</h3>
                            <div className="mt-3" style={{ height: 500, overflowY: "auto", overflowX: "hidden" }}>
                                <div className="row mt-4">
                                    {isLoading ? <>

                                        <Skeleton height="80px" count={2} className="mt-2" />

                                    </> :

                                        <>
                                            {data && data.data && [...data.data].length > 0 && [...data.data].map((feed, index) => {
                                                return <div key={index} className="col-12 mb-2">
                                                    <div className="card">
                                                        <div className="card-body">
                                                            <h4 className="mb-2 primary-text-color text-center text-md-start" style={{ fontSize: 18 }}>{feed.fullName}</h4>
                                                            <p className="mb-0 primary-text-color hero-desc text-center text-md-start pe-md-5" style={{ fontSize: 15 }}>{feed.reportMessage}</p>
                                                            <p className="mb-0 text-muted hero-desc text-center text-md-start pe-md-5" style={{ fontSize: 10 }}>{`${feed.state}/${feed.lga}`}</p>
                                                            <p className="mb-0 text-muted hero-desc text-right text-md-start pe-md-5 align-items-right" style={{ fontSize: 10 }}>{format(new Date(feed.createdAt), "yyyy-MMM-dd HH:ss aaa")}</p>
                                                        </div>
                                                    </div>

                                                </div>
                                            })}
                                        </>}
                                </div>
                            </div>
                        </div>



                        {/* Alert */}
                        <div className="col-md-7 mt-md-0">
                            <h3 className="text-center primary-text-color mb-4 fs-4">ALERTS</h3>
                            <div className="row">
                                <div className="col-12 col-md-8 mx-auto">
                                    <div className="mb-4">
                                        <select className={`form-select form-input text-truncate`} onChange={(event) => handleSelectedState(event.target.value)}>
                                            <option value="" className="text-muted">Please Select State</option>
                                            {stateList && stateList.length > 0 && stateList.map((state, index) => {
                                                return <option key={index} value={state.state}>{state.state}</option>
                                            })}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <select className={`form-select form-input text-truncate`} onChange={(event) => setSelectedLga(event.target.value)}>
                                            <option value="" className="text-muted">Please Selected LGA</option>
                                            {lgaList && lgaList.length > 0 && lgaList.map((lga, index) => {
                                                return <option key={index} value={lga}>{lga}</option>
                                            })}
                                        </select>
                                    </div>

                                    <div className="mb-4 text-center">
                                        {isSearchLoading ? <button className="mt-2 btn btn-primary-color btn-normal fw-bold text-white btn-lg btn-text text-center text-md-start" disabled>Please wait...</button> :
                                            <button className="mt-2 btn btn-primary-color btn-normal fw-bold text-white btn-lg btn-text text-center text-md-start" onClick={() => handleSearch()}>Search</button>
                                        }

                                    </div>

                                </div>
                            </div>


                            <div className="row">
                                {showAlert &&
                                    alertList.length > 0 && alertList.map((alert, index) => {
                                        return <div key={index} className="col-12 col-md-10 mx-auto mb-2 ">
                                            <div className="card">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-auto">
                                                            <p className="primary-text-color hero-desc text-center text-md-start" style={{ color: `${alert.status.colorCode}`}}>{alert.status.title}</p>
                                                        </div>
                                                        <div className="col-auto ms-auto">
                                                            <p className="mb-1 primary-text-color fw-bold hero-desc text-center text-md-end" style={{ fontSize: 15 }}>{alert.responses && [...alert.responses].filter((resp) => resp.isAffected).length} Affected</p>
                                                        </div>
                                                    </div>

                                                    <h4 className="mb-2 primary-text-color text-center text-md-start mt-3" style={{ fontSize: 18 }}>{alert.title}</h4>

                                                    <p className="mb-1 primary-text-color hero-desc text-center text-md-start pe-md-5" style={{ fontSize: 15 }}>{alert.description}</p>


                                                    <div className="row px-2 mt-2 align-items-center">
                                                        <div className="col-4 col-md-4 text-center">
                                                        <ButtonToolbar>
                                                        <Button appearance="primary" color="cyan" size="xs">
                                                            <IconButton appearance="link" onClick={() => handleOpenResponseModal(alert._id)} icon={<svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                fill="white"
                                                                className="bi bi-telephone"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M3.654 1.328a.678.678 0 00-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 004.168 6.608 17.569 17.569 0 006.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 00-.063-1.015l-2.307-1.794a.678.678 0 00-.58-.122l-2.19.547a1.745 1.745 0 01-1.657-.459L5.482 8.062a1.745 1.745 0 01-.46-1.657l.548-2.19a.678.678 0 00-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 012.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 00.178.643l2.457 2.457a.678.678 0 00.644.178l2.189-.547a1.745 1.745 0 011.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 01-7.01-4.42 18.634 18.634 0 01-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"></path>
                                                            </svg>} circle />
                                                            </Button>
                                                            </ButtonToolbar>
                                                            <p className="primary-text-color hero-desc" style={{ fontSize: 12 }}>Contact NEMA</p>
                                                        </div>

                                                        <div className="col-4 col-md-4 text-center">
                                                        <ButtonToolbar>
                                                        <Button appearance="primary" color="orange" size="xs">
                                                        <Link href="/help-center">
                                                            <IconButton appearance="link" icon={<svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                fill="white"
                                                                className="bi bi-info-square"
                                                                viewBox="0 0 16 16"
                                                                
                                                            >
                                                                <path d="M14 1a1 1 0 011 1v12a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1h12zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z"></path>
                                                                <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 11-2 0 1 1 0 012 0z"></path>
                                                            </svg>} circle />
                                                            </Link>
                                                            </Button>
                                                            </ButtonToolbar>
                                                            <p className="primary-text-color hero-desc" style={{ fontSize: 12 }}>Ask for help</p>


                                                        </div>

                                                        <div className="col-4 col-md-4 text-center">
                                                            <ButtonToolbar>
                                                            <Button appearance="primary" color="green" size="xs">
                                                            <IconButton appearance="link" icon={<svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                fill="white"
                                                                className="bi bi-share"
                                                                viewBox="0 0 16 16"
                                                                
                                                            >
                                                                <path d="M13.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM11 2.5a2.5 2.5 0 11.603 1.628l-6.718 3.12a2.499 2.499 0 010 1.504l6.718 3.12a2.5 2.5 0 11-.488.876l-6.718-3.12a2.5 2.5 0 110-3.256l6.718-3.12A2.5 2.5 0 0111 2.5zm-8.5 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"></path>
                                                            </svg>} circle />
                                                            </Button>
                                                            </ButtonToolbar>
                                                            <p className="primary-text-color hero-desc" style={{ fontSize: 12 }}>Share</p>
                                                        </div>
                                                    </div>



                                                </div>
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>



                {/* Response modal */}
                <Modal open={openResponseModal} onClose={() => setOpenResponseModal(false)}>
                    <Modal.Header>
                        <Modal.Title>Contact Nema</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="px-0 px-md-2 mb-5">
                            {/* full name */}
                            <div className="mb-4">
                                <label>Full Name <span className="text-danger">*</span> </label>
                                <input type="text" id="fullName" className="form-control form-input" onChange={(event) => setFullName(event.target.value)} value={fullName} placeholder="Your full name" />
                            </div>

                            {/* phone number */}
                            <div className="mb-4">
                                <label>Phone Number <span className="text-danger">*</span> </label>
                                <input type="text" id="phone" className="form-control form-input" onChange={(event) => setPhoneNumber(event.target.value)} value={phoneNumber} placeholder="Your phone number" />
                            </div>

                            {/* address */}
                            <div className="mb-4">
                                <label>Your Address<span className="text-danger">*</span> </label>
                                {useMemo(() => <GooglePlacesAutocomplete
                                    autocompletionRequest={{ componentRestrictions: { country: "ng" } }}
                                    apiOptions={{ region: "ng", language: 'en' }}
                                    apiKey={process.env.googleApiKey}
                                    selectProps={{
                                        locationAddress,
                                        onChange: setLocationAddress,
                                    }}
                                />, [])}
                            </div>

                            <div className="mb-4">
                                <label>Are you affected?<span className="text-danger">*</span> </label>
                                <select className={`form-select form-input text-truncate`} onChange={(event) => setIsAffected(event.target.value)}>
                                    <option value="" className="text-muted">Please Select</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        {isResponseLoading ? <button className="btn btn-primary-color btn-normal text-white" disabled>Please wait...</button> :
                            <button className="btn btn-primary-color btn-normal text-white" onClick={() => handleCreateResponse()}>Submit</button>
                        }

                    </Modal.Footer>
                </Modal>




                {/* Show Nema Modal */}
                <Modal open={showNemaContact} onClose={() => setShowNemaContact(false)} size="sm">
                    <Modal.Header>
                        <Modal.Title>NEMA contact</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                       <div className="container">
                           <p className="primary-text-color hero-desc">Twitter: <a href="https://Twitter.com/nemanigeria" target="_blank">https://Twitter.com/nemanigeria</a></p>
                           <p className="primary-text-color hero-desc">Facebook: <a href="https://facebook.com/nemanigeria" target="_blank">https://facebook.com/nemanigeria</a></p>
                           <p className="primary-text-color hero-desc">Email: <b>info@nema.gov.ng</b></p>
                           <p className="primary-text-color hero-desc">Emergency Number: <b>112</b></p>
                       </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowNemaContact(false)}>Close</button>
                    </Modal.Footer>
                </Modal>





                {/* Open weather */}
                <Modal open={openWeather} onClose={() => setOpenWeather(false)} size="md">
                    <Modal.Header>
                        {/* <Modal.Title>{weatherLocation.region} Weather Now</Modal.Title> */}
                    </Modal.Header>
                    <Modal.Body>
                        <h3>Today's Weather</h3>
                        <hr />
                        <div className="container">
                            <div className="row">
                                <div className="col-12 col-md-3">
                                    <h6 className="ms-2">{weatherLocationArr.length > 0 && `${weatherLocationArr[0].date}`}</h6>
                                    <img src={weatherLocationArr.length > 0 && `http:${weatherLocationArr[0].day.condition.icon}`} />
                                    <h5 className="ms-2">{weatherLocationArr.length > 0 && `${weatherLocationArr[0].day.condition.text}`}</h5>
                                </div>

                                <div className="col-12 col-md-3">
                                    <div>
                                        <small>Min/Max</small>
                                        <h4>{weatherLocationArr.length > 0 && `${weatherLocationArr[0].day.mintemp_c}`}°/{weatherLocationArr.length > 0 && `${weatherLocationArr[0].day.maxtemp_c}`}°</h4>
                                    </div>

                                    <div className="mt-3">
                                        <small>Avg Humidity</small>
                                        <h4>{weatherLocationArr.length > 0 && `${weatherLocationArr[0].day.avghumidity}`}</h4>
                                    </div>
                                </div>

                                <div className="col-12 col-md-3">
                                    <div>
                                        <small>Moonrise</small>
                                        <h4>{weatherLocationArr.length > 0 && `${weatherLocationArr[0].astro.moonrise}`}</h4>
                                    </div>

                                    <div className="mt-3">
                                        <small>Moonset</small>
                                        <h4>{weatherLocationArr.length > 0 && `${weatherLocationArr[0].astro.moonset}`}</h4>
                                    </div>
                                </div>

                                <div className="col-12 col-md-3">
                                    <div>
                                        <small>Sunrise</small>
                                        <h4>{weatherLocationArr.length > 0 && `${weatherLocationArr[0].astro.sunrise}`}</h4>
                                    </div>

                                    <div className="mt-3">
                                        <small>Sunset</small>
                                        <h4>{weatherLocationArr.length > 0 && `${weatherLocationArr[0].astro.sunset}`}</h4>
                                    </div>
                                </div>

                            </div>

                            <hr />
                            <div className="row">
                                <div className="col-12 col-md-12">
                                    <div className="accordion accordion-flush" id="accordionFlushExample">
                                        {weatherLocationArr.length > 0 && weatherLocationArr.slice(1).map((weather, index) => {
                                            return <div key={index} className="accordion-item">
                                                <h2 className="accordion-header" id={`flush-headingOne${index}`}>
                                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#flush-collapseOne${index}`} aria-expanded="false" aria-controls={`#flush-collapseOne${index}`}>
                                                        {weather.date}
                                                    </button>
                                                </h2>
                                                <div id={`flush-collapseOne${index}`} className="accordion-collapse collapse" aria-labelledby={`flush-headingOne${index}`} data-bs-parent="#accordionFlushExample">
                                                    <div className="accordion-body">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div className="col-12 col-md-3">
                                                                    <img src={`http:${weather.day.condition.icon}`} />
                                                                    <h5 className="ms-2">{`${weather.day.condition.text}`}</h5>

                                                                </div>

                                                                <div className="col-12 col-md-3">
                                                                    <div>
                                                                        <small>Min/Max</small>
                                                                        <h4>{`${weather.day.mintemp_c}`}°/{`${weather.day.maxtemp_c}`}°</h4>
                                                                    </div>

                                                                    <div className="mt-3">
                                                                        <small>Avg Humidity</small>
                                                                        <h4>{`${weather.day.avghumidity}`}</h4>
                                                                    </div>
                                                                </div>

                                                                <div className="col-12 col-md-3">
                                                                    <div>
                                                                        <small>Moonrise</small>
                                                                        <h4>{`${weather.astro.moonrise}`}</h4>
                                                                    </div>

                                                                    <div className="mt-3">
                                                                        <small>Moonset</small>
                                                                        <h4>{`${weather.astro.moonset}`}</h4>
                                                                    </div>
                                                                </div>

                                                                <div className="col-12 col-md-3">
                                                                    <div>
                                                                        <small>Sunrise</small>
                                                                        <h4>{`${weather.astro.sunrise}`}</h4>
                                                                    </div>

                                                                    <div className="mt-3">
                                                                        <small>Sunset</small>
                                                                        <h4>{`${weather.astro.sunset}`}</h4>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-secondary btn-sm" onClick={() => setOpenWeather(false)}>
                            Close
                        </button>
                    </Modal.Footer>
                </Modal>
                

                
            </section>
        </>

    )
}

export default Home
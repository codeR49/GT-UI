import React, { useContext, useState, useEffect, memo } from 'react'
import { Formik } from "formik"
import _ from 'lodash';
import $ from 'jquery';
import Spinner from "rct-tpt-spnr";
import { Form, Row } from 'react-bootstrap';
import ApiService from "../../../services/api.service";
import { useAuthState } from '../../../contexts/AuthContext/context';
import { useHistory } from 'react-router-dom'
import { goToTopOfWindow } from '../../../commons/utils';
import useToast from '../../../commons/ToastHook';
import PriceSummary from './../PriceSummary';

const PaymentsView = ({ orderBy, setTab, product, valueToMatch, tabWiseData }) => {
    const history = useHistory();
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const initialValues = {
        card: tabWiseData?.paymentCard?.sid ? tabWiseData?.paymentCard?.sid : ""
    };
    // tabWiseData?.paymentCard?.sid ? tabWiseData.paymentCard.sid : 
    const [myCards, setMyCards] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const userDetails = useAuthState();
    useEffect(() => {
        spinner.show("Please wait...");
        ApiService.myCards(userDetails.user.sid).then(
            response => {
                setMyCards(response.data);
            },
            err => {
                Toast.error({ message: err.response && err.response.data ? (err.response.data.message || err.response.data.error || err.response.data.status) : 'Internal server error! Please try after sometime.', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
            setIsDataLoaded(true);
        });
    }, []);
    const onNextStep = async (values, { setSubmitting }) => {
        let isListingActive = await ApiService.validateActiveListing(product.sid);
        if (isListingActive.data) {
            setSubmitting(false);
            goToTopOfWindow();
            tabWiseData.paymentCard = _.filter(myCards, { sid: values.card })[0];
            $('#location').addClass('active');
            setTab('location');
        } else {
            history.push("/");
            Toast.warning({ message: 'Sorry! This item is currently sold out!', time: 2000 });
        }
    }

    const initIsOfferedForTrade = (list = [], disable = true) => {
        spinner.show("Please wait...");
        let payload = {
            "listingSids": list.map(r => r.sid),
            "toggle": disable
          };
        ApiService.isOfferedForTrade(payload).then(
            response => { },
            err => { }
        ).finally(() => {
            spinner.hide();
        });
    }

    const cancelAction = () => {
        if(tabWiseData.tradeListItems && tabWiseData.tradeListItems.length > 0) initIsOfferedForTrade(tabWiseData.tradeListItems, false);
        tabWiseData.tradeListItems = [];
        history.replace('/');
        goToTopOfWindow();
    }

    return (
        <>
            <div>
                <div className="mb-8">
                    <h2 class="card-title-header create-listing-block mobile-off">Payment Info</h2>
                    <h2 class="desktop-off create-listing-block">Payment Info</h2>
                </div>
                {orderBy === 'buy' && <PriceSummary {...{price: tabWiseData.carts.subTotal, product, tabWiseData}}/>}
                {orderBy === 'bid' &&  <PriceSummary {...{price: tabWiseData.bidInfo.bidValue, product, tabWiseData}}/>}
                {orderBy === 'trade' && <PriceSummary {...{tabWiseData, product, price: (valueToMatch.isPayBalance && valueToMatch.amount) || 0}}/>}
                
                <div className="mb-8">
                    <h3 class="attention-header">ATTENTION!</h3>
                    <p className="description-txt mb-2 des-txt-color mobile-off">Select the card from which you want the amount to be debited</p>
                    <p className="description-txt des-txt-size mobile-off">Note : Incase the transaction is a trade or bid, the amount will be deducted once the trade or bid is accepted.</p>
                    <p className="description-txt mb-2 des-txt-color des-txt-aligin desktop-off">Select the card from which you want the amount to be debited</p>
                    <p className="description-txt des-txt-size des-txt-aligin desktop-off">Note : Incase the transaction is a trade or bid, the amount will be deducted once the trade or bid is accepted.</p>
                </div>
                <div className="pro-passChange-ctn mt-4">
                    <Formik
                        initialValues={initialValues}
                        onSubmit={onNextStep}>
                        {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty }) => (
                            <Form noValidate>
                                <Form.Group as={Row} className="playment-content">
                                    {
                                        myCards.map((card, index) => {
                                            return <>
                                                <div class="col-lg-3"> </div>
                                                <div className="media p-4">
                                                    <div className="mr-2">
                                                        <Form.Check
                                                            type="radio"
                                                            onChange={handleChange}
                                                            value={card.sid}
                                                            name="card"
                                                            checked={values.card === card.sid}
                                                        />
                                                    </div>
                                                    <div>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="40.5" height="31.5" viewBox="0 0 40.5 31.5">
                                                            <path className="aaaa"
                                                                fill="#555"
                                                                d="M33.054,16.263s.534,2.616.654,3.164H31.359c.232-.626,1.125-3.059,1.125-3.059-.014.021.232-.64.373-1.048l.2.942ZM40.5,5.625v24.75a3.376,3.376,0,0,1-3.375,3.375H3.375A3.376,3.376,0,0,1,0,30.375V5.625A3.376,3.376,0,0,1,3.375,2.25h33.75A3.376,3.376,0,0,1,40.5,5.625ZM10.723,23.288l4.444-10.913H12.178L9.415,19.828l-.3-1.512L8.128,13.3a1.176,1.176,0,0,0-1.28-.921H2.3l-.049.218a11.158,11.158,0,0,1,2.967,1.2l2.517,9.492Zm6.638.014,1.772-10.927H16.305L14.541,23.3h2.82ZM27.2,19.73c.014-1.245-.745-2.194-2.37-2.974-.991-.5-1.6-.837-1.6-1.35.014-.464.513-.942,1.624-.942a4.845,4.845,0,0,1,2.1.415l.253.12.387-2.363a7.022,7.022,0,0,0-2.531-.464c-2.791,0-4.753,1.491-4.767,3.614-.021,1.568,1.406,2.44,2.475,2.967,1.09.534,1.462.886,1.462,1.357-.014.731-.886,1.069-1.695,1.069a5.632,5.632,0,0,1-2.651-.584l-.373-.176-.394,2.454a8.628,8.628,0,0,0,3.15.584C25.242,23.463,27.176,21.994,27.2,19.73ZM37.125,23.3,34.847,12.375H32.66a1.391,1.391,0,0,0-1.477.907l-4.2,10.02h2.967s.485-1.35.591-1.638h3.628c.084.387.338,1.638.338,1.638Z"
                                                                transform="translate(0 -2.25)" />
                                                        </svg>
                                                    </div>
                                                    <div className="media-body ml-3 payment">
                                                        <h5 className="mt-0">XYZ Bank Credit Card</h5>
                                                        <p>{card.cardNumber}</p>
                                                    </div>
                                                </div>
                                            </>
                                        })
                                    }
                                </Form.Group>
                                {/* <div class="row justify-content-center pt-4 payable-block">
                                    <label>Payable Amout : &nbsp;</label>
                                    {orderBy === 'buy' && <span> ${tabWiseData.carts.total}</span>}
                                    {orderBy === 'bid' && <span> ${tabWiseData.bidInfo.bidValue}</span>}
                                    {orderBy === 'trade' && <span> ${(valueToMatch.isPayBalance && valueToMatch.amount) || 0}</span>}
                                </div> */}
                                <div class="text-right mobile-off">
                                    <input type="button" name="cancel" class="cancel-btn mt-2" value="Cancel" onClick={cancelAction} />
                                    <input onClick={handleSubmit} disabled={!values.card || (!valueToMatch.offerStatus && orderBy === "trade")} type="button" name="next" class="next action-button nextBtn" value="Continue" />
                                </div>
                                <section class="mobile-btn-section desktop-off">
                                    <div class="container">
                                        <div class="row">
                                            <div class="col-lg-12">
                                                <div class="proPg-btnArea">
                                                    <div className="proPg-btnArea-div-outer">
                                                        <div className="proPg-btnArea-div-inner">
                                                            <input type="button" value="Cancel" onClick={cancelAction} class="submt-btn submt-btn-lignt mr10 text-center full-w" />
                                                        </div>
                                                        <div className="proPg-btnArea-div-inner">
                                                            <input type="button" value="Continue" onClick={() => {handleSubmit()}} disabled={!values.card || (!valueToMatch.offerStatus && orderBy === "trade")} class="submt-btn submt-btn-dark text-center full-w" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </>
    )
}

export default memo(PaymentsView);
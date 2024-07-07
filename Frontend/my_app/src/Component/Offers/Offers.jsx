import React from "react";
import './Offers.css'
import exclusive_image from '../Assests/exclusive_image.png'

const Offers = () => {
    return (
        <div className="offers">
            <div className="offers-left">
                <h1>Exclusive</h1>
                <h1>Offers For You</h1>
                <p>Only On Best Sellers Products</p>
                <button onClick={() => window.scrollTo(0,930)}>Check Now</button>
            </div>
            <div className="offers-right">
                <img src={exclusive_image} alt=""/>
            </div>
        </div>
    )
}

export default Offers
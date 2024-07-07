import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews(121)</div>
        </div>
        <div className="descriptionbox-description">
            <p>An e-commerce websites is online platform that facilitates the buying and selling of products or service over the internet. It serves as a virtual marketplace where businesses an individuals can showcase their products, interact with customers, and conduct transactions without need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
            <p>E-commerce websites typically display product or services along with detailed descriptions, image ,prices and any available variations(e.g. sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
        </div>
    </div>
  )
}

export default DescriptionBox
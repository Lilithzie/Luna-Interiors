import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { countries } from 'countries-list'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { useDispatch, useSelector } from 'react-redux'
import { saveShippingInfo } from '../../actions/cartActions'

const Shipping = () => {
    const dispatch = useDispatch();
    const { shippingInfo } = useSelector(state => state.cart)

    const countriesList = Object.values(countries)
    const [address, setAddress] = useState(shippingInfo.address || '')
    const [city, setCity] = useState(shippingInfo.city || '')
    const [postalCode, setPostalCode] = useState(shippingInfo.postalCode || '')
    const [phoneNo, setPhoneNo] = useState(shippingInfo.phoneNo || '')
    const [country, setCountry] = useState(shippingInfo.country || 'Philippines')
    const [errors, setErrors] = useState({})
    const [attempted, setAttempted] = useState(false)
    let navigate = useNavigate();
    const submitHandler = (e) => {
        e.preventDefault()
        setAttempted(true)
        const nextErrors = {}
        if (address.trim().length < 5) nextErrors.address = 'Please enter a complete address.'
        if (city.trim().length < 2) nextErrors.city = 'Please enter a valid city.'
        if (!/^\+?[0-9\s()-]{7,20}$/.test(phoneNo.trim())) nextErrors.phoneNo = 'Please enter a valid phone number.'
        if (!/^\d{4,10}$/.test(postalCode.trim())) nextErrors.postalCode = 'Postal code must contain 4 to 10 digits.'
        if (!country) nextErrors.country = 'Please select a country.'
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length) return

        dispatch(saveShippingInfo({ address: address.trim(), city: city.trim(), phoneNo: phoneNo.trim(), postalCode: postalCode.trim(), country }))
        navigate('/confirm')
    }

    return (
        <>
            <MetaData title={'Shipping Info'} />
            <CheckoutSteps shipping />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form
                        className="shadow-lg"
                        onSubmit={submitHandler}
                        noValidate
                    >
                        <h1 className="mb-4">Shipping Info</h1>
                        <div className="form-group">
                            <label htmlFor="address_field">Address</label>
                            <input
                                type="text"
                                id="address_field"
                                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                value={address}
                                onChange={(e) => { setAddress(e.target.value); if (attempted) setErrors(current => ({ ...current, address: '' })) }}
                            />
                            {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="city_field">City</label>
                            <input
                                type="text"
                                id="city_field"
                                className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                                value={city}
                                onChange={(e) => { setCity(e.target.value); if (attempted) setErrors(current => ({ ...current, city: '' })) }}
                            />
                            {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone_field">Phone No</label>
                            <input
                                type="phone"
                                id="phone_field"
                                className={`form-control ${errors.phoneNo ? 'is-invalid' : ''}`}
                                value={phoneNo}
                                onChange={(e) => { setPhoneNo(e.target.value); if (attempted) setErrors(current => ({ ...current, phoneNo: '' })) }}
                            />
                            {errors.phoneNo && <div className="invalid-feedback">{errors.phoneNo}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="postal_code_field">Postal Code</label>
                            <input
                                type="text"
                                id="postal_code_field"
                                className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
                                value={postalCode}
                                onChange={(e) => { setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 10)); if (attempted) setErrors(current => ({ ...current, postalCode: '' })) }}
                            />
                            {errors.postalCode && <div className="invalid-feedback">{errors.postalCode}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="country_field">Country</label>
                            <select
                                id="country_field"
                                className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                                value={country}
                                onChange={(e) => { setCountry(e.target.value); if (attempted) setErrors(current => ({ ...current, country: '' })) }}
                            >

                                {countriesList.map(country => (
                                    <option key={country.name} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}

                            </select>
                            {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                        </div>

                        <button
                            id="shipping_btn"
                            type="submit"
                            className="btn btn-block py-3"
                        >
                            CONTINUE
                        </button>
                    </form>
                </div>
            </div>

        </>
    )
}

export default Shipping

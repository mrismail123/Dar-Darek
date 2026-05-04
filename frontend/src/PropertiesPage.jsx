import beach from './assets/beach.jpg'

import "./propertiesPage.css"

import Header from './Home components/Header';
import Map from './PropertiesMap'
import { useSearchParams } from 'react-router-dom';


import FilterBar from './FilterBar';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import React from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonIcon from '@mui/icons-material/Person';
import BedIcon from '@mui/icons-material/Bed';
import StarIcon from '@mui/icons-material/Star';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';

// Import img
import tangier from "./assets/Tangier2.jpg"
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useThemeGlobal } from './Contexts/ThemeContext';
import PropertiesMap from './PropertiesMap';

const BaseUrl = "http://localhost:5000";

export default function PropertiesPage() {

    const themeGlobal = useThemeGlobal();
    // params
    const [searchParams, setSearchParams] = useSearchParams();

    // States --------------------------------------------

    // properties
    const [properties, setProperties] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // page number and total pages
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const [totalPages, setTotalPages] = useState(0);

    // city name & description
    const [cityName, setCityName] = useState(null);
    const [cityDescription, setCityDescription] = useState(null);

    useEffect(() => {
        const cityNameAndDescripion = async (req, res) => {

            try {
                const response = await axios.post('http://localhost:5000/api/cityForAbout', {
                    city: searchParams.get("city")
                })
                setCityName(response.data.cityName);
                setCityDescription(response.data.cityDescription);
            } catch (error) {
                if (error.response) {
                    alert(error.response.data.message || "Unknown error occurred");
                } else {
                    alert(error.message);
                }
            }



        }
        cityNameAndDescripion();
    }, [])


    useEffect(() => {
        const fetchProperties = async () => {
            setIsLoading(true);
            try {


                const city = searchParams.get("city");
                const checkIn = searchParams.get("checkIn");
                const checkOut = searchParams.get("checkOut");
                const guests = searchParams.get("guests");

                // for filters
                const minPrice = searchParams.get("minPrice");
                const maxPrice = searchParams.get("maxPrice");
                const propertyType = searchParams.get("propertyType");
                const bedrooms = searchParams.get("bedrooms");
                const sortBy = searchParams.get("sortBy");


                const payload = { city };

                // start filter verifications
                if (minPrice && maxPrice) {
                    payload.minPrice = minPrice;
                    payload.maxPrice = maxPrice;
                }
                if (propertyType) {
                    payload.propertyType = propertyType;
                }
                if (bedrooms) {
                    payload.bedrooms = bedrooms;
                }
                if (sortBy) {
                    payload.sortBy = sortBy;
                }

                // check in & check out verifications
                if (checkIn && checkOut && guests) {
                    payload.checkIn = checkIn;
                    payload.checkOut = checkOut;
                    payload.guests = guests;
                }
                // add current page
                payload.page = currentPage;


                console.log(payload);

                const response = await axios.post("http://localhost:5000/api/propertiesBasedOnParams", payload);
                // localStorage.setItem('properties', JSON.stringify(response.data.properties))
                setProperties(response.data.properties);
                setTotalPages(response.data.totalPages);

            } catch (error) {
                console.error("Error occured", error);
            } finally {
                setIsLoading(false);
            }
        };


        fetchProperties();

    }, [searchParams, currentPage]);


    const handleFilterOptions = (newFilters) => {
        const newParams = new URLSearchParams();
        newParams.set("city", searchParams.get("city"));
        if (searchParams.get("checkIn") && searchParams.get("checkOut")) {
            newParams.set("checkIn", searchParams.get("checkIn"));
            newParams.set("checkOut", searchParams.get("checkOut"));
        }

        newParams.set("minPrice", newFilters.priceMin);
        newParams.set("maxPrice", newFilters.priceMax);
        if (newFilters.guests > 0) {
            newParams.set("guests", newFilters.guests);
        } else if (searchParams.get("guests")) {
            newParams.set("guests", searchParams.get("guests"));
        }
        if (newFilters.propertyType.length >= 1) {
            newParams.set("propertyType", newFilters.propertyType);
        }
        if (newFilters.bedrooms !== "Any") {
            newParams.set("bedrooms", newFilters.bedrooms);
        }
        newParams.set("sortBy", newFilters.sortBy);
        setSearchParams(newParams);
    }


    const paginationButtons = () => {
        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <Button
                    style={{
                        background: themeGlobal.colors.primary,
                        color: "white",
                        // padding: "0",
                        padding: "6px",
                        marginRight: "10px"
                    }}
                    key={i}
                    onClick={() => {
                        setCurrentPage(i);
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set("page", i);
                        setSearchParams(newParams);
                    }}
                    className={currentPage === i ? "active-page" : ""}
                >
                    {i}
                </Button>
            );
        }
        return <div className="pagination-container">{pages}</div>;
    };

    const propertiesSlide = properties?.map((property) => {
        const dateFrom = new Date(property.available_from);
        const dateTo = new Date(property.available_to);
        const diffMil = dateTo - dateFrom;
        const nights = diffMil / (1000 * 60 * 60 * 24);

        let imagePath = property.main_image;
        if (imagePath) {
            imagePath = imagePath.replace(/\\/g, '/');
            if (!imagePath.startsWith('/')) {
                imagePath = '/' + imagePath;
            }
        }
        const imageUrl = imagePath ? `${BaseUrl}${imagePath}` : beach;

        return (
            <Box
                key={property.id_property}
                onClick={() => window.open(`/property-details/${property.id_property}`, '_blank')}
                sx={{
                    width: "100%",
                    borderRadius: "14px",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(215, 194, 154, 0.45)",
                    boxShadow: "0 8px 22px rgba(73, 55, 28, 0.12)",
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "0",
                    cursor: "pointer",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 14px 32px rgba(73, 55, 28, 0.18)",
                    }
                }}
            >
                <div style={{ position: "relative", height: "138px", overflow: "hidden" }}>
                    <FavoriteBorderIcon
                        sx={{
                            width: "30px",
                            height: "30px",
                            padding: "6px",
                            borderRadius: "50%",
                            background: "#ffffff",
                            color: "#7A7034",
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.12)"
                        }}
                    />
                    <img
                        src={imageUrl}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        alt={property.title}
                    />
                </div>
                <div style={{ padding: "10px 12px" }}>
                    {/* Title on its own line */}
                    <h4
                        className="font-luxury"
                        style={{
                            margin: "0 0 3px",
                            fontSize: "0.98rem",
                            lineHeight: "1.25",
                            color: "#1A1A1A",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}
                    >
                        {property.title}
                    </h4>
                    <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "#6B7280" }}>
                        {property.city_name}
                    </p>
                    {/* Price + Rating row */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "8px",
                        borderTop: "1px solid rgba(215, 194, 154, 0.35)"
                    }}>
                        <p style={{ margin: "0", fontSize: "0.9rem", color: "#1A1A1A" }}>
                            <span style={{ fontWeight: "700" }}>${property.price_per_day}</span> / night
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                            <StarIcon sx={{ fontSize: "0.9rem", color: "#D9A11B" }} />
                            <p style={{ margin: "0", fontSize: "0.82rem", color: "#5F6876" }}>4.8</p>
                        </div>
                    </div>
                </div>
            </Box>
        )
    }) || [];


    return (
        <>
            <Header />
            <div className="dynamicPropertiesIntro">
                <div className="intro">
                    <p className="breadcrumb"><a href="/">Home</a> / <span style={{ marginLeft: "10px", color: themeGlobal.colors.primary }}>{cityName} stays</span></p>
                    <h2 className="font-luxury">{searchParams.get("city")} stays</h2>

                    <div className="title-separator">
                        <div className="line"></div>
                        <div className="diamond"></div>
                        <div className="line"></div>
                    </div>

                    <p className="description">Discover sea views, medina charm, and elegant homes across northern Morocco.</p>
                </div>
                <div className="image">
                    <img src={beach} alt="Tangier stays" />
                </div>
            </div>
            <div style={{ background: themeGlobal.colors.white }}>
                <div className="showProperties">
                    <div className='propertiesAndFilter'>
                        <FilterBar onFilterApply={handleFilterOptions} />
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', width: '100%' }}>
                                <CircularProgress sx={{ color: themeGlobal.colors.primary }} />
                            </div>
                        ) : (
                            <div className='properties'>
                                {propertiesSlide?.length > 0 ? propertiesSlide : (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#6B7280' }}>
                                        <h3>No properties found matching your filters.</h3>
                                        <p>Try adjusting your search criteria or dates.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!isLoading && totalPages > 1 && (
                            <div style={{ marginTop: "30px" }}>
                                {paginationButtons()}
                            </div>
                        )}
                    </div>
                    <div style={{ width: "27%", flexShrink: 0 }} className='mapAndAboutCity'>
                        <div className="map">
                            <PropertiesMap properties={properties} />
                        </div>
                        <div
                            style={{
                                padding: "25px",
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                                background: themeGlobal.colors.background,
                                borderRadius: "16px", // زوايا منحنية تعطي شعوراً عصرياً
                                boxShadow: "0 4px 20px rgba(0,0,0,0.05)", // ظل خفيف جداً لإعطاء عمق
                                border: "1px solid rgba(0,0,0,0.03)", // إطار شبه شفاف
                                marginBottom: "30px",
                                marginTop: "20px"
                            }}
                            className="about"
                        >
                            <div
                                className="about-header"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "15px",
                                    gap: "12px" // تباعد بين الأيقونة والعنوان
                                }}
                            >
                                <span
                                    className="about-icon"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "rgba(180, 175, 34, 0.1)", // خلفية شفافة من نفس لون الأيقونة
                                        padding: "8px",
                                        borderRadius: "12px"
                                    }}
                                >
                                    <MeetingRoomOutlinedIcon sx={{
                                        color: "#b4af22ff",
                                        fontSize: "2.2rem"
                                    }} />
                                </span>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: "1.5rem",
                                    fontWeight: "700",
                                    color: "#333",
                                    letterSpacing: "-0.5px"
                                }}>
                                    About {cityName}
                                </h3>
                            </div>

                            <p
                                className="about-text"
                                style={{
                                    margin: 0,
                                    fontSize: "1.05rem",
                                    lineHeight: "1.8", // تباعد أسطر مريح للقراءة
                                    color: "#555",
                                    textAlign: "justify", // محاذاة النص ليعطي شكلاً منظماً
                                    fontWeight: "400",
                                    opacity: "0.9"
                                }}
                            >
                                {cityDescription}
                            </p>
                        </div>                    </div>
                </div>
            </div>
            <Footer />

        </>
    )
}

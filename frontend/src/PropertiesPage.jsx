import beach from './assets/beach.jpg'

import "./propertiesPage.css"

import Header from './Home components/Header';
import Map from './PropertiesMap'
import { useSearchParams } from 'react-router-dom';


import FilterBar from './FilterBar';
import Footer from './Footer';
import { useEffect, useRef, useState } from 'react';
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
import { buildApiUrl } from './lib/api';

function getPropertyReviewMeta(property) {
    const reviewCount = Number(property?.review_count || property?.reviewCount || 0);
    const rating = Number(property?.avg_rating || property?.avgRating || property?.rating || 0);

    if (reviewCount > 0 && Number.isFinite(rating) && rating > 0) {
        return {
            hasReviews: true,
            label: rating.toFixed(1),
            title: `${rating.toFixed(1)} based on ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`,
        };
    }

    return {
        hasReviews: false,
        label: "New",
        title: "A fresh stay waiting for its first review",
    };
}

export default function PropertiesPage() {

    const themeGlobal = useThemeGlobal();
    const propertiesSectionRef = useRef(null);
    const propertiesGridRef = useRef(null);
    // params
    const [searchParams, setSearchParams] = useSearchParams();

    // States --------------------------------------------

    // properties
    const [properties, setProperties] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // page number and total pages
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(9);

    // city name & description
    const [cityName, setCityName] = useState(null);
    const [cityDescription, setCityDescription] = useState(null);

    useEffect(() => {
        const cityNameAndDescripion = async () => {

            try {
                const response = await axios.post(buildApiUrl('/api/cityForAbout'), {
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
        const pageFromParams = Number(searchParams.get("page")) || 1;
        setCurrentPage(pageFromParams);
    }, [searchParams]);

    useEffect(() => {
        const updatePageSize = () => {
            if (!propertiesGridRef.current) {
                return;
            }

            const gridWidth = propertiesGridRef.current.offsetWidth;
            const minCardWidth = 200;
            const columnGap = 16;
            const estimatedColumns = Math.max(
                1,
                Math.floor((gridWidth + columnGap) / (minCardWidth + columnGap))
            );
            const nextPageSize = estimatedColumns * 3;

            setPageSize((currentPageSize) =>
                currentPageSize === nextPageSize ? currentPageSize : nextPageSize
            );
        };

        updatePageSize();

        const resizeObserver = new ResizeObserver(() => {
            updatePageSize();
        });

        if (propertiesGridRef.current) {
            resizeObserver.observe(propertiesGridRef.current);
        }

        window.addEventListener("resize", updatePageSize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updatePageSize);
        };
    }, []);


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
                payload.limit = pageSize;


                console.log(payload);

                const response = await axios.post(buildApiUrl("/api/propertiesBasedOnParams"), payload);
                // localStorage.setItem('properties', JSON.stringify(response.data.properties))
                const nextTotalPages = response.data.totalPages;

                if (nextTotalPages > 0 && currentPage > nextTotalPages) {
                    handlePageChange(nextTotalPages);
                    return;
                }

                setProperties(response.data.properties);
                setTotalPages(nextTotalPages);

            } catch (error) {
                console.error("Error occured", error);
            } finally {
                setIsLoading(false);
            }
        };


        fetchProperties();

    }, [searchParams, currentPage, pageSize]);


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
        newParams.set("page", "1");
        setCurrentPage(1);
        setSearchParams(newParams);
    }

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) {
            return;
        }

        setCurrentPage(pageNumber);
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", pageNumber.toString());
        setSearchParams(newParams);

        propertiesSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    const buildPaginationItems = () => {
        if (totalPages <= 1) {
            return [];
        }

        const items = [];
        const siblingCount = 1;

        items.push(1);

        const leftSibling = Math.max(2, currentPage - siblingCount);
        const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);

        if (leftSibling > 2) {
            items.push("start-ellipsis");
        }

        for (let page = leftSibling; page <= rightSibling; page++) {
            items.push(page);
        }

        if (rightSibling < totalPages - 1) {
            items.push("end-ellipsis");
        }

        if (totalPages > 1) {
            items.push(totalPages);
        }

        return items;
    };

    const paginationButtons = () => {
        const pageItems = buildPaginationItems();

        return (
            <div className="pagination-container">
                <Button
                    className="pagination-button pagination-arrow"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Prev
                </Button>

                {pageItems.map((item, index) => {
                    if (typeof item !== "number") {
                        return (
                            <span key={`${item}-${index}`} className="pagination-ellipsis">
                                ...
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={item}
                            onClick={() => handlePageChange(item)}
                            className={`pagination-button ${currentPage === item ? "active-page" : ""}`}
                        >
                            {item}
                        </Button>
                    );
                })}

                <Button
                    className="pagination-button pagination-arrow"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        );
    };

    const propertiesSlide = properties?.map((property) => {
        let imagePath = property.main_image;
        if (imagePath) {
            imagePath = imagePath.replace(/\\/g, '/');
            if (!imagePath.startsWith('/')) {
                imagePath = '/' + imagePath;
            }
        }
        const imageUrl = imagePath ? buildApiUrl(imagePath) : beach;
        const reviewMeta = getPropertyReviewMeta(property);

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
                        <div
                            title={reviewMeta.title}
                            aria-label={reviewMeta.title}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                padding: reviewMeta.hasReviews ? "0" : "3px 8px",
                                borderRadius: "999px",
                                background: reviewMeta.hasReviews ? "transparent" : "rgba(215, 194, 154, 0.16)",
                            }}
                        >
                            <StarIcon sx={{ fontSize: "0.9rem", color: reviewMeta.hasReviews ? "#D9A11B" : "#BFA66A" }} />
                            <p style={{ margin: "0", fontSize: "0.82rem", color: reviewMeta.hasReviews ? "#5F6876" : "#7A7034", fontWeight: reviewMeta.hasReviews ? 400 : 700 }}>
                                {reviewMeta.label}
                            </p>
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
                    <div className='propertiesAndFilter' ref={propertiesSectionRef}>
                        <FilterBar onFilterApply={handleFilterOptions} />
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', width: '100%' }}>
                                <CircularProgress sx={{ color: themeGlobal.colors.primary }} />
                            </div>
                        ) : (
                            <div className='properties' ref={propertiesGridRef}>
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

import * as React from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";

// Import img
import tangier from "./assets/Tangier2.jpg"

// Theme context
import { useThemeGlobal } from "./Contexts/ThemeContext";
import Box from "@mui/material/Box";

// Material UI
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonIcon from '@mui/icons-material/Person';
import BedIcon from '@mui/icons-material/Bed';
import StarIcon from '@mui/icons-material/Star';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { buildApiUrl, createAuthConfig } from "./lib/api";
import { useToken } from "./Contexts/TokenContext";
import axios from "axios";

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

export default function CitySection({ title, properties, message }) {
    // theme state
    const themeGlobal = useThemeGlobal();
    const { token, user } = useToken();

    // ref
    const sliderRef = React.useRef(null);


    const scrollCards = (direction) => {
        if (!sliderRef.current) {
            return;
        }

        const scrollAmount = 1080;
        sliderRef.current.scrollBy({
            left: direction * scrollAmount,
            behavior: "smooth"
        });
    };

    const [showScrollButtons, setShowScrollButtons] = React.useState(false);

    React.useEffect(() => {
        const checkScroll = () => {
            if (sliderRef.current) {
                setShowScrollButtons(sliderRef.current.scrollWidth > sliderRef.current.clientWidth);
            }
        };

        // Delay checking slightly to ensure images/layout are rendered
        setTimeout(checkScroll, 100);
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [properties]);


    // state for favorites
    const [isSaved, setIsSaved] = React.useState(false);
    const [favoriteNotice, setFavoriteNotice] = React.useState("");



    const propertiesSlide = properties?.map((property) => {
        let imagePath = property.main_image;
        if (imagePath) {
            imagePath = imagePath.replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes
            if (!imagePath.startsWith('/')) {
                imagePath = '/' + imagePath; // Ensure it starts with a slash
            }
        }

        const imageUrl = imagePath ? buildApiUrl(imagePath) : tangier;
        const reviewMeta = getPropertyReviewMeta(property);

        // function for favorites hear click handling 
        const handleFavoriteClick = async (e) => {
            if (e) e.stopPropagation();


            console.log(user);
            // login required error
            if (!token || !user) {
                setFavoriteNotice("Please sign in before saving stays to your favorites.");
                return;
            }

            try {
                setFavoriteNotice("");
                const response = await axios.post(
                    buildApiUrl('/api/favorites/toggle'),
                    { id_property: property.id_property },
                    createAuthConfig(token),
                );

                setIsSaved(response.data.saved);
            } catch (error) {
                console.error("Error toggling favorite:", error);
                setFavoriteNotice("Could not update favorites. Please try again.");
            }
        };

        return (
            <Box
                key={property.id_property}
                onClick={() => window.open(`/property-details/${property.id_property}`, '_blank')}
                sx={{
                    width: "240px",
                    minWidth: "240px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(215, 194, 154, 0.45)",
                    boxShadow: "0 8px 22px rgba(73, 55, 28, 0.12)",
                    display: "flex",
                    flexDirection: "column",
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
                        onClick={handleFavoriteClick}
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
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = tangier;
                        }}
                    />
                </div>
                <div style={{ padding: "10px 12px" }}>
                    <h4
                        className="font-luxury"
                        style={{
                            margin: "0 0 4px",
                            fontSize: "1.05rem",
                            lineHeight: "1.2",
                            color: "#1A1A1A",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}
                    >
                        {property.title}
                    </h4>
                    <p style={{ margin: "0 0 10px 0", fontSize: "0.86rem", color: "#6B7280" }}>
                        {property.city_name}
                    </p>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid rgba(215, 194, 154, 0.35)",
                        paddingTop: "10px"
                    }}>
                        <p style={{ margin: "0", fontSize: "0.92rem", color: "#1A1A1A" }}>
                            <span style={{ fontWeight: "700" }}>{property.price_per_day}MAD</span> / night
                        </p>
                        <div
                            title={reviewMeta.title}
                            aria-label={reviewMeta.title}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: reviewMeta.hasReviews ? "0" : "3px 8px",
                                borderRadius: "999px",
                                background: reviewMeta.hasReviews ? "transparent" : "rgba(215, 194, 154, 0.16)",
                            }}
                        >
                            <StarIcon sx={{ fontSize: "0.95rem", color: reviewMeta.hasReviews ? "#D9A11B" : "#BFA66A" }} />
                            <p style={{ margin: "0", fontSize: "0.86rem", color: reviewMeta.hasReviews ? "#5F6876" : "#7A7034", fontWeight: reviewMeta.hasReviews ? 400 : 700 }}>
                                {reviewMeta.label}
                            </p>
                        </div>
                    </div>
                </div>
            </Box>
        )
    }) || [];

    // functions 

    const handleShowMorePropertiesButton = () => {
        const cityCategory = properties?.length > 0 ? properties[0].city_name : "";
        if (cityCategory) {
            window.open(`/properties?city=${cityCategory}`, '_blank');
        }
    }

    return (
        <>
            <Container
                className="listingHomePageContainer"
                sx={{
                    padding: "10px 36px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", md: "center" },
                        flexDirection: { xs: "column", md: "row" },
                        gap: "14px",
                        marginBottom: "18px"
                    }}
                >
                    <Stack sx={{ alignItems: "flex-start", maxWidth: "760px" }}>
                        <h3 className="font-luxury" style={{ margin: "0 0 8px" }}>{title}</h3>
                        <p style={{ margin: "0" }}>{message}</p>
                    </Stack>
                    <Button
                        onClick={handleShowMorePropertiesButton}
                        variant="contained"
                        sx={{
                            width: "110px",
                            padding: "6px 10px",
                            background: themeGlobal.colors.primary,
                            alignSelf: { xs: "flex-start", md: "center" }
                        }}
                    >
                        View more
                    </Button>
                </Box>
                {favoriteNotice && (
                    <Alert severity="warning" sx={{ borderRadius: 3, mb: 2 }}>
                        {favoriteNotice}
                    </Alert>
                )}
                <Box sx={{ position: "relative", minWidth: 0 }}>
                    {showScrollButtons && (
                        <Button
                            type="button"
                            onClick={() => scrollCards(-1)}
                            sx={{
                                minWidth: 0,
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                position: "absolute",
                                left: "-18px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 2,
                                backgroundColor: "#fffdf8",
                                color: "#7A7034",
                                border: "1px solid rgba(215, 194, 154, 0.7)",
                                boxShadow: "0 8px 18px rgba(73, 55, 28, 0.14)",
                                "&:hover": {
                                    backgroundColor: "#ffffff"
                                }
                            }}
                        >
                            <ChevronLeftIcon />
                        </Button>
                    )}
                    <Stack
                        ref={sliderRef}
                        sx={{
                            overflowX: "auto",
                            overflowY: "hidden",
                            display: "flex",
                            gap: "12px",
                            flexWrap: "nowrap",
                            flexDirection: "row",
                            scrollBehavior: "smooth",
                            WebkitOverflowScrolling: "touch",
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": {
                                display: "none"
                            }
                        }}
                    >
                        {propertiesSlide}
                    </Stack>
                    {showScrollButtons && (
                        <Button
                            type="button"
                            onClick={() => scrollCards(1)}
                            sx={{
                                minWidth: 0,
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                position: "absolute",
                                right: "-18px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 2,
                                backgroundColor: "#fffdf8",
                                color: themeGlobal.colors.primary,
                                border: "1px solid rgba(215, 194, 154, 0.7)",
                                boxShadow: "0 8px 18px rgba(73, 55, 28, 0.14)",
                                "&:hover": {
                                    backgroundColor: "#ffffff"
                                }
                            }}
                        >
                            <ChevronRightIcon />
                        </Button>
                    )}
                </Box>
            </Container>
        </>
        // <propertiesSlide/>;
    )
}

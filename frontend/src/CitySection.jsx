import * as React from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

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

export default function CitySection({title, properties, message}){
    const themeGlobal = useThemeGlobal();
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

    const propertiesSlide = properties?.map((property)=>{
        const dateFrom = new Date(property.available_from);
        const dateTo = new Date(property.available_to);
        const diffMil = dateTo - dateFrom;
        const nights = diffMil / (1000 * 60 * 60 * 24);
        return (
            <Box
                key={property.id_property}
                sx={{
                    width: "260px",
                    minWidth: "350px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(215, 194, 154, 0.45)",
                    boxShadow: "0 8px 22px rgba(73, 55, 28, 0.12)",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <div style={{position:"relative", height:"138px", overflow:"hidden"}}>
                    <FavoriteBorderIcon
                        sx={{
                            width: "30px",
                            height: "30px",
                            padding: "6px",
                            borderRadius:"50%",
                            background:"#ffffff",
                            color:"#7A7034",
                            position:"absolute",
                            top:"10px",
                            right:"10px",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.12)"
                        }}
                    />
                    <img
                        src={tangier}
                        style={{width:"100%", height:"100%", objectFit:"cover", display:"block"}}
                        alt={property.title}
                    />
                </div>
                <div style={{padding:"12px 12px 10px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px"}}>
                        <div>
                            <h4
                                className="font-luxury"
                                style={{
                                    margin:"0 0 4px",
                                    fontSize:"1.05rem",
                                    lineHeight:"1.2",
                                    color:"#1A1A1A"
                                }}
                            >
                                {property.title}
                            </h4>
                            <p style={{margin:"0",fontSize:"0.86rem",color:"#6B7280"}}>
                                {property.city_name}
                            </p>
                        </div>
                        <p style={{margin:"0",fontSize:"0.92rem",whiteSpace:"nowrap",color:"#1A1A1A"}}>
                            <span style={{fontWeight:"700"}}>${property.price_per_day}</span> / night
                        </p>
                    </div>
                    <div 
                    className="amenities"
                    style={{
                    display:"flex", 
                    justifyContent:"space-between",
                    alignItems:"center" , 
                    gap:"12px",
                    marginTop:"10px",
                    paddingTop:"10px",
                    borderTop:"1px solid rgba(215, 194, 154, 0.35)",
                    flexWrap:"nowrap"
                    }}>
                        <div style={{display:"flex",alignItems:"center",gap:"4px",color:"#5F6876",whiteSpace:"nowrap",flex:"0 0 auto"}}>
                            <PersonIcon sx={{fontSize:"0.95rem"}}/>
                            <p style={{margin:"0",fontSize:"0.76rem"}}>{property.guests_total} guests</p>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"4px",color:"#5F6876",whiteSpace:"nowrap",flex:"0 0 auto"}}>
                            <BedIcon sx={{fontSize:"0.95rem"}}/>
                            <p style={{margin:"0",fontSize:"0.76rem"}}>{nights} nights</p>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"4px",color:"#D9A11B",whiteSpace:"nowrap",flex:"0 0 auto"}}>
                            <StarIcon sx={{fontSize:"0.95rem", color:"#D9A11B"}}/>
                            <p style={{margin:"0",fontSize:"0.76rem",color:"#5F6876"}}>4.8</p>
                        </div>
                    </div>
                </div>
            </Box>
        )
    }) || [];

    return (
        <>
        <Container 
            className="listingHomePageContainer" 
            sx={{
                padding:"10px 36px 24px",
                display:"flex",
                flexDirection:"column",
                alignItems:"stretch",
                }}>
            <Box
                sx={{
                    display:"flex",
                    justifyContent:"space-between",
                    alignItems:{ xs:"flex-start", md:"center" },
                    flexDirection:{ xs:"column", md:"row" },
                    gap:"14px",
                    marginBottom:"18px"
                }}
            >
                <Stack sx={{alignItems:"flex-start", maxWidth:"760px"}}>
                    <h3 className="font-luxury" style={{margin:"0 0 8px"}}>{title}</h3>
                    <p style={{margin:"0"}}>{message}</p>
                </Stack>
                <Button
                    variant="contained"
                    sx={{
                        width:"110px",
                        padding:"6px 10px",
                        background:themeGlobal.colors.primary,
                        alignSelf:{ xs:"flex-start", md:"center" }
                    }}
                >
                    View more
                </Button>
            </Box>
            <Box sx={{position:"relative",minWidth:0}}>
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
                <Stack
                    ref={sliderRef}
                    sx={{
                        overflowX:"auto",
                        overflowY:"hidden",
                        display:"flex",
                        gap:"12px",
                        flexWrap:"nowrap",
                        flexDirection:"row",
                        scrollBehavior:"smooth",
                        WebkitOverflowScrolling:"touch",
                        scrollbarWidth:"none",
                        "&::-webkit-scrollbar": {
                            display: "none"
                        }
                    }}
                >
                    {propertiesSlide}
                </Stack>
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
            </Box>
        </Container>
        </>
        // <propertiesSlide/>;
    )
}

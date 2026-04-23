import { useEffect, useRef, useState } from 'react';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useThemeGlobal } from '../../Contexts/ThemeContext';

export default function Location(){
    const themeGloabl = useThemeGlobal();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState("");
    const dropdownRef = useRef(null);

    // Keep this empty for now; later you can fill it with cities from the DB.
    const cities = [];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={dropdownRef}
            className={`asjustmentFlexing locationField ${isOpen ? "is-open" : ""}`}
            onClick={() => setIsOpen((prev) => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setIsOpen((prev) => !prev);
                }
            }}
        >
            <div className="locationField__icon">
                <LocationOnOutlinedIcon sx={{color:themeGloabl.colors.primary}}/>
            </div>
            <div className="locationField__copy">
                <p>Where to?</p>
                <p>{selectedCity || "Any city or region"}</p>
            </div>
            <KeyboardArrowDownOutlinedIcon
                className="locationField__arrow"
                sx={{
                    color: "#6B7280",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease"
                }}
            />

            <div className={`locationDropdown ${isOpen ? "is-open" : ""}`}>
                <p className="locationDropdown__title">Choose a city</p>

                {cities.length === 0 ? (
                    <p className="locationDropdown__empty">
                        City options will appear here once you connect the database.
                    </p>
                ) : (
                    <div className="locationDropdown__list">
                        {cities.map((city) => (
                            <button
                                key={city}
                                type="button"
                                className="locationDropdown__option"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedCity(city);
                                    setIsOpen(false);
                                }}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

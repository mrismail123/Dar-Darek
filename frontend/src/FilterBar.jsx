import React, { useState, useRef, useEffect } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import './filterBar.css';

export default function FilterBar({ onFilterApply }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [priceRange, setPriceRange] = useState([20, 500]);
    const [guests, setGuests] = useState({ adults: 0, children: 0, pets: 0 });
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [bedrooms, setBedrooms] = useState('Any');
    const [sortBy, setSortBy] = useState('Most popular');

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (dropdownName) => {
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    };

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const handleGuestChange = (type, operation) => {
        setGuests(prev => {
            const current = prev[type];
            const newValue = operation === 'add' ? current + 1 : Math.max(0, current - 1);
            return { ...prev, [type]: newValue };
        });
    };

    const togglePropertyType = (type) => {
        setPropertyTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const totalGuests = guests.adults + guests.children;
    const guestLabel = totalGuests > 0 ? `${totalGuests} guest${totalGuests > 1 ? 's' : ''}` : 'Any guests';
    const typeLabel = propertyTypes.length > 0 ? propertyTypes.join(', ') : 'All types';
    const priceLabel = `$${priceRange[0]} – $${priceRange[1]}${priceRange[1] === 500 ? '+' : ''}`;

    const propertyOptions = ['House', 'Apartment', 'Villa', 'Riad'];
    const bedroomOptions = ['Any', '1', '2', '3', '4+'];
    const sortOptions = ['Most popular', 'Price: Low to High', 'Price: High to Low', 'Newest'];


    // function to handle filtering options 
    const handleFilterClick = () => {
        onFilterApply({
            priceMin: priceRange[0],
            priceMax: priceRange[1],
            guests: totalGuests,
            propertyType: propertyTypes,
            bedrooms: bedrooms,
            sortBy: sortBy
        })
    }




    return (
        <div className="filterBarContainer" ref={dropdownRef}>
            <button onClick={handleFilterClick} className="mainFilterBtn">
                <FilterListIcon sx={{ fontSize: 20 }} />
                <span>Filter</span>
            </button>

            <div className="filterDropdownWrapper">
                <div className={`filterDropdown ${openDropdown === 'price' ? 'active' : ''}`} onClick={() => toggleDropdown('price')}>
                    <div className="filterText">
                        <span className="filterLabel">Price range</span>
                        <span className="filterValue">{priceLabel}</span>
                    </div>
                    <KeyboardArrowDownIcon sx={{ color: '#6B7280' }} />
                </div>
                {openDropdown === 'price' && (
                    <div className="dropdownMenu priceMenu">
                        <h4>Price range</h4>
                        <Box sx={{ width: 250, px: 2, pt: 3 }}>
                            <Slider
                                value={priceRange}
                                onChange={handlePriceChange}
                                valueLabelDisplay="auto"
                                min={10}
                                max={500}
                                sx={{ color: '#119E92' }}
                            />
                        </Box>
                        <div className="priceInputs">
                            <div className="priceInput">
                                <label>Min price</label>
                                <span>${priceRange[0]}</span>
                            </div>
                            <div className="priceInput">
                                <label>Max price</label>
                                <span>${priceRange[1]}{priceRange[1] === 500 ? '+' : ''}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="filterDropdownWrapper">
                <div className={`filterDropdown ${openDropdown === 'guests' ? 'active' : ''}`} onClick={() => toggleDropdown('guests')}>
                    <div className="filterText">
                        <span className="filterLabel">Guests</span>
                        <span className="filterValue">{guestLabel}</span>
                    </div>
                    <KeyboardArrowDownIcon sx={{ color: '#6B7280' }} />
                </div>
                {openDropdown === 'guests' && (
                    <div className="dropdownMenu guestsMenu">
                        {['adults', 'children', 'pets'].map((type) => (
                            <div className="guestRow" key={type}>
                                <div className="guestInfo">
                                    <h4>{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                                    <p>{type === 'adults' ? 'Ages 13 or above' : type === 'children' ? 'Ages 2-12' : 'Bringing a service animal?'}</p>
                                </div>
                                <div className="guestControls">
                                    <button onClick={() => handleGuestChange(type, 'subtract')} disabled={guests[type] === 0}>-</button>
                                    <span>{guests[type]}</span>
                                    <button onClick={() => handleGuestChange(type, 'add')}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="filterDropdownWrapper">
                <div className={`filterDropdown ${openDropdown === 'type' ? 'active' : ''}`} onClick={() => toggleDropdown('type')}>
                    <div className="filterText">
                        <span className="filterLabel">Property type</span>
                        <span className="filterValue">{typeLabel}</span>
                    </div>
                    <KeyboardArrowDownIcon sx={{ color: '#6B7280' }} />
                </div>
                {openDropdown === 'type' && (
                    <div className="dropdownMenu typeMenu">
                        {propertyOptions.map(type => (
                            <label className="checkboxLabel" key={type}>
                                <input
                                    type="checkbox"
                                    checked={propertyTypes.includes(type)}
                                    onChange={() => togglePropertyType(type)}
                                />
                                <span>{type}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="filterDropdownWrapper">
                <div className={`filterDropdown ${openDropdown === 'bedrooms' ? 'active' : ''}`} onClick={() => toggleDropdown('bedrooms')}>
                    <div className="filterText">
                        <span className="filterLabel">Bedrooms</span>
                        <span className="filterValue">{bedrooms}</span>
                    </div>
                    <KeyboardArrowDownIcon sx={{ color: '#6B7280' }} />
                </div>
                {openDropdown === 'bedrooms' && (
                    <div className="dropdownMenu bedroomsMenu">
                        <h4>Bedrooms</h4>
                        <div className="pillContainer">
                            {bedroomOptions.map(opt => (
                                <button
                                    key={opt}
                                    className={`pillBtn ${bedrooms === opt ? 'selected' : ''}`}
                                    onClick={() => setBedrooms(opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="filterDropdownWrapper sortDropdown">
                <div className={`filterDropdown ${openDropdown === 'sort' ? 'active' : ''}`} onClick={() => toggleDropdown('sort')}>
                    <div className="filterText">
                        <span className="filterLabel">Sort by</span>
                        <span className="filterValue">{sortBy}</span>
                    </div>
                    <KeyboardArrowDownIcon sx={{ color: '#6B7280' }} />
                </div>
                {openDropdown === 'sort' && (
                    <div className="dropdownMenu sortMenu" style={{ minWidth: '200px', right: 0, left: 'auto' }}>
                        <div className="typeMenu">
                            {sortOptions.map(option => (
                                <label className="checkboxLabel" key={option} style={{ marginBottom: '8px' }}>
                                    <input
                                        type="radio"
                                        name="sortOption"
                                        checked={sortBy === option}
                                        onChange={() => {
                                            setSortBy(option);
                                            setOpenDropdown(null);
                                        }}
                                        style={{ accentColor: '#119E92', width: '16px', height: '16px' }}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

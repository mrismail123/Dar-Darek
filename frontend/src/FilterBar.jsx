import React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './filterBar.css';

export default function FilterBar() {
    const filters = [
        { label: 'Price range', value: '$20 – $500+' },
        { label: 'Guests', value: 'Any guests' },
        { label: 'Property type', value: 'All types' },
        { label: 'Bedrooms', value: 'Any' },
    ];

    return (
        <div className="filterBarContainer">
            <button className="mainFilterBtn">
                <FilterListIcon sx={{ fontSize: 20 }} />
                <span>Filter</span>
            </button>
            
            {filters.map((filter, index) => (
                <div className="filterDropdown" key={index}>
                    <div className="filterText">
                        <span className="filterLabel">{filter.label}</span>
                        <span className="filterValue">{filter.value}</span>
                    </div>
                    <KeyboardArrowDownIcon sx={{ color: '#6B7280' }} />
                </div>
            ))}

            <div className="filterDropdown sortDropdown">
                <div className="filterText">
                    <span className="filterLabel">Sort by</span>
                    <span className="filterValue">Most popular</span>
                </div>
                <KeyboardArrowDownIcon sx={{ color: '#6B7280' }} />
            </div>
        </div>
    );
}

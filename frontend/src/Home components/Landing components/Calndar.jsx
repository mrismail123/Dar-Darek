import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useThemeGlobal } from '../../Contexts/ThemeContext';
import { useEffect, useRef, useState } from 'react';

// Date picker imports
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

export default function Calndar(){
    const themeGloabl = useThemeGlobal();
    const dropdownRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    // 1. Data object state specifically for check-in and check-out as requested
    const [dates, setDates] = useState({
        checkIn: null,
        checkOut: null
    });

    // react-date-range expects this state format
    const [selectionRange, setSelectionRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });

    useEffect(()=>{
        const handleClickOutside = (e)=>{
            if(dropdownRef.current && !dropdownRef.current.contains(e.target)){
                setIsOpen(false);
            }
        }
        
        document.addEventListener("mousedown" , handleClickOutside);

        return ()=>{
            document.removeEventListener("mousedown" , handleClickOutside);
        }
    },[])

    const handleSelect = (ranges) => {
        setSelectionRange(ranges.selection);
        
        // Save the dates in our specific checkIn / checkOut object state
        setDates({
            checkIn: ranges.selection.startDate,
            checkOut: ranges.selection.endDate
        });
    };

    return (
        <div 
            ref={dropdownRef} 
            className='asjustmentFlexing' 
            style={{ position: 'relative' }}
        >
            {/* Check-in Trigger */}
            <div 
                className='asjustmentFlexing' 
                onClick={() => setIsOpen((prev) => !prev)}
                style={{ cursor: 'pointer', flex: 1 }}
            >
                <div>
                    <CalendarTodayOutlinedIcon sx={{color:themeGloabl.colors.primary}}/>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontWeight:"bold", fontSize:"0.7rem", margin: 0, color: '#222' }}>Check-in</p>
                    <p style={{ fontSize:"0.8rem", color: dates.checkIn ? '#222' : themeGloabl.colors.gray, margin: 0 }}>
                        {dates.checkIn ? format(dates.checkIn, 'MMM dd') : "Add dates"}
                    </p>
                </div>
                <KeyboardArrowDownOutlinedIcon sx={{ color: themeGloabl.colors.gray, transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}/>
            </div>

            {/* Check-out Trigger */}
            <div 
                className='asjustmentFlexing' 
                onClick={() => setIsOpen((prev) => !prev)}
                style={{ cursor: 'pointer', flex: 1 }}
            >
                <div>
                    <CalendarTodayOutlinedIcon sx={{color:themeGloabl.colors.primary}}/>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontWeight:"bold", fontSize:"0.7rem", margin: 0, color: '#222' }}>Check-out</p>
                    <p style={{ fontSize:"0.8rem", color: dates.checkOut && dates.checkOut !== dates.checkIn ? '#222' : themeGloabl.colors.gray, margin: 0 }}>
                        {dates.checkOut && dates.checkOut !== dates.checkIn ? format(dates.checkOut, 'MMM dd') : "Add dates"}
                    </p>
                </div>
                <KeyboardArrowDownOutlinedIcon sx={{ color: themeGloabl.colors.gray, transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}/>
            </div>

            {/* Dropdown Picker Panel with Animations */}
            <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'absolute',
                    top: 'calc(100% + 15px)',
                    left: '50%',
                    backgroundColor: '#fff',
                    boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
                    borderRadius: '24px',
                    padding: '16px',
                    zIndex: 100,
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    transform: isOpen ? 'translateX(-50%) translateY(0) scale(1)' : 'translateX(-50%) translateY(-15px) scale(0.95)',
                    transformOrigin: 'top center',
                    transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s',
                    border: '1px solid #ebebeb',
                    cursor: 'default',
                    overflow: 'hidden'
                }}
            >
                {/* The global CSS might reset some styles, but DateRange should bring its own */}
                <DateRange
                    ranges={[selectionRange]}
                    onChange={handleSelect}
                    minDate={new Date()} // Prevent selecting past dates
                    rangeColors={[themeGloabl.colors.primary || '#FF385C']} // Match the primary brand color
                    showSelectionPreview={true}
                    moveRangeOnFirstSelection={false}
                    months={1}
                    direction="horizontal"
                />
            </div>
        </div>
    )
}
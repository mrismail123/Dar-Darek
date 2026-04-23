import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useThemeGlobal } from '../../Contexts/ThemeContext';

import { useEffect, useRef, useState } from 'react';

export default function Guests(){

    const dropdownRef = useRef(null);
    const themeGloabl = useThemeGlobal();
    const [isOpen , setIsOpen] = useState(false);
    
    // 1. Initializing state object for guests
    const [guests, setGuests] = useState({ adults: 0, children: 0, pets: 0 });

    useEffect(()=>{
        const handleClickOutside = (e)=>{
            if(dropdownRef.current && !dropdownRef.current.contains(e.target)){
                setIsOpen(false);
            }
        }
        // Fixed: Event listener needs to be attached OUTSIDE the handler function
        document.addEventListener("mousedown" , handleClickOutside);

        return ()=>{
            document.removeEventListener("mousedown" , handleClickOutside);
        }
    },[])

    const updateGuest = (type, operation) => {
        setGuests(prev => {
            const newValue = prev[type] + operation;
            if (newValue < 0) return prev;
            return { ...prev, [type]: newValue };
        });
    };

    const renderGuestOption = (title, description, type) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: '600', fontSize: '1rem', color: '#222', margin: 0 }}>{title}</span>
                <span style={{ fontSize: '0.8rem', color: themeGloabl.colors.gray, margin: 0 }}>{description}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button 
                    onClick={(e) => { e.stopPropagation(); updateGuest(type, -1); }}
                    disabled={guests[type] === 0}
                    style={{
                        width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${guests[type] > 0 ? themeGloabl.colors.gray : '#ebebeb'}`,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: 'transparent', cursor: guests[type] > 0 ? 'pointer' : 'not-allowed',
                        color: guests[type] > 0 ? themeGloabl.colors.gray : '#ebebeb',
                        transition: 'all 0.2s', padding: 0
                    }}
                >
                    <RemoveIcon fontSize="small" />
                </button>
                <span style={{ width: '20px', textAlign: 'center', fontWeight: '600', fontSize: '1rem', color: '#222' }}>
                    {guests[type]}
                </span>
                <button 
                    onClick={(e) => { e.stopPropagation(); updateGuest(type, 1); }}
                    style={{
                        width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${themeGloabl.colors.gray}`,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: 'transparent', cursor: 'pointer', color: themeGloabl.colors.gray,
                        transition: 'all 0.2s', padding: 0
                    }}
                >
                    <AddIcon fontSize="small" />
                </button>
            </div>
        </div>
    );

    const totalGuests = guests.adults + guests.children;
    const guestText = totalGuests === 0 ? "Add guests" : `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`;
    const petsText = guests.pets > 0 ? `, ${guests.pets} pet${guests.pets > 1 ? 's' : ''}` : "";

    return (
        <div 
            ref={dropdownRef}
            onClick={() => setIsOpen((prev) => !prev)}
            className='asjustmentFlexing'
            style={{ position: 'relative', cursor: 'pointer' }}
        >
            <div>
                <PeopleAltOutlinedIcon sx={{color:themeGloabl.colors.primary}}/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontWeight:"bold", fontSize:"0.7rem", margin: 0, color: '#222' }}>Guests</p>
                <p style={{ fontSize:"0.8rem", color: totalGuests > 0 ? '#222' : themeGloabl.colors.gray, margin: 0 }}>
                    {guestText}{petsText}
                </p>
            </div>
            <KeyboardArrowDownOutlinedIcon 
                sx={{ color: themeGloabl.colors.gray, transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />

            {/* Dropdown Panel with Animations */}
            <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'absolute',
                    top: 'calc(100% + 15px)',
                    right: 0,
                    backgroundColor: '#fff',
                    boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
                    borderRadius: '24px',
                    padding: '24px',
                    width: '340px',
                    zIndex: 100,
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-15px) scale(0.95)',
                    transformOrigin: 'top right',
                    transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    border: '1px solid #ebebeb',
                    cursor: 'default'
                }}
            >
                {renderGuestOption("Adults", "Ages 13 or above", "adults")}
                <hr style={{ border: 'none', borderTop: '1px solid #ebebeb', margin: 0 }} />
                {renderGuestOption("Children", "Ages 2–12", "children")}
                <hr style={{ border: 'none', borderTop: '1px solid #ebebeb', margin: 0 }} />
                {renderGuestOption("Pets", "Bringing a service animal?", "pets")}
            </div>
        </div>
    )
}

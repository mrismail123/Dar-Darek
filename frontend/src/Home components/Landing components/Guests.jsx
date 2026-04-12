import React from "react";

// Material UI Icons
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

// MUI Materials 
import NumberSpinner from '../../NumberSpinner'
import { useBrowse } from '../../Contexts/BrowseContext';



export default function Guests(){
    const { browse, setBrowse } = useBrowse();


    // Guests picker ranging (Adults , children ,...)
    // ##################### START ########################
    const guestLimits = {
        adults: 16,
        children: 10,
        pets: 5
    }


    // show guests handler
    const [showGuestsConfigure , setShowGuestsConfigure] = React.useState(false);
    

    const guestsHandlerRef = React.useRef();
    const guestsTriggerRef = React.useRef();

    React.useEffect(() => {
    const handleClickCalendar = (e) => {
        const clickedInsideHandler = guestsHandlerRef.current?.contains(e.target);
        const clickedTrigger = guestsTriggerRef.current?.contains(e.target);

        if (!clickedInsideHandler && !clickedTrigger) {
        setShowGuestsConfigure(false);
        }
    };

    document.addEventListener("mousedown", handleClickCalendar);

    return () => {
        document.removeEventListener("mousedown", handleClickCalendar);
    };
    }, []);

    const handleGuestChange = (category, value) => {
        setBrowse((prevBrowse) => ({
            ...prevBrowse,
            guests: {
                ...prevBrowse.guests,
                [category]: value ?? 0
            }
        }));
    };


    // ##################### END ########################
    
    return (
        <>
            <div ref={guestsTriggerRef} onClick={()=>setShowGuestsConfigure((prev) => !prev)}>
                <p>Guests</p>
                <FamilyRestroomIcon sx={{fontSize:"small" , color:"rgb(104, 104, 104)"}}/>    
            </div>
            {
                showGuestsConfigure ?
                <div ref={guestsHandlerRef} className="GuestsHandler">
                    <div className="GuestsHandlerHeader">
                        <span className="GuestsEyebrow">Guest setup</span>
                        <h3>Choose who is staying</h3>
                        <p>Adjust each category with simple limits that fit a rental booking flow.</p>
                    </div>
                    <div className="GuestRow adults">
                        <div className="GuestCopy">
                            <p>Adults</p>
                            <span>Up to {guestLimits.adults} guests</span>
                        </div>
                        <NumberSpinner
                            min={0}
                            max={guestLimits.adults}
                            value={browse.guests.adults}
                            onValueChange={(value) => handleGuestChange('adults', value)}
                        />
                    </div>
                    <div className="GuestRow children">
                        <div className="GuestCopy">
                            <p>Children</p>
                            <span>Up to {guestLimits.children} guests</span>
                        </div>
                        <NumberSpinner
                            min={0}
                            max={guestLimits.children}
                            value={browse.guests.children}
                            onValueChange={(value) => handleGuestChange('children', value)}
                        />
                    </div>
                    <div className="GuestRow pets">
                        <div className="GuestCopy">
                            <p>Pets</p>
                            <span>Up to {guestLimits.pets} companions</span>
                        </div>
                        <NumberSpinner
                            min={0}
                            max={guestLimits.pets}
                            value={browse.guests.pets}
                            onValueChange={(value) => handleGuestChange('pets', value)}
                        />
                    </div>
                </div>
            :<></> 
            }        
        </>
    )
}
    

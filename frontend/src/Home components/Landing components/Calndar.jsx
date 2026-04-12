import * as React from 'react';


import { DateRange } from "react-date-range";
import { addDays, isBefore } from "date-fns";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';


// import browse context
import { useBrowse } from '../../Contexts/BrowseContext';
import { useThemeGlobal } from '../../Contexts/ThemeContext';



export default function Calendar(){

    // browseBar context
    const {browse , setBrowse} = useBrowse();

    // theme
    const themeGlobal = useThemeGlobal();

    // Start CheckIn / CheckOut Things
    // ##################### START ########################

    const [showCalendar, setShowCalendar] = React.useState(false);

    const [range, setRange] = React.useState([
        {
        startDate: new Date(),
        endDate: addDays(new Date(), 1),
        key: "selection",
        },
    ]);

    const handleSelect = (ranges) => {
        const { startDate, endDate } = ranges.selection;

        // Ensure check-out is after check-in
        if (isBefore(endDate, startDate)) {
        alert("Check-out date must be after check-in date.");
        return;
        }

        setRange([ranges.selection]);
        setBrowse({...browse ,checkIn:range[0].startDate.toLocaleDateString(),checkOut:range[0].endDate.toLocaleDateString()})        
    };

    const ref = React.useRef();
    React.useEffect(() => {
    const handleClickCalendar = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
        setShowCalendar(false);
        }
    };

    document.addEventListener("mousedown", handleClickCalendar);

    return () => {
        document.removeEventListener("mousedown", handleClickCalendar);
    };
    }, []);

    // ##################### END ########################
    return (
        <>
            <div onClick={()=>{setShowCalendar(true)}}>
                <p>{!browse.checkIn ? "Check-in" : browse.checkIn}</p>
                <CalendarMonthIcon sx={{fontSize:"small" , color:"rgb(104, 104, 104)"}}/>
            </div>
            <div onClick={()=>{setShowCalendar(true)}}>
                <p>{!browse.checkOut ? "Check-out" : browse.checkOut}</p>
                <CalendarMonthIcon sx={{fontSize:"small" , color:"rgb(104, 104, 104)"}}/>
            </div>

            {
            showCalendar ? 
            <div ref={ref} className='dateRange'>
                <DateRange
                    editableDateInputs={true}
                    onChange={handleSelect}
                    moveRangeOnFirstSelection={false}
                    ranges={range}
                    months={2}
                    direction="horizontal"
                    minDate={new Date()} // Prevent past dates
                    rangeColors={[themeGlobal.colors.primary]}
                />
            </div>
            :<></>
            }
        </>
    )
}

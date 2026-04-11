// Importing the logo
import Logo from './assets/logo.png'
// Importing the css file 
import './Home.css'
// Importing theme
import { useThemeGlobal } from './Contexts/ThemeContext';
// import header
import Header from './Header';
// import axios
import axios from 'axios';
// browse context state
import { useBrowse } from './Contexts/BrowseContext';
// External components
import Guests from './Guests';
import Location from './Location';
import Calendar from './Calndar';


// Start MUI #############################

// Material UI
import * as React from 'react';
import Button from '@mui/material/Button';

// Material UI Icons


// End MUI #############################



export default function Home(){
    // theme
    const themeGlobal = useThemeGlobal();
    // Browse data
    const {browse , setBrowse} = useBrowse();


    // start functions

    // browse form handling
    function handleBrowseFormSubmit(e){
        e.preventDefault();
    }

    return (
        <>
            {/* Start header */}
            <Header className="header"/>
            {/* End header */}

            {/* Start Landing */}
            <div className='landing' style={{display:"flex" , alignItems:"center" , flexDirection:"column" , justifyContent:"center" ,gap:"100px", textAlign:"center"}}>
                <div className='titling'>
                    <h1 style={{fontSize:"2.8rem",fontWeight:"700"}} className='font-luxury titleLanding'>Feel at <span style={{fontStyle:"italic" , marginRight:"3px"}}>h</span>ome</h1>
                    <p style={{fontSize:"1.5rem",color:themeGlobal.colors.text}} className='font-clean'>Find your place in northern Morocco</p>
                </div>
                <div style={{background:themeGlobal.colors.background,borderRadius:"5px"}} className="searchBar">
                    <form onSubmit={handleBrowseFormSubmit} className='browseForm' action="">
                        <Location/>
                        <Calendar/>
                        <Guests/>
                        <Button type='submit' sx={{background:themeGlobal.colors.primary,margin:"0px 10px",padding:'10px'}} variant='contained'>Browse Apartments</Button>
                    </form>

                </div>
            </div>
            {/* End Landing */}
        </>
        )
}

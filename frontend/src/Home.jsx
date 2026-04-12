// Importing the logo
import Logo from './assets/logo.png'
// Importing the css file 
import './Home.css'
// Importing theme
import { useThemeGlobal } from './Contexts/ThemeContext';
// import header
import Header from './Home components/Header';
// import axios
import axios from 'axios';
// browse context state
import { useBrowse } from './Contexts/BrowseContext';



// Start MUI #############################

// Material UI
import * as React from 'react';
import Button from '@mui/material/Button';
import Landing from './Home components/Landing';
import About from './Home components/About';

// Material UI Icons


// End MUI #############################



export default function Home(){
    // theme
    const themeGlobal = useThemeGlobal();
    // Browse data
    const {browse , setBrowse} = useBrowse();


    // start functions



    return (
        <>
            {/* Start header */}
            <Header className="header"/>
            {/* End header */}

            {/* Start Landing */}
            <Landing/>
            {/* End Landing */}

            {/* Start about */}
            <About/>
            {/* End about */}

            {/* Start footer*/}
            {/* End footer*/}
        </>
        )
}

// Importing the logo
import Logo from './assets/logo.png'
// Importing the css file 
import './Home.css'
// Importing theme
import { useThemeGlobal } from './Contexts/ThemeContext';


// Importing Components ######################

// import header
import Header from './Home components/Header';
import Footer from './Footer';
// import CitySection 
import CitySection from './CitySection';

// Importing Components ######################

// import axios
import axios from 'axios';
// browse context state


// Start MUI #############################

// Material UI
import * as React from 'react';
import Button from '@mui/material/Button';
import Landing from './Home components/Landing';
// Material UI Icons

// Token & Browse context
import { useBrowse } from './Contexts/BrowseContext';
import { useToken } from './Contexts/TokenContext';

// End MUI #############################



export default function Home() {
    // theme
    const themeGlobal = useThemeGlobal();

    const { token, setToken, user, setUser } = useToken();

    // states
    const [homePageProperties, setHomePageProperties] = React.useState(null);

    // start functions

    // Extracting Limited properties
    React.useEffect(() => {

        const extractLimitedHomePageProperties = async (e) => {
            try {
                const response = await axios.get('http://localhost:5000/api/extractHomePageProperties');

                setHomePageProperties(response.data);

            } catch (error) {
                if (error.response) {
                    alert(error.response.message || error.response.details || "Unknown");
                } else if (error.request) {
                    alert("Can't reach the server, please check the server is running on port:5000");
                } else {
                    alert("An error occured:", error);
                }
            }
        }
        // Call the function to start extracting
        extractLimitedHomePageProperties();

    }, []);


    return (
        <>
            {/* Start header */}
            <Header className="header" />
            {/* End header */}

            {/* Start Landing */}
            <Landing />
            {/* End Landing */}

            {homePageProperties &&
                (
                    <>
                        {/* Start Show the grid component */}
                        {/* For latest */}
                        <CitySection title="Latest Listings" properties={homePageProperties.latest} message="Freshly posted homes from across the north, ready to explore before everyone else." />
                        {/* For Tangier */}
                        <CitySection title="Tangier" properties={homePageProperties.tangier} message="Discover sea views, medina charm, and elegant stays in the gateway to northern Morocco." />
                        {/* For Tetouan */}
                        <CitySection title="Tetouan" properties={homePageProperties.tetouan} message="Browse calm white-city homes with Andalusian character and everyday comfort." />
                        {/* For Chefchaouen */}
                        <CitySection title="Chefchaouen" properties={homePageProperties.chefchaouen} message="Step into blue-street escapes, mountain calm, and cozy stays full of local soul." />
                        {/* For Asilah */}
                        <CitySection title="Asilah" properties={homePageProperties.asilah} message="Step into blue-street escapes, mountain calm, and cozy stays full of local soul." />
                        {/* For Al-Hoceima */}
                        <CitySection title="Al-Hoceima" properties={homePageProperties.alHoceima} message="Step into blue-street escapes, mountain calm, and cozy stays full of local soul." />
                        {/* Start Show the grid component */}
                    </>

                )
            }

            {/* Start footer*/}
            <Footer />
            {/* End footer*/}
        </>
    )
}

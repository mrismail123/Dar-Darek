// Importing the css file 
import './Home.css'


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
import Landing from './Home components/Landing';
import SectionDivider from './SectionDivider';
import { Container } from '@mui/material';
import { buildApiUrl } from './lib/api';

// End MUI #############################



export default function Home() {
    // states
    const [homePageProperties, setHomePageProperties] = React.useState(null);

    // start functions

    // Extracting Limited properties
    React.useEffect(() => {

        const extractLimitedHomePageProperties = async () => {
            try {
                
                const response = await axios.get(buildApiUrl('/api/extractHomePageProperties'));

                setHomePageProperties(response.data);



            } catch (error) {
                if (error.response) {
                    console.log(error.response.message || error.response.details || "Unknown");
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
                       
                        <Container>
                        <SectionDivider/>
                       </Container>

                        {/* For Tangier */}
                        <CitySection title="Tangier" properties={homePageProperties.tangier} message="Discover sea views, medina charm, and elegant stays in the gateway to northern Morocco." />
                        
                       
                        <Container>
                        <SectionDivider/>
                       </Container>

                        {/* For Tetouan */}
                        <CitySection title="Tetouan" properties={homePageProperties.tetouan} message="Browse calm white-city homes with Andalusian character and everyday comfort." />
                        
                       
                        <Container>
                        <SectionDivider/>
                       </Container>
                        
                        {/* For Chefchaouen */}
                        <CitySection title="Chefchaouen" properties={homePageProperties.chefchaouen} message="Step into blue-street escapes, mountain calm, and cozy stays full of local soul." />
                        
                       
                        <Container>
                        <SectionDivider/>
                       </Container>

                        {/* For Asilah */}
                        <CitySection title="Asilah" properties={homePageProperties.asilah} message="Step into blue-street escapes, mountain calm, and cozy stays full of local soul." />
                        
                       
                        <Container>
                        <SectionDivider/>
                       </Container>
                    
                        
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

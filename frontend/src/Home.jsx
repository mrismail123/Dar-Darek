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
import { Box, Container } from '@mui/material';
import { buildApiUrl } from './lib/api';

// End MUI #############################



const MIN_HOME_LOADING_MS = 850;

function HomeLoadingSection() {
    return (
        <Container className="home-loading listingHomePageContainer" aria-live="polite" aria-label="Loading homepage properties">
            <div className="home-loading__header">
                <div>
                    <span className="home-skeleton home-skeleton--title" />
                    <span className="home-skeleton home-skeleton--copy" />
                </div>
                <span className="home-skeleton home-skeleton--button" />
            </div>

            <div className="home-loading__slider">
                {[1, 2, 3, 4, 5].map((item) => (
                    <article className="home-skeleton-card" key={item}>
                        <span className="home-skeleton home-skeleton--image" />
                        <div className="home-skeleton-card__body">
                            <span className="home-skeleton home-skeleton--name" />
                            <span className="home-skeleton home-skeleton--city" />
                            <div className="home-skeleton-card__footer">
                                <span className="home-skeleton home-skeleton--price" />
                                <span className="home-skeleton home-skeleton--rating" />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </Container>
    );
}

export default function Home() {
    // states
    const [homePageProperties, setHomePageProperties] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const citySections = React.useMemo(() => {
        if (!homePageProperties) {
            return [];
        }

        return [
            {
                title: "Latest Listings",
                properties: homePageProperties.latest,
                message: "Freshly posted homes from across the north, ready to explore before everyone else.",
            },
            {
                title: "Tangier",
                properties: homePageProperties.tangier,
                message: "Discover sea views, medina charm, and elegant stays in the gateway to northern Morocco.",
            },
            {
                title: "Tetouan",
                properties: homePageProperties.tetouan,
                message: "Browse calm white-city homes with Andalusian character and everyday comfort.",
            },
            {
                title: "Chefchaouen",
                properties: homePageProperties.chefchaouen,
                message: "Step into blue-street escapes, mountain calm, and cozy stays full of local soul.",
            },
            {
                title: "Asilah",
                properties: homePageProperties.asilah,
                message: "Step into blue-street escapes, mountain calm, and cozy stays full of local soul.",
            },
            {
                title: "Al-Hoceima",
                properties: homePageProperties.alHoceima,
                message: "Step into blue-street escapes, mountain calm, and cozy stays full of local soul.",
            },
        ].filter((section) => Array.isArray(section.properties) && section.properties.length > 0);
    }, [homePageProperties]);


    // start functions

    // Extracting Limited properties
    React.useEffect(() => {
        let isActive = true;

        const extractLimitedHomePageProperties = async () => {
            const loadingStartedAt = Date.now();

            setIsLoading(true);

            try {

                const response = await axios.get(buildApiUrl('/api/extractHomePageProperties'));

                if (isActive) {
                    setHomePageProperties(response.data);
                }



            } catch (error) {
                if (error.response) {
                    console.log(error.response.message || error.response.details || "Unknown");
                } else if (error.request) {
                    alert("Can't reach the server, please check the server is running on port:5000");
                } else {
                    alert("An error occured:", error);
                }
            } finally {
                const elapsed = Date.now() - loadingStartedAt;
                const remaining = Math.max(MIN_HOME_LOADING_MS - elapsed, 0);

                if (remaining > 0) {
                    await new Promise((resolve) => window.setTimeout(resolve, remaining));
                }

                if (isActive) {
                    setIsLoading(false);
                }
            }
        }
        // Call the function to start extracting
        extractLimitedHomePageProperties();

        return () => {
            isActive = false;
        };

    }, []);


    return (
        <>
            {/* Start header */}
            <Header className="header" />
            {/* End header */}

            {/* Start Landing */}
            <Landing />
            {/* End Landing */}

            {isLoading ? (
                <HomeLoadingSection />
            ) : homePageProperties &&
                (
                    <>
                        {citySections.length > 0 ? (
                            citySections.map((section, index) => (
                                <React.Fragment key={section.title}>
                                    <CitySection
                                        title={section.title}
                                        properties={section.properties}
                                        message={section.message}
                                    />
                                    {index < citySections.length - 1 ? (
                                        <Container>
                                            <SectionDivider />
                                        </Container>
                                    ) : null}
                                </React.Fragment>
                            ))
                        ) : (
                            <Container sx={{ paddingY: { xs: 6, md: 10 } }}>
                                <Box
                                    sx={{
                                        borderRadius: "18px",
                                        border: "1px solid rgba(215, 194, 154, 0.5)",
                                        background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,246,238,0.96))",
                                        boxShadow: "0 10px 28px rgba(73, 55, 28, 0.08)",
                                        padding: { xs: "28px 22px", md: "42px 48px" },
                                        textAlign: "center",
                                    }}
                                >
                                    <h2 className="font-luxury" style={{ margin: "0 0 12px", color: "#1A1A1A" }}>
                                        No properties listed yet
                                    </h2>
                                    <p style={{ margin: 0, color: "#5F6876", fontSize: "1rem", lineHeight: 1.7 }}>
                                        We are preparing fresh stays for this area. Please check back soon for new listings.
                                    </p>
                                </Box>
                            </Container>
                        )}
                    </>

                )}

            {/* Start footer*/}
            <Footer />
            {/* End footer*/}
        </>
    )
}

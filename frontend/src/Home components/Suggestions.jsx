
// import images 
import chefchaouen from '../assets/chefchaouen.jpg'
import tangier from '../assets/landingBackground.jpg'
import tetouan from '../assets/traditionalGlasses.jpg'
import Container from "@mui/material/Container";

// MUI
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import ShieldIcon from '@mui/icons-material/Shield';
import { useThemeGlobal } from '../Contexts/ThemeContext';
export default function Suggestions(){

    const themeGlobal = useThemeGlobal();
    return (
        <Container sx={{
            display:"flex" , 
            justifyContent:"space-between",
            alignItems:"center",
            marginTop:"100px",
            background:themeGlobal.colors.background,
            padding:"10px",
            margin:"0",
            width:"100%"
            }}>
            <div className="norhtCitiesBoxes">
                <h3 className='font-luxury'>Explore <span style={{color:themeGlobal.colors.primary}}>Northern Morocco</span></h3>
                <div className="cards">
                    <div cityName="Tangier" className="card">
                        <img src={tangier} alt="" />
                    </div>
                    <div cityName="Chefchaouen"  className="card">
                        <img src={chefchaouen} alt="" />
                    </div>
                    <div cityName="Tetouan" className="card">
                        <img src={tetouan} alt="" />
                    </div>
                </div>
            </div>
            <div className="guarantee">
                <h3 className='font-luxury'>Verified & Trusted Hosts</h3>
                <p>Quality homes with trusted local hosts</p>
                <div className="cards">
                    <div className="card">
                        <CheckCircleIcon sx={{color:themeGlobal.colors.primary}}/>
                        <p className='font-clean'>Verified Listings</p>
                    </div>

                    <div className="card">
                        <ShieldIcon sx={{color:themeGlobal.colors.primary}}/>
                        <p>Secure Booking</p>
                    </div>

                    <div className="card">
                        <HeadsetMicIcon sx={{color:themeGlobal.colors.primary}}/>
                        <p>24/7 Support</p>
                    </div>

                </div>
            </div>
        </Container>
    )
}
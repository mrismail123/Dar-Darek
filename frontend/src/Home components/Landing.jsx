// MUI materials 
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// MUI icons
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

// External components
import Guests from './Landing components/Guests';
import Location from './Landing components/Location';
import Calendar from './Landing components/Calndar';

// import theme
import { useThemeGlobal } from '../Contexts/ThemeContext';






export default function Landing(){
    const themeGlobal = useThemeGlobal();

    // functions 
    
    
    // browse form handling
    function handleBrowseFormSubmit(e){
        e.preventDefault();
    }
    return (
        <Container className='landing' sx={{
            padding:"40px",
            display:"flex" , 
            alignItems:"flex-start", 
            flexDirection:"column",
            gap:"50px",
            }}>
            <div style={{maxWidth:"100%" , width:"50%"}} className='titling'>
                <p className='landingEyebrow'>Welcome to Dar Darek</p>
                <h1 style={{fontSize:"3.7rem",fontWeight:"bold"}} className='font-luxury titleLanding'>Feel at home</h1>
                <p style={{color:themeGlobal.colors.gray}} className='landingLead'>Find your place in northern Morocco with stays that feel local, warm, and easy to trust.</p>
            </div>
            <div style={{background:themeGlobal.colors.background}} className="searchBar">
                <form style={{
                    display:"flex",
                    justifyContent:"space-between",
                    alignItems:"center"
                }} onSubmit={handleBrowseFormSubmit} className='browseForm' action="">
                    <Location/>
                    <Calendar/>
                    <Guests/>
                    <Button sx={{padding:"10px",background:themeGlobal.colors.primary , color:"white"}} variant='filled'>Browse stays</Button>
                </form>
            </div>
            <div className="about">
                <div>
                    <VerifiedUserOutlinedIcon sx={{color:themeGlobal.colors.lineSeparetor}}/>
                    <div>
                        <p>Trusted stays</p>
                        <p style={{color:themeGlobal.colors.gray}}>Carefully selected for comfort and quality.</p>
                    </div>
                </div>
                <div>
                    <SupportAgentOutlinedIcon sx={{color:themeGlobal.colors.lineSeparetor}}/>
                    <div>
                        <p>Local support</p> 
                        <p style={{color:themeGlobal.colors.gray}}>We&apos;re here to help before and during your stay.</p> 
                    </div>
                </div>
                <div>
                    <LocalOfferOutlinedIcon sx={{color:themeGlobal.colors.lineSeparetor}}/>
                    <div>
                        <p>Best price guarantee</p>
                        <p style={{color:themeGlobal.colors.gray}}>Honest prices, no hidden fees or surprises.</p>
                    </div>
                </div>
            </div>
        </Container>

    )
}

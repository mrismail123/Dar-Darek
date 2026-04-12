// MUI materials 

import Button from '@mui/material/Button';

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

    )
}
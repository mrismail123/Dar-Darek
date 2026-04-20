
import Button from "@mui/material/Button"
import Zelij from "../assets/Zelij.jpg"
import { useThemeGlobal } from "../Contexts/ThemeContext"

import Container from "@mui/material/Container";

export default function About(){
    const themeGlobal = useThemeGlobal();
    return (
            <div style={{marginTop:"100px"}} className="aboutSection">
                <Container>
                    <div className="info">
                        <h2 className="font-luxury" style={{fontWeight:"normal",color:themeGlobal.colors.accent}}>Feel at home</h2>
                        <p style={{
                            height:"2px",
                            width:"70px",
                            margin:"0 auto",
                            marginBottom:"10px",
                            background:"rgb(122, 112, 52)",
                            borderRadius:"50%"
                        }}></p>
                        <p style={{color:themeGlobal.colors.accent}}>Experience warm Moroccan hospitality and comfort.</p>
                        <Button
                        variant="contained"
                        sx={{background:themeGlobal.colors.primary}}
                        >
                            Learn More
                        </Button>
                    </div>
                </Container>
                <div className="picture">
                    <img src={Zelij} alt="" />
                </div>
            </div>
    )
}
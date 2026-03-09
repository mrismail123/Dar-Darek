// import css file
import './Authentication.css'

// import images 
import Tangier from './assets/Tangier2.jpg'

// import comps
import LoginOrSignup from './LoginOrSignup'

export default function Authentication(){
    return (
        <div className='auth-page container-fluid min-vh-100 p-0 font-clean'>
            <div className="row g-0 min-vh-100">
            <div className="images col-lg-7 d-none d-lg-block">
                <img src={Tangier} alt="Tangier background"/>
                <div className="dar-darek-overlay">
                    <h2>Dar Darek</h2>
                    <p className="meaning">Feel at home</p>
                    <div className="culture-lines">
                        <p>From the medina alleys to modern living spaces.</p>
                        <p>Inspired by Moroccan hospitality and neighborhood trust.</p>
                        <p>A digital souk for homes, built with a local spirit.</p>
                    </div>
                </div>
            </div>
            <div className="auth-form-col col-12 col-lg-5 d-flex justify-content-center align-items-center py-4 px-2 px-sm-3">
                <LoginOrSignup/>
            </div>
            </div>
        </div>
    )
}

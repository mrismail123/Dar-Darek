import traditionalGlasses from './assets/traditionalGlasses.jpg'

import "./propertiesPage.css"

import Header from './Home components/Header';

import { useSearchParams } from 'react-router-dom';


import FilterBar from './FilterBar';

export default function PropertiesPage() {
    // params
    const [searcParams] = useSearchParams();
    console.log(searcParams.get("city"))
    return (
        <>
            <Header />
            <div className="dynamicPropertiesIntro">
                <div className="intro">
                    <p className="breadcrumb"><a href="/">Home</a> / <span>Tangier stays</span></p>
                    <h2 className="font-luxury">{searcParams.get("city")} stays</h2>

                    <div className="title-separator">
                        <div className="line"></div>
                        <div className="diamond"></div>
                        <div className="line"></div>
                    </div>

                    <p className="description">Discover sea views, medina charm, and elegant homes across northern Morocco.</p>
                </div>
                <div className="image">
                    <img src={traditionalGlasses} alt="Tangier stays" />
                </div>
            </div>
            <div className="showProperties" style={{ padding: '0 5%' }}>
                <div className='properties'>
                    <FilterBar />
                    {/* Add your property cards here later */}
                </div>
                <div className='mapAndAboutCity'>
                    <div className="map">

                    </div>
                    <div className="about">

                    </div>
                </div>
            </div>
        </>
    )
}

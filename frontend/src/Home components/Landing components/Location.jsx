
import React from "react"

import axios from "axios"

import { useBrowse } from "../../Contexts/BrowseContext";

// select search
import Select2 from 'react-select'

export default function Location(){

    //browse info
    const {browse , setBrowse} = useBrowse();

    // Search Location Part (State , API call , render)
    // ##################### START ########################

    const [options , setOptions] = React.useState(null)
    
    React.useEffect(()=>{
        axios.get('http://localhost:5000/api/extractCities')
        .then(res=>{
            setOptions(  
                res.data.map(city => ({
                    label: city.name,   // what shows in the dropdown
                    value: city.name    // the value of the option
                })))
        })
        .catch(err=>{
            console.log(err)
        })
    },[])

    // ###################### END #########################

    return (
        <Select2
            className="LocationSelect"
            classNamePrefix="locationSelect"
            placeholder={browse.Location || "Location"}
            onChange={(e)=>{setBrowse({...browse,Location:e.value})}}
            value={browse.Location}
            options={options}
        />
    )
}

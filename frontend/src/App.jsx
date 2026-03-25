import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'

// import components
// import Home from './Home'

import Authentication from './Authentication'
// import SignUp from './SignUp'



function App() {

  return (
    <>
      <Authentication/>
      <Routes>
        {/* <Route path='/' element={<Home/>} /> */}
        <Route path='/' element={<></>} />
        <Route path='/Authentication' element={<Authentication/>} />
        {/* <Route path='/signin' element={<SignIn/>} /> */}
      </Routes>
    </>
  )
}

export default App
// 
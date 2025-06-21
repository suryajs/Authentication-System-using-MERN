import React from 'react'
import Navbar from '../components/navbar'
import Header from '../components/Header'

const Home = () => {
  return (
    <div className='flex felx-col items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
        <Navbar/>
        <Header/>
    </div>
  )
}

export default Home
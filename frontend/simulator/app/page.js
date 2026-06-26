"use client"
import { useRouter } from 'next/navigation'
import { Bebas_Neue } from 'next/font/google'
import Link from 'next/link'

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400'
})

const SimulateButton = () => {

  const router = useRouter();

  const onClick = ()=>{
    router.push('/simulation')
  }

  return (
    <button className={`${bebas.className} bg-teal-400 w-full py-3 rounded-md font-bold text-black text-xl tracking-widest uppercase hover:bg-yellow-400 hover:text-black shadow-lg shadow-teal-500 active:scale-95 transition-all duration-300 hover:scale-105`}
      onClick={onClick}
    >
      Simulate
    </button>
  )
}

const HomePage = () => {
  return (
    <div className="relative flex w-full min-h-screen justify-center items-center">

      {/* Mercedes image as background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://i.redd.it/mercedes-x-amd-w11-4k-wallpapers-v0-hkvmw8vl2e181.png?width=3840&format=png&auto=webp&s=69e30938e86fdffe92e214165666bf1f08376801)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Translucent black overlay */}
      <div className="absolute inset-0 bg-black opacity-60"/>

      {/* Teal grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(45,212,191,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      

      {/* Main card */}
      <div className="relative z-10 flex flex-col bg-gray-900 bg-opacity-80 p-10 rounded-2xl space-y-6 shadow-2xl shadow-teal-500 border border-teal-500 w-96">

        {/* Top racing stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-teal-400 to-transparent rounded-full"/>

        {/* Title */}
        {/* Mercedes logo */}
        <div className={`${bebas.className} text-7xl tracking-widest bg-gradient-to-r from-gray-600 via-white to-gray-600 bg-clip-text text-transparent text-center`}>
          My Simulator
        </div>

        {/* Tagline */}
        <p className="text-teal-400 text-sm tracking-widest uppercase text-center">
          EQ Performance
        </p>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-400 to-transparent"/>

        {/* Login button */}
        <SimulateButton />

        {/* Bottom racing stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-teal-400 to-transparent rounded-full"/>

      </div>
    </div>
  )
}

export default HomePage
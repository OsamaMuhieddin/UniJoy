"use client"
import { AlignLeft } from "lucide-react"
import Sidebar from "./Sidebar"
import { useState } from "react"

const MobileMenu = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
      <>
        <button onClick={() => {setIsSidebarOpen(!isSidebarOpen)}}>
            <AlignLeft className=" hover:text-darkColor hoverEffect md:hidden" />
        </button>
        <div className="md:hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() =>{setIsSidebarOpen(false)}}/>
        </div>
      </>
    )
}

export default MobileMenu

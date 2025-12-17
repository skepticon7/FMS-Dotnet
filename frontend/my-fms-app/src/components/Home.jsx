import React,  { useState , useRef , useEffect } from 'react'
import Dashboard from './Dashboard'
import {
    BarChart3,
    Bell,
    Building2,
    Calendar,
    Download,
    Filter,
    Globe,
    Menu,
    Database,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    TrendingUp,
    Users,
    Wifi,
    Wrench,
    X,
    Settings,
    LogOut,
    UserCog,
    Eye,
    ChevronDown, ServerCog, HardDriveDownload, HeartPlus,
    Stethoscope,
    ClipboardCheck,
    FileUp
} from "lucide-react"
import { getInitials } from '../Utils/getInitials'
import {useAuth} from "../context/AuthContext.jsx";
import {
    Exports,
    Interventions,
    InterventionTypes, NewExportation,
    NewIntervention,
    Schedule,
    Sites,
    Patients,
    Doctors,
    Files,
    UsersManagement
} from "./index.js";

import {vivoMiniLogo} from "../assets/index.js";
import UserViewUpdate from "@/components/UserViewUpdate.jsx";




const SideBarButton = ({selectedOption , setSelectedOption , title , Icon}) => {
    return (
        <button 
            onClick={() => setSelectedOption(title.toLowerCase())}   
          className={`flex w-full cursor-pointer py-3 px-3 rounded-md items-start  justify-start gap-3 hover:bg-dark-green transition-colors duration-200 ${selectedOption === title.toLowerCase() ? 'bg-dark-green' : 'bg-extradark-green'}`}>
           <Icon className='w-5 h-5 text-white stroke-[2]'/>
            <p className='text-white font-medium'>{title}</p>
        </button>

    )
}


const Home = () => {
    const [modalOpen , setModalOpen] = useState(false);
    const {user , logout} = useAuth();
    const role = user?.role;
    const {selectedPage , setSelectedPage} = useAuth();
    const [searchQuery , setSearchQuery] = useState("");
    const [profileDropDown , setProfileDropDown] = useState(false);
    const [dataModalOpen , setDataModalOpen] = useState(false)
    const [profileModalState , setProfileModal] = useState({
        userId : null,
        isOpen : false,
        isEdit : false,
        userRole : ""
    })

    const handleOpenModal = ( ) => {
        setProfileModal(prev => ({
            ...prev,
            isEdit : true,
            isOpen: true
        }))
    }

    const handleCloseModal = () => {
        setProfileModal(prev => ({...prev, isOpen: false}));
    };

    useEffect(() => {
        setProfileModal(prev => ({
            ...prev,
            userId: user?.id,
            userRole: user?.role
        }))
    }, [user]);

    const renderCurrentPage = () => {
        switch(selectedPage) {
            case 'dashboard' : return <Dashboard/>
            case 'patients' : return <Patients/>
            case 'doctors' : return <Doctors/>
            case 'files' : return <Files/>
            case 'usersManagement' : return <UsersManagement/>
        }
    }

    const dropdownRef = useRef(null);

    useEffect(() => {
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropDown(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
    }, []);

    const handleLogout = () => {
        logout();
    }


  return (
    <div className='flex max-h-screen'>
        <aside className=' flex flex-col items-start justify-start sticky overflow-y-auto inset-y-0 left-0 w-76'>
            <div className='bg-dark-green w-full  px-6 py-3'>
                <div className='flex items-center space-x-3'>
                    <div className='flex p-1.5 items-center justify-center rounded-md bg-extradark-green'>
                        <HeartPlus className='w-6 h-6 rounded-md text-main-green'/>
                    </div>
                    <div>
                        <span className='text-xl font-bold text-white'>FMS</span>
                        <p className='text-xs text-white/60'>File Management System</p>
                    </div>
                </div>
            </div>
            <nav className='bg-extradark-green flex flex-col justify-between items-start w-full h-full px-6 py-4'>
                    <div className='space-y-2 w-full'>
                        <SideBarButton selectedOption={selectedPage} setSelectedOption={setSelectedPage} title={"Dashboard"} Icon={BarChart3}/>
                        {(role === "Doctor" || role === "Manager") &&
                            <SideBarButton  selectedOption={selectedPage} setSelectedOption={setSelectedPage} title={"Patients"} Icon={Users}/>
                        }
                        {(role === "Manager") && <SideBarButton  selectedOption={selectedPage} setSelectedOption={setSelectedPage} title={"Doctors"} Icon={Stethoscope}/>}
                        <SideBarButton  selectedOption={selectedPage} setSelectedOption={setSelectedPage} title={"Files"} Icon={ClipboardCheck}/>

                        {(role === "Manager") &&
                            <button
                                onClick={() => setSelectedPage("usersManagement")}
                                className={`flex w-full cursor-pointer py-3 px-3 rounded-md items-start justify-start gap-3 hover:bg-dark-green transition-colors duration-200 ${selectedPage === 'usersManagement' ? 'bg-dark-green' : null}`}>
                                <UserCog className='w-5 h-5 text-white stroke-[2]'/>
                                <p className='text-white font-medium'>Users Management</p>
                            </button>}
                    </div>

                {(role === "Manager") && (
                    <div className='p-3 flex flex-col items-start justify-start gap-2 w-full rounded-lg bg-dark-green'>
                        <p className='text-sm text-white font-semibold'>Quick Actions</p>
                        <button
                            onClick={() => setModalOpen(true)}
                            className='flex gap-2 w-full cursor-pointer rounded-md p-2 bg-main-green transition-colors duration-200 hover:bg-main-green/60'>
                            <FileUp className='w-5 h-5 text-white'/>
                            <p className='text-sm font-semibold text-white'>New File</p>
                        </button>
                    </div>
                )}
            </nav>
        </aside>

        <div className='flex-1 flex-col overflow-y-auto h-screen'>
            <header className='bg-white border-b border-gray-300 border-[1px]    shadow-sm'>
                <div className='flex items-center justify-between px-6 py-4'>

                    <div className='flex items-center space-x-4'>
                        <div className='flex flex-col items-start justify-center gap-1'>
                            <h1 className='text-2xl font-bold text'>
                                {selectedPage === 'dashboard' && "Operations Dashboard"}
                                {selectedPage === 'doctors' && "Doctors"}
                                {selectedPage === 'patients' && "Patients"}
                                {selectedPage === 'files' && "Files"}
                                {selectedPage === "usersManagement" && "Users management"}
                            </h1>
                            <p className='text-sm font-medium text-gray-500'>
                                {selectedPage === 'dashboard' && "Realtime monitoring & management"}
                                {selectedPage === 'patients' && "Manage patients profiles"}
                                {selectedPage === 'files' && "Manage and track all technician interventions"}
                                {selectedPage === 'doctors' && "Manage doctors profile"}
                                {selectedPage === 'usersManagement' && "Manage user accounts, roles, and permissions"}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center space-x-4'>

                        <div className='relative border-black' ref={dropdownRef}>
                            <button
                             onClick={(e) => {
                                e.stopPropagation();
                                setProfileDropDown(!profileDropDown)
                             }} 
                             className='bg-main-green cursor-pointer flex  items-center justify-center w-12 h-12 rounded-full'>
                                {user && <p className='font-bold text-white text-lg'>{getInitials(user.fullName)}</p>}
                            </button>
                            {profileDropDown && (
                                <div 
                                 className={`absolute top-15 -right-30 border border-gray-300 border-[1px] rounded-lg p-3 w-56 shadow-xl bg-white flex flex-col justify-start items-start gap-2 ${profileDropDown ? 'dropdown-animate-down' : 'dropdown-animate-up'} `}
                                onClick={(e) => e.stopPropagation()}
                                 >
                                    <div className='flex flex-col items-start justify-start gap-1'>
                                        {user && <p className='font-semibold text-lg '>{user.fullName}</p>}
                                        {user && <p className='border border-[1px] border-gray-300 rounded-full px-2 text-sm font-semibold'>{user.role}</p>}
                                    </div>
                                    <hr className='border border-[1px] border-gray-300 w-full mt-2'/>
                                    <div className='w-full flex flex-col items-start justify-start gap-1'>
                                        <button
                                            onClick={() =>{
                                                handleOpenModal()
                                                setProfileDropDown(false)
                                            }}
                                            className='w-full cursor-pointer flex items-center justify-start rounded-md py-1 px-2 gap-3 hover:bg-gray-100 bg-transparent transition-colors duration-200 w-full'
                                        >
                                            <Settings className='w-4 h-4 text-black'/>
                                            <p className='font-medium text-md'>Profile</p>
                                        </button>
                                        <button
                                            onClick={() => handleLogout()}
                                            className='w-full cursor-pointer flex items-center justify-start rounded-md py-1 px-2 gap-3 hover:bg-gray-100 bg-transparent transition-colors duration-200 w-full' >
                                            <LogOut className='w-4 h-4 text-black'/>
                                            <p className='font-medium text-md'>Log out</p>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </header>
            <main className='p-6 flex-1 bg-gray-100 min-h-screen'>{renderCurrentPage()}</main>
            <NewIntervention isOpen={modalOpen} onClose={() => setModalOpen(false)}></NewIntervention>
            <NewExportation isOpen={dataModalOpen} onClose={() => setDataModalOpen(false)}/>
            <UserViewUpdate
                isEdit={profileModalState.isEdit}
                isOpen={profileModalState.isOpen}
                onClose={handleCloseModal}
                userRole={profileModalState.userRole}
                technicianId={profileModalState.userId}
            />
        </div>


    </div>
  )
}

export default Home




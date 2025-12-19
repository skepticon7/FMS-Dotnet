import React, {useEffect, useMemo, useRef, useState} from 'react'
import {
  ChevronDown,
  Plus,
  Search,
  Users,
  CircleCheckBig,
  Clock,
  CalendarOff,
  MoreHorizontal,
  Eye,
  BriefcaseIcon,
  ListCheck,
  Pin,
  SquarePen, Phone, Mail, Briefcase, ServerCrash, UserX, Play, CircleCheck
} from "lucide-react";
import {formatLabel} from "../Utils/formatLabel.js";
import {useAuth} from "../context/AuthContext.jsx";
import {getInterventionTypes, getTechniciansSupervisors} from "../services/api.js";
import OverviewCard from "../shared/OverviewCard.jsx";
import {getInitials} from "../Utils/getInitials.js";
import axios from "axios";
import UserViewUpdate from "./UserViewUpdate.jsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const SearchBarFilter = ({filterOptions , setFilterOptions}) => {
  const {searchTerm  , selectedStatus} = filterOptions;

  const technicianStatus = [
    {value : "AVAILABLE" , label : "Available"},
    {value : "BUSY" , label: "Busy"},
    {value : "ON_LEAVE" , label : "On Leave"},
  ];

  return(
      <div className='flex items-start justify-center w-full gap-5 flex-col p-6 bg-white rounded-lg border-[1px] border-gray-300'>
        <p className='text-2xl font-bold text-black'>Filters & Search</p>
        <div className='grid grid-cols-3 w-full gap-5'>
            <Input
                value={searchTerm}
                onChange={(e) => setFilterOptions({...filterOptions , searchTerm : e.target.value})}
                placeholder="Search Patients..."
                className="py-5 focus:outline-none focus:ring-0 w-full"
            />

          <Select
              value={selectedStatus}
              onValueChange={(value) => setFilterOptions({
                ...filterOptions,
                selectedStatus : value
              })}
          >
            <SelectTrigger
                className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
              <SelectValue
                  placeholder="Select technician status"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={'all'} value="all">All Statuses</SelectItem>
              {technicianStatus.map((status) => (
                  <SelectItem
                      key={status.value}
                      value={status.value}
                  >
                    <div>{status.label}</div>
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
              value={filterOptions.sortType}
              onValueChange={(value) => setFilterOptions({
                ...filterOptions,
                sortType : value
              })}
          >
            <SelectTrigger
                className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
              <SelectValue
                  placeholder="Select sorting criteria"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={'newest'} value="newest">newest</SelectItem>
              <SelectItem value='oldest'>Oldest</SelectItem>
              <SelectItem value="ICA">Interventions Completed - Ascending</SelectItem>
              <SelectItem value="ICD">Interventions Completed - Descending</SelectItem>
              <SelectItem value="IAA">Interventions Assigned - Ascending</SelectItem>
              <SelectItem value="IAD">Interventions Assigned - Descending</SelectItem>
              <SelectItem value="HDA">Hire Date - Ascending</SelectItem>
              <SelectItem value="HDD">Hire Date - Descending</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </div>
  )
}

const TechniciansOverview = ({technicians}) => {
  return (
      <div className='grid grid-cols-4 gap-5 w-full'>
        <OverviewCard title='Total Patients' Icon={Users} description={5} background={'bg-blue-500/30'}  button={'text-blue-500'}/>
        <OverviewCard title='Available' Icon={CircleCheckBig} description={5} background={'bg-green-500/20'} button={'text-green-500'}/>
        <OverviewCard title='Busy' Icon={Clock} description={5} background={'bg-yellow-500/20'} button={'text-yellow-500'}/>
        <OverviewCard title='On Leave' Icon={CalendarOff} description={5} background={'bg-red-500/20'} button={'text-red-500'}/>
      </div>
  )
}

const TechnicianCard = ({technician  ,role , onView , onEdit}) => {
  const [actionsDropDown , setActionsDropDown] = useState(false);
  const dropDownRef = useRef();

  const technicianStatusStyles = {
    'AVAILABLE': 'bg-green-100 text-green-800 border-green-200',
    'BUSY': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'ON_LEAVE': 'bg-red-100 text-red-800 border-red-200',
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setActionsDropDown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const roleStyles = {
    'SUPERUSER' : {
      style : 'bg-red-100 text-red-800 border-red-200',
      iconStyle : 'text-red-500'
    } ,
    'SUPERVISOR' : {
      style : 'bg-blue-100 text-blue-800 border-blue-200',
      iconStyle : 'text-red-500',
    },
    'TECHNICIAN' : {
      style : 'bg-green-100 text-green-800 border-green-200',
      iconStyle : 'text-green-500',
    }
  }


  return (
      <div className='p-6 bg-white border-[1px] border-gray-300 rounded-lg relative'>
        <div className='flex flex-col items-start justify-start '>
          <div className='flex flex-col items-start justify-start gap-2'>
            <div className='flex items-center justify-center gap-3'>
              <p className='p-3 h-12 w-12 flex items-center justify-center text-lg text-white rounded-full bg-main-green font-bold'>{getInitials(technician.firstName.concat(" ").concat(technician.lastName))}</p>
              <div className='flex flex-col items-start justify-center'>
                <p className='font-bold text-lg '>{technician.firstName.concat(" ").concat(technician.lastName)}</p>
              </div>
            </div>
            <div className='flex items-center justify-start gap-2'>
              {technician.technicianStatus === 'AVAILABLE' && (
                  <>
                    <CircleCheckBig className='text-main-green w-5 h-5'/>
                    <p className={`border-[1px] px-2 py-1 rounded-full text-xs font-semibold ${technicianStatusStyles[technician.technicianStatus]}`}>Available</p>
                  </>
              )}
              {technician.technicianStatus === 'BUSY' && (
                  <>
                    <Clock className='text-yellow-500 w-5 h-5'/>
                    <p className={`border-[1px] px-2 py-1 rounded-full text-xs font-semibold ${technicianStatusStyles[technician.technicianStatus]}`}>Busy</p>
                  </>
              )}
              {technician.technicianStatus === 'ON_LEAVE' && (
                  <>
                    <CalendarOff className='text-red-500 w-5 h-5'/>
                    <p className={`border-[1px] px-2 py-1 rounded-full text-xs ${technicianStatusStyles[technician.technicianStatus]}`}>On
                      Leave</p>
                  </>
              )}
              <p className={`text-xs rounded-full font-semibold border-[1px] px-2 py-1  ${roleStyles[technician.role].style}`}>{formatLabel(technician.role)}</p>
            </div>
          </div>
          <div className='flex flex-col gap-2 '>
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionsDropDown(!actionsDropDown);
                }}
                className="cursor-pointer"
            >
              <MoreHorizontal className='text-black absolute top-9 right-5'/>
            </button>

            {actionsDropDown && (
                <div
                    ref={dropDownRef}
                    className="absolute p-1 z-50 -right-12 shadow-xl top-12 min-w-50 bg-white border border-gray-300 rounded-lg flex flex-col items-start dropdown-animate-down"
                >
                  <button
                      onClick={() => {
                        onView();
                        setActionsDropDown(false);
                      }}
                      className="flex items-center gap-5 p-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                    <Eye className="w-5 h-5 text-black"/>
                    <p className="font-medium text-sm">View Details</p>
                  </button>
                  {(role === "SUPERUSER" || role === "SUPERVISOR") && (
                      <button
                          onClick={() => {
                            setActionsDropDown(false);
                            onEdit();
                          }}
                          className="flex items-center gap-5 p-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                        <SquarePen className="w-5 h-5 text-black"/>
                        <p className="font-medium text-sm">Edit Profile</p>
                      </button>
                  )}
                </div>
            )}
          </div>

          <div className='flex flex-col items-start justify-start gap-2 mt-5'>
            <div className='flex gap-3 items-start justify-start'>
              <Phone className='w-5 h-5 text-gray-400'/>
              <p className='font-regular text-black text-sm'>{technician.phoneNumber}</p>
            </div>
            <div className='flex gap-3 items-start justify-start'>
              <Mail className='w-5 h-5 text-gray-400'/>
              <p className='font-regular text-black text-sm'>{technician.email}</p>
            </div>
          </div>

          <hr className='border-t-[1px] border-gray-300 w-full mt-5 mb-5'/>

          <div className='w-full grid grid-cols-2 gap-4 '>
            <div className='flex flex-col items-start justify-start w-full rounded-lg'>
              <p className='text-gray-500 text-sm'>Completed</p>
              <div className='flex items-center justify-start gap-2'>
                <ListCheck className='w-5 h-5 text-main-green'/>
                <p className='text-black text-sm font-semibold'>{technician.interventionsCompleted || 0}</p>
              </div>
            </div>
            <div  className='flex flex-col items-start justify-start w-full rounded-lg'>
              <p className='text-gray-500 text-sm'>Assigned</p>
              <div className='flex items-center justify-start gap-2'>
                <Pin className='w-5 h-5 text-yellow-500'/>
                <p className='text-black text-sm font-semibold'>{technician.interventionsAssigned.length}</p>
              </div>
            </div>
            <div  className='flex flex-col items-start justify-start w-full rounded-lg'>
              <p className='text-gray-500 text-sm'>Hire Date</p>
              <div className='flex items-center justify-center gap-2'>
                <BriefcaseIcon className='w-5 h-5 text-red-500'/>
                <p className='text-black text-sm font-semibold'>{technician.hireDate}</p>
              </div>
            </div>
          </div>


        </div>
      </div>
  )
}


const Doctors = () => {
  const [technicians, setTechnicians] = useState([]);
  const [interventionTypes , setInterventionTypes] = useState([])
  const [filterOptions, setFilterOptions] = useState({
    searchTerm: "",
    selectedStatus: "all",
    sortType: "newest"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {user} = useAuth();
  const role = user?.roles?.split("_")[1];


  const [modalState, setModalState] = useState({
    userRole : null,
    technicianId: null,
    isOpen: false,
    viewOnly: false,
    isEdit: false
  })

  const handleOpenModal = (technicianId = null, userRole = null , viewOnly = false, isEdit = false) => {
    setModalState({
      userRole,
      isOpen: true,
      viewOnly,
      isEdit,
      technicianId
    });
  }

  const handleCloseModal = () => {
    setModalState(prev => ({...prev, isOpen: false}));
  };


  const filteredTechnicians = useMemo(() => {
    return technicians
        .filter((technician) => {
          const matchesSearchTerm =
              technician.firstName.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
              technician.lastName.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
              technician.email.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
              technician.phoneNumber.toLowerCase().includes(filterOptions.searchTerm.toLowerCase());

          const matchesStatus =
              filterOptions.selectedStatus === "all" || technician.technicianStatus === filterOptions.selectedStatus;

          return matchesStatus && matchesSearchTerm;
        })
        .sort((a, b) => {
          switch (filterOptions.sortType) {
            case "newest":
              return new Date(b.createdAt) - new Date(a.createdAt);
            case "oldest":
              return new Date(a.createdAt) - new Date(b.createdAt);
            case "ICA":
              return a.interventionsCompleted - b.interventionsCompleted;
            case "ICD":
              return b.interventionsCompleted - a.interventionsCompleted;
            case "IAA":
              return a.interventionsAssigned.length - b.interventionsAssigned.length;
            case "IAD":
              return b.interventionsAssigned.length - a.interventionsAssigned.length;
            case "HDA":
              return new Date(a.hireDate) - new Date(b.hireDate);
            case "HDD":
              return new Date(b.hireDate) - new Date(a.hireDate);
            default:
              return 0;
          }
        });
  }, [technicians, filterOptions]);

  const fetchTechniciansAndInterventionTypes = async () => {
    try{
      setLoading(true);
      let usersCall;
      if (role === "SUPERVISOR") {
        usersCall =  getTechnicians;
      } else if (role === "SUPERUSER") {
        usersCall = getTechniciansSupervisors;
      } else {
        throw new Error("Invalid role");
      }
      const [techniciansResponse , interventionTypesResponse] = await axios.all([
        usersCall() , getInterventionTypes()
      ]);
      setInterventionTypes(interventionTypesResponse.data);
      setTechnicians(techniciansResponse.data);
    }catch (e) {
      console.error("Error fetching technicians:", e);
      setError(`Error fetching technicians: ${e}`);
    }finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if(!user) return;
    fetchTechniciansAndInterventionTypes();
  }, [user]);





  return (
    <div className='flex flex-col justify-start items-start  h-full gap-6 w-full'>
        {loading ? (
            <div className='flex items-center justify-center w-full py-30'>
                <span className="loading loading-spinner custom-spinner loading-2xl text-main-green "></span>
            </div>
        ) : error != null ? (
            <div className='flex items-center flex-col justify-center w-full py-30'>
                <ServerCrash className="w-16 h-16 text-red-600 mb-4"/>
                <h2 className="text-2xl font-bold text-red-700 mb-2">Server Error</h2>
                <p className="text-red-600 text-center">
                    Oops! Something went wrong on our side. Please try refreshing the page or come back later.
                </p>
            </div>
        ) : (
            <>
              {(role === "SUPERUSER" || role === "SUPERVISOR") && (
                  <button
                      onClick={() => handleOpenModal(null, false, false)}
                      className='flex items-center gap-5 self-end justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer bg-main-green/90 hover:bg-main-green'>
                    <Plus className='text-white'/>
                    <p className='text-md text-white font-medium'>Create Technician</p>
                  </button>
              )}
              <TechniciansOverview technicians={technicians}/>
              <SearchBarFilter filterOptions={filterOptions} setFilterOptions={setFilterOptions}/>

              {filteredTechnicians.length === 0 ? (
                  <div className='flex flex-col items-center justify-center w-full py-30'>
                    <UserX className="w-16 h-16 text-red-600 mb-4"/>
                    <h2 className="text-2xl font-bold text-red-700 mb-2">No Patients</h2>
                    <p className="text-red-600 text-center">
                      Create a technician to get started or try adjusting your filters.
                    </p>
                  </div>
              ) : (
                  <div className='grid grid-cols-3 gap-5 w-full'>
                    {filteredTechnicians.map((tech) => (
                        <TechnicianCard
                            technician={tech}
                            role={role}
                            onView={() => handleOpenModal(tech.id, tech.role, true, false)}
                            onEdit={() => handleOpenModal(tech.id, tech.role, false, true)}
                        />
                    ))}
                  </div>
              )}
            </>
        )}
      <UserViewUpdate
          userRole={modalState.userRole}
          viewOnly={modalState.viewOnly}
          isEdit={modalState.isEdit}
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          technicianId={modalState.technicianId}
      />
    </div>
  )
}

export default Doctors;
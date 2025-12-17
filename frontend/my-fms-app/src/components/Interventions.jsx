import React, {useEffect, useMemo, useRef, useState} from 'react'
import {getInterventions, getInterventionsStats, getSites} from "../services/api.js";
import {
  Eye,
  MoreHorizontal,
  Plus,
  ServerCrash,
  SquarePen,
  Trash2,
  UserX,
  Wrench,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Search,
  ChevronDown,
  Filter,
  FunnelPlus,
  Funnel,
  MapPin,
  CircleCheckBig,
  Play,
  Clock,
  Pin,
  User, Notebook, ChevronRight, ChevronLeft, X, CalendarX2, CircleCheck, CalendarOff
} from "lucide-react";
import {useAuth} from "../context/AuthContext.jsx";
import {formatLabel} from "../Utils/formatLabel.js";
import OverviewCard from "../shared/OverviewCard.jsx";
import {getInitials} from "../Utils/getInitials.js";
import {NewIntervention} from "./index.js";
import axios from "axios";
import AdvancedFilters from "./AdvancedFilters.jsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
import {Input} from "@/components/ui/input.js";


const InterventionOverview = ({stats}) => {
  return (
      <div className='grid grid-cols-4 gap-5 w-full'>
        <OverviewCard title={'Total'} Icon={Calendar} description={stats.total} button={'text-blue-500'} background={'bg-blue-100'}/>
        <OverviewCard title={'In Progress'} Icon={Play} description={stats.inProgress} button={'text-blue-500'} background={'bg-blue-100'}/>
        <OverviewCard title={'Completed'} Icon={CheckCircle} description={stats.completed} button={'text-green-500'} background={'bg-green-100'}/>
        <OverviewCard title={'Urgent'} Icon={AlertTriangle} description={stats.urgent} button={'text-red-500'} background={'bg-red-100'}/>
      </div>
  )
}

const SearchBarFilter = ({activeFilters , setActiveFilters , allSites  , resetAllFilters }) => {
  const {filtersApplied , setFiltersApplied} = useAuth();
  const [advancedModalOpen , setAdvancedModalOpen] = useState(false);

  function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
  }

  const [localCode, setLocalCode] = useState(activeFilters.code || "");
  const debouncedCode = useDebounce(localCode, 500);

  useEffect(() => {
    setActiveFilters({...activeFilters, code: debouncedCode});
  }, [debouncedCode]);



  const interventionStatus = [
    {value : "SCHEDULED" , label : "Scheduled"},
    {value : "IN_PROGRESS" , label: "In Progress"},
    {value : "COMPLETED" , label : "Completed"},
    {value : "CANCELED" , label: "Canceled"}
  ];

  const interventionPriority = [
    {value : "LOW" , label : "Low"},
    {value : "MEDIUM" , label: "Medium"},
    {value : "HIGH" , label : "High"},
    {value : "URGENT" , label: "Urgent"},
    {value : "CRITICAL" , label: "Critical"},
  ];


  return (
      <div
          className='flex items-start justify-center w-full gap-6 flex-col p-6 bg-white rounded-lg border-[1px] border-gray-300'>
        <div className='flex items-center justify-between w-full'>
          <p className='text-2xl font-bold text-black'>Filters & Search</p>
          {filtersApplied ? (
              <button
                  onClick={() => {
                    resetAllFilters();
                    setFiltersApplied(false)
                  }}
                  className='flex gap-3 items-center justify-center cursor-pointer bg-red-500/90 transition-colors duration-200 rounded-md p-2  hover:bg-red-500'>
                <X className='w-5 h-5 text-white'/>
                <p className='text-sm font-medium text-white'>Remove Filters</p>
              </button>
          ) : (
              <button
                  onClick={() => setAdvancedModalOpen(true)}
                  className='flex gap-3 items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md p-2 border border-[1px] border-gray-300 bg-transparent'>
                <FunnelPlus className='w-5 h-5 text-black'/>
                <p className='text-sm font-medium '>Advanced </p>
              </button>
          )}
        </div>
        <div className='grid grid-cols-4 w-full gap-5'>
            <Input
                value={localCode}
                disabled={filtersApplied}
                onChange={(e) => setLocalCode(e.target.value)}
                placeholder="Search By Code..."
                className={`py-5 focus:outline-none focus:ring-0 w-full ${filtersApplied ? 'bg-gray-100 text-gray-400' : ''}`}
            />
          <Select
              disabled={filtersApplied}
              value={activeFilters.statuses[0] || ''}
              onValueChange={(value) => setActiveFilters({
                ...activeFilters,
                statuses: value === 'all' ? [] : [value]
              })}
          >
            <SelectTrigger
                className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
              <SelectValue
                  placeholder="Select intervention status"/>
            </SelectTrigger>
            <SelectContent>
                    <SelectItem key={'all'} value="all">All Statuses</SelectItem>
              {interventionStatus.map((inter) => (
                    <SelectItem
                        key={inter.value}
                        value={inter.value}
                    >
                          <div>{inter.label}</div>
                    </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
              disabled={filtersApplied}
              value={activeFilters.priorities[0] || ''}
              onValueChange={(value) => setActiveFilters({
                ...activeFilters,
                priorities: value === 'all' ? [] : [value]
              })}
          >
            <SelectTrigger
                className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
              <SelectValue
                  placeholder="Select intervention priority"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={'all'} value="all">All Priorities</SelectItem>
              {interventionPriority.map((prio) => (
                  <SelectItem
                      key={prio.value}
                      value={prio.value}
                  >
                    <div>{prio.label}</div>
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
              disabled={filtersApplied}
              value={activeFilters.siteIds[0] || ''}
              onValueChange={(value) => setActiveFilters({
                ...activeFilters,
                siteIds: value === 'all' ? [] : [value]
              })}
          >
            <SelectTrigger
                className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
              <SelectValue
                  placeholder="Select site"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={'all'} value="all">All Statuses</SelectItem>
              {allSites.map((site) => (
                  <SelectItem
                      key={site.id}
                      value={site.id}
                  >
                    <div>{site.siteName}</div>
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AdvancedFilters
            onClose={() => setAdvancedModalOpen(false)}
            isOpen={advancedModalOpen}
            setAllFilters={setActiveFilters}
        />
      </div>
  )
}
const InterventionRow = ({intervention, index, interventionsSize, onView, onEdit}) => {

  const [actionsDropDown, setActionsDropDown] = useState(false);
  const dropDownRef = useRef();

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

  const statusStyles = {
    'In Progress': 'bg-blue-900 text-white',
    'Completed': 'bg-green-500 text-white',
    'Scheduled': 'bg-purple-500 text-white',
    'Canceled': 'bg-gray-400 text-white',
  };

  const priorityStyles = {
    'Low': 'bg-green-100 text-green-800 border-green-200',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'High': 'bg-orange-100 text-orange-800 border-orange-200',
    'Critical': 'bg-red-100 text-red-800 border-red-200',
    'Urgent': 'bg-pink-100 text-pink-800 border-pink-200',
  };

  return (
      <tr
          key={intervention.id}
          className={`text-left ${index === interventionsSize - 1 ? 'border-none' : 'border-b border-gray-300'}`}
      >
        <td className="font-mono text-sm font-semibold py-4 px-2">{intervention.code}</td>
        <td className="text-sm py-4">
          <div className='flex gap-2 items-center justify-start'>
            <MapPin className='text-gray-400 w-5'/>
            <p className='text-sm'>{intervention.site.name}</p>
          </div>
        </td>
        <td className="text-sm py-4 font-medium">
          <div className='flex items-center justify-start gap-2'>
            <p className='p-3 h-8 w-8 flex items-center justify-center text-sm text-white rounded-full bg-main-green font-medium'>{getInitials(intervention.interventionAssignedTo.fullName)}</p>
            <p>{intervention.interventionAssignedTo.fullName}</p>
          </div>
        </td>
        <td className="text-sm py-4">{intervention.interventionType.name}</td>
        <td className="py-4">
        <span
            className={`text-xs font-semibold py-1 px-2 rounded-full ${statusStyles[formatLabel(intervention.interventionStatus)]}`}>
                   {formatLabel(intervention.interventionStatus)}
        </span>
        </td>
        <td className="py-4">
        <span
            className={`text-xs font-semibold py-1 px-2 rounded-full border ${priorityStyles[formatLabel(intervention.interventionPriority)]}`}>
                                        {formatLabel(intervention.interventionPriority)}
             </span>
        </td>
        <td className="text-sm py-4 flex flex-col gap-0">
          <p>{intervention.startDate.split("T")[0].split("-").join("/")}</p>
          <p className="text-gray-500">
            {new Date(intervention.startDate)
                .toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: true})}
          </p></td>
        <td className="relative">
          <button
              onClick={(e) => {
                e.stopPropagation();
                setActionsDropDown(!actionsDropDown);
              }}
              className="cursor-pointer"
          >
            <MoreHorizontal/>
          </button>

          {actionsDropDown && (
              <div
                  ref={dropDownRef}
                  className="absolute p-1 z-50 -right-3 shadow-xl top-11 min-w-50 bg-white border border-gray-300 rounded-lg flex flex-col items-start dropdown-animate-down"
              >
                <button
                    onClick={() => {
                      onView()
                      setActionsDropDown(false)
                    }}
                    className="flex items-center gap-5 p-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                  <Eye className="w-5 h-5 text-black"/>
                  <p className="font-medium text-sm">View Details</p>
                </button>
                <button
                    onClick={() => {
                      onEdit()
                      setActionsDropDown(false)
                    }}
                    className="flex items-center gap-5 p-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                  <SquarePen className="w-5 h-5 text-black"/>
                  <p className="font-medium text-sm">Edit Intervention</p>
                </button>
              </div>
          )}
        </td>
      </tr>
  )
}


const InterventionCard = ({intervention , onView , onEdit}) => {

  const [actionsDropDown , setActionsDropDown] = useState(false);
  const dropDownRef = useRef();

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

  const statusStyles = {
    'In Progress': 'bg-blue-500 text-white',
    'Completed': 'bg-green-500 text-white',
    'Scheduled': 'bg-purple-500 text-white',
    'Canceled': 'bg-gray-400 text-white',
  };

  const priorityStyles = {
    'Low': 'bg-green-100 text-green-800 border-green-200',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'High': 'bg-orange-100 text-orange-800 border-orange-200',
    'Critical': 'bg-red-100 text-red-800 border-red-200',
    'Urgent': 'bg-pink-100 text-pink-800 border-pink-200',
  };

  return (
      <div className='p-6 bg-white border-[1px] border-gray-300 rounded-lg relative '>
          <div className='flex flex-col gap-4 items-start justify-center'>
            <div className='flex flex-col items-start justify-center gap-2 w-full'>
              <div className='flex items-center justify-between w-full'>
                <p className='text-lg font-extrabold '>{intervention.code}</p>
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActionsDropDown(!actionsDropDown);
                    }}
                    className="cursor-pointer"
                >
                  <MoreHorizontal className='text-black'/>
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
                      {
                        <button
                            onClick={() => {
                              setActionsDropDown(false);
                              onEdit();
                            }}
                            className="flex items-center gap-5 p-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                          <SquarePen className="w-5 h-5 text-black"/>
                          <p className="font-medium text-sm">Edit Profile</p>
                        </button>
                      }
                    </div>
                )}
              </div>
              <div className='flex items-center justify-start gap-2'>
                {intervention.interventionStatus === 'COMPLETED' && (
                    <>
                      <CircleCheckBig className='text-main-green w-5 h-5'/>
                      <p className={`border-[1px] px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[formatLabel(intervention.interventionStatus)]}`}>Completed</p>
                    </>
                )}
                {intervention.interventionStatus === 'IN_PROGRESS' && (
                    <>
                      <Play className='text-blue-500 w-5 h-5'/>
                      <p className={`border-[1px] px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[formatLabel(intervention.interventionStatus)]}`}>In
                        Progress</p>
                    </>
                )}
                {intervention.interventionStatus === 'CANCELED' && (
                    <>
                      <CalendarX2 className='text-gray-400 w-5 h-5'/>
                      <p className={`border-[1px] px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[formatLabel(intervention.interventionStatus)]}`}>Canceled</p>
                    </>
                )}
                {intervention.interventionStatus === 'SCHEDULED' && (
                    <>
                      <Clock className='text-purple-500 w-5 h-5'/>
                      <p className={`border-[1px] px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[formatLabel(intervention.interventionStatus)]}`}>Scheduled</p>
                    </>
                )}
                <p className={`border-[1px] px-2 py-1 rounded-full text-xs font-semibold ${priorityStyles[formatLabel(intervention.interventionPriority)]}`}>{formatLabel(intervention.interventionPriority)}</p>
              </div>
            </div>

            <div className='flex flex-col items-start justify-center gap-2'>
              <div className='flex items-center justify-start gap-2'>
                <MapPin className='text-gray-400 w-4.5 h-4.5'/>
                <p className='text-sm'>{intervention.site.name}</p>
              </div>
              <div className='flex items-center justify-start gap-2'>
                <User className='text-gray-400 w-4.5 h-4.5'/>
                <p className='text-sm'>{intervention.interventionAssignedTo.fullName}</p>
              </div>
              <div className='flex items-center justify-start gap-2'>
                <Clock className='text-gray-400 w-4.5 h-4.5'/>
                <p className='text-sm'>{intervention.startDate.split("T")[0].split("-").join("/")} at {new Date(intervention.startDate)
                    .toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: true})}</p>
              </div>
              <div className='flex items-center justify-start gap-2'>
                <Notebook className='text-gray-400 w-4.5 h-4.5'/>
                <p className='text-sm'>{intervention.comment.length > 50 ? `${intervention.comment.slice(0 , 49)}...` : intervention.comment} </p>
              </div>
            </div>
          </div>
      </div>
  )
}


const Interventions = () => {

  const {user } = useAuth();
  const role = user?.roles?.split("_")[1];


  const [allFilters , setAllFilters] = useState({
    code : '',
    statuses : [],
    types : [],
    priorities : [],
    siteIds : [],
    userIds : [],
    interventionTypesIds : [],
    startDate : null,
    endDate : null
  })
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [interventions, setInterventions] = useState([])
  const [stats , setStats] = useState([]);
  const [sites , setSites] = useState([])
  const [selectedPage, setSelectedPage] = useState(0)

  const [modalState, setModalState] = useState({
    interventionId: null,
    isOpen: false,
    viewOnly: false,
    isEdit: false
  })

  const handleOpenModal = (interventionId = null, viewOnly = false, isEdit = false) => {
    setModalState({
      interventionId,
      isOpen: true,
      viewOnly,
      isEdit
    })
  }

  const handleCloseModal = () => {
    setModalState(prev => ({...prev, isOpen: false}))
  }

  const [cachedInterventions, setCachedInterventions] = useState({
    data: {},
    timestamps: {},
    maxAge: 3 * 60 * 1000 // 3 minutes
  });

  const getSanitizedFilters = (filters) => {
    const {page , size , ...cleanFilters} = filters;
    return cleanFilters;
  }

  const getCacheKey = (page , filters) => {
    const cleanFilters = getSanitizedFilters(filters);
    return `page_${page}_${JSON.stringify(cleanFilters)}`
  }

  const fetchInterventionsAndSites = async (page = selectedPage , filters = allFilters) => {
    try {
      const cacheKey = getCacheKey(page , filters);
      const cachedData = cachedInterventions.data[cacheKey];
      const cachedTimestamp = cachedInterventions.timestamps[cacheKey];
      const now = Date.now();

      if (cachedData && cachedTimestamp && (now - cachedTimestamp < cachedInterventions.maxAge)) {
        setInterventions(cachedData);
        const statsResponse = await getInterventionsStats(role , user?.id);
        setStats(statsResponse.data)
        return;
      }
      const params = {
        ...getSanitizedFilters(filters),
        page,
        size : 5
      }
      setLoading(true);
      const [interventionsResponse , statsResponse , sitesResponse] = await axios.all([
          getInterventions(params , user?.id , role) , getInterventionsStats(role , user?.id) , getSites()
      ]);
      setCachedInterventions(prev => ({
        ...prev,

        data: {
          ...prev.data,
          [cacheKey]: interventionsResponse.data.content
        },
        timestamps: {
          ...prev.timestamps,
          [cacheKey]: now
        }
      }))
      setStats(statsResponse.data);
      setInterventions(interventionsResponse.data.content);
      setSites(sitesResponse.data);
    } catch (e) {
      setError(e.response?.data?.message || "Internal Server Error");
    } finally {
      setLoading(false);
    }
  }

  const handleAdvancedFilteringOnSucccess = (filters) => {
    fetchInterventionsAndSites(0 , filters);
  }



  useEffect(() => {
    if(!role || !user) return;
    fetchInterventionsAndSites(selectedPage);
  }, [selectedPage  , allFilters, role , user]);

 const handleResetAllFilters = () => {
   setAllFilters({
     code : '',
     statuses : [],
     priorities: [],
     siteIds: [],
     userIds: [],
     interventionTypesIds: [],
     startDate: [],
     endDate: [],
     types : []
   })
 }


  return (
      <div className='flex flex-col items-start justify-start  w-full gap-6 '>
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
        ) :  (
            <>
              <button
                  onClick={() => handleOpenModal(null, false, false)}
                  className='flex items-center gap-5 self-end justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer bg-main-green/90 hover:bg-main-green'>
                <Plus className='text-white'/>
                <p className='text-md text-white font-medium'>Create Intervention</p>
              </button>
              <InterventionOverview stats={stats}/>
              <SearchBarFilter
                  role={role}
                  resetAllFilters={handleResetAllFilters}
                  onAdvancedFiltersApply={handleAdvancedFilteringOnSucccess}
                  allSites={sites}
                  activeFilters={allFilters}
                  setActiveFilters={setAllFilters}
              />
              <div
                  className='border mb-5 border-[1px] bg-white border-gray-300 rounded-lg flex flex-col gap-5 w-full p-5'>
                <div className='flex items-start justify-between w-full'>
                  <p className='text-2xl font-bold'> Interventions</p>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <button
                          onClick={() => setSelectedPage(selectedPage - 1)}
                          disabled={selectedPage === 0}
                          className="h-10 flex items-center justify-center border border-gray-300 px-3 cursor-pointer transition-colors duration-200 bg-transparent hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <ChevronLeft className="w-5 h-5 text-black"/>
                      </button>

                      <button

                          className="h-10 flex items-center justify-center border border-gray-300 px-3 cursor-pointer transition-colors duration-200 bg-transparent hover:bg-gray-100 rounded-md"
                      >
                        <p className='font-semibold'>Page {selectedPage}</p>
                      </button>
                      <button
                          onClick={() => setSelectedPage(selectedPage + 1)}
                          className="h-10 flex items-center justify-center border border-gray-300 px-3 cursor-pointer transition-colors duration-200 bg-transparent hover:bg-gray-100 rounded-md"
                      >
                        <ChevronRight className="w-5 h-5 text-black"/>
                      </button>
                    </div>

                    <button
                        onClick={() => setViewMode("list")}
                        className={`h-10 flex items-center justify-center px-3 cursor-pointer transition-colors duration-200 rounded-md ${
                            viewMode === "list"
                                ? "bg-main-green/90 hover:bg-main-green border-none text-white"
                                : "border border-gray-300 hover:bg-gray-100 bg-transparent"
                        }`}
                    >
                      List
                    </button>

                    <button
                        onClick={() => setViewMode("grid")}
                        className={`h-10 flex items-center justify-center px-3 cursor-pointer transition-colors duration-200 rounded-md ${
                            viewMode === "grid"
                                ? "bg-main-green/90 hover:bg-main-green border-none text-white"
                                : "border border-gray-300 hover:bg-gray-100 bg-transparent"
                        }`}
                    >
                      Grid
                    </button>
                  </div>

                </div>

                {interventions.length === 0 ? (
                    <div className='flex flex-col items-center justify-center w-full py-30'>
                      <Wrench className="w-16 h-16 text-red-600 mb-4"/>
                      <h2 className="text-2xl font-bold text-red-700 mb-2">No Interventions</h2>
                      <p className="text-red-600 text-center">
                        Create an Intervention to get started or try adjusting your filters.
                      </p>
                    </div>
                ) : (
                    <>
                      {viewMode === 'list' ? (
                          <table className='border-collapse w-full'>
                            <thead>
                            <tr className='border-b-[1px] border-gray-300 text-left'>
                              <th className='font-bold text-sm py-3 px-2'>Code</th>
                              <th className='font-bold text-sm'>Site</th>
                              <th className='font-bold text-sm'>Technician</th>
                              <th className='font-bold text-sm'>Type</th>
                              <th className='font-bold text-sm'>Status</th>
                              <th className='font-bold text-sm'>Priority</th>
                              <th className='font-bold text-sm'>Scheduled</th>
                              <th className='font-bold text-sm'>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                              interventions.map((intervention, index) => (
                                  <InterventionRow
                                      intervention={intervention}
                                      index={index}
                                      onView={() => handleOpenModal(intervention.id, true, false)}
                                      onEdit={() => handleOpenModal(intervention.id, false, true)}
                                      interventionsSize={interventions.length}
                                  />
                              ))
                            }
                            </tbody>
                          </table>
                      ) : (
                          <div className='grid grid-cols-3 gap-5 w-full'>
                            {interventions.map((intervention) => (
                                <InterventionCard
                                    intervention={intervention}
                                    onView={() => handleOpenModal(intervention.id, true, false)}
                                    onEdit={() => handleOpenModal(intervention.id, false, true)}
                                />
                            ))}
                          </div>
                      )}
                    </>

                )}
              </div>


            </>
        )}
        <NewIntervention
            interventionId={modalState.interventionId}
            viewOnly={modalState.viewOnly}
            isEdit={modalState.isEdit}
            isOpen={modalState.isOpen}
            onClose={handleCloseModal}
        />

      </div>
  )
}

export default Interventions
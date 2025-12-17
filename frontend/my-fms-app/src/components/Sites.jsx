import React, {useEffect, useRef, useState} from 'react'
import {
    Plus,
    Building,
    Search,
    ChevronDown,
    MoreHorizontal,
    CircleCheckBig,
    Ban,
    Construction,
    Siren, MapPin, Phone, Mail, Info, Pen, Trash2, Eye, SquarePen, ServerCrash, UserX, MapPinOff
} from 'lucide-react'
import {getInitials} from "../Utils/getInitials.js";
import {getSites} from "../services/api.js";
import {formatLabel} from "../Utils/formatLabel.js";
import {NewIntervention} from "./index.js";
import NewSite from "./NewSite.jsx";
import {useAuth} from "../context/AuthContext.jsx";
import OverviewCard from "../shared/OverviewCard.jsx";
import {Input} from "@/components/ui/input.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";


const SiteOverview = ({sites}) => {

  return (
      <div className='grid grid-cols-4 gap-5 w-full'>
        <OverviewCard title={'Total Sites'} background = {'bg-blue-500/30'}  button =  {'text-blue-500'} description={sites.length} Icon={Building}/>
        <OverviewCard title={'Active'} description={sites.filter((site) => site.siteStatus === 'ACTIVE').length} Icon={CircleCheckBig} background={'bg-green-500/20'} button={'text-green-600'}/>
        <OverviewCard title={'Maintenance'} description={sites.filter((site) => site.siteStatus === 'MAINTENANCE').length} Icon={Construction} background={'bg-orange-500/30'} button={'text-orange-500'}/>
        <OverviewCard title={'Emergency'} description={sites.filter((site) => site.siteStatus === 'EMERGENCY').length} Icon={Siren} background={'bg-red-500/30'} button={'text-red-500'}/>
      </div>
  )
}

const SearchBarFilter = ({searchTerm , setSearchTerm , selectedStatus , setSelectedStatus , sortType , setSortType}) => {

    const siteStatuses = [
        {value : "ACTIVE" , label : "Active"},
        {value : "MAINTENANCE" , label: "Maintenance"},
        {value : "EMERGENCY" , label : "Emergency"},
        {value : "INACTIVE" , label: "Inactive"}
    ];
  return(
      <div className='flex items-start justify-center w-full gap-5 flex-col p-6 bg-white rounded-lg border-[1px] border-gray-300'>
        <p className='text-2xl font-bold text-black'>Filters & Search</p>
        <div className='grid grid-cols-3 w-full gap-5'>
            <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Sites..."
                className=" py-5 focus:outline-none focus:ring-0 w-full"
            />

            <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value)}
            >
                <SelectTrigger
                    className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
                    <SelectValue
                        placeholder="Select intervention priority"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem key={'all'} value="all">All Statuses</SelectItem>
                    {siteStatuses.map((status) => (
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
                value={sortType}
                onValueChange={(value) => setSortType(value)}
            >
                <SelectTrigger
                    className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
                    <SelectValue
                        placeholder="Select sorting criteria"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem key={'newest'} value="newest">Newest</SelectItem>
                    <SelectItem value='oldest'>Oldest</SelectItem>
                    <SelectItem value="IA">Interventions  - Ascending</SelectItem>
                    <SelectItem value="ID">Interventions  - Descending</SelectItem>
                </SelectContent>
            </Select>

        </div>
      </div>
  )
}

const SiteCard = ({data , role , onView , onEdit}) => {
  const [actionsDropDown , setActionsDropDown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActionsDropDown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const siteStatusStyle = {
    'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
    'INACTIVE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'MAINTENANCE': 'bg-orange-100 text-orange-800 border-orange-200',
    'EMERGENCY': 'bg-red-100 text-red-800 border-red-200',
  }

  return (
      <div className='p-6 bg-white rounded-lg bg-white border-[1px] border-gray-300 relative'>

        <div className='flex flex items-center justify-start '>
          <div className='flex flex-col items-start justify-start gap-2'>
            <div className='flex items-center justify-start gap-2'>
              <p className='p-3 h-12 w-12 flex items-center justify-center text-lg text-white rounded-full bg-main-green font-bold'>{getInitials(data.siteName).slice(2)}</p>
              <div>
                <p className='font-bold text-lg '>{data.siteName}</p>
                <p className='font-regular text-sm text-gray-500'>{data.siteCode}</p>
              </div>
            </div>
            <div className='flex items-center justify-start gap-2 mt-1'>
              {data.siteStatus === 'ACTIVE' && (
                  <>
                    <CircleCheckBig className='text-main-green w-5 h-5'/>
                    <p className={`border-[1px] px-2 py-1 rounded-full text-xs font-semibold ${siteStatusStyle[data.siteStatus]}`}>Active</p>
                  </>
              )}
              {data.siteStatus === 'INACTIVE' && (
                  <>
                    <Ban className='text-red-500 w-5 h-5'/>
                    <p className={`border-[1px] px-2 py-1 rounded-full text-xs font-semibold ${siteStatusStyle[data.siteStatus]}`}>Inactive</p>
                  </>
              )}
              {data.siteStatus === 'MAINTENANCE' && (
                  <>
                    <Construction className='text-orange-500 w-5 h-5'/>
                    <p className={`border-[1px] px-2 py-1 rounded-full text-xs ${siteStatusStyle[data.siteStatus]}`}>Maintenance</p>
                  </>
              )}
              {data.siteStatus === 'EMERGENCY' && (
                  <>
                    <Siren className='text-red-500 w-5 h-5'/>
                    <p className={`border-[1px] px-2 py-1 rounded-full text-xs ${siteStatusStyle[data.siteStatus]}`}>Emergency</p>
                  </>
              )}
              <p className='border-[1px] rounded-full px-2 py-1 text-black font-semibold bg-white text-xs'>{data.siteLocation}</p>
            </div>
          </div>
          <div >
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionsDropDown(!actionsDropDown);
                }}
                className="cursor-pointer"
            >
                <MoreHorizontal className='text-black absolute top-5 right-5'/>
            </button>

            {actionsDropDown && (
                <div
                    ref={dropdownRef}
                    className="absolute p-1 z-50 -right-15 shadow-xl top-10 min-w-50 bg-white border border-gray-300 rounded-lg flex flex-col items-start dropdown-animate-down"
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
                  {role === "SUPERUSER" && (
                      <button
                          onClick={() => {
                            setActionsDropDown(false);
                            onEdit();
                          }}
                          className="flex items-center gap-5 p-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                        <SquarePen className="w-5 h-5 text-black"/>
                        <p className="font-medium text-sm">Edit Site</p>
                      </button>
                  )}
                </div>
            )}
          </div>
        </div>

        <div className='flex flex-col justify-start items-start gap-3 mt-5'>
          <div className='flex gap-3 items-start justify-start'>
            <MapPin className='w-5 h-5 text-gray-400 '/>
            <p className='font-regular text-black text-sm'>{data.siteAdresse}</p>
          </div>
          <div className='flex gap-3 items-start justify-start'>
            <Phone className='w-5 h-5 text-gray-400'/>
            <p className='font-regular text-black text-sm'>{data.phoneNumber}</p>
          </div>
          <div className='flex gap-3 items-start justify-start'>
            <Mail className='w-5 h-5 text-gray-400'/>
            <p className='font-regular text-black text-sm'>{data.email}</p>
          </div>
        </div>

        <hr className='border-t-[1px] border-gray-300 w-full mt-5 mb-5'/>

        <div className='flex items-center justify-between '>
          <p className='text-gray-500 text-sm'>Interventions </p>
          <p className='text-black text-sm font-semibold'>{data.interventionsMade.length}</p>
        </div>
        <div className='flex items-center justify-between mt-1'>
          <p className='text-gray-500 text-sm'>Operating Hours</p>
          <p className='text-black text-sm font-semibold'>{data.startOperatingHour.split(":").slice(0 , 2).join(":")} - {data.endOperatingHour.split(":").slice(0 , 2).join(":")}</p>
        </div>

      </div>
  )
}


function Sites() {

  const [sites, setSites] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortType, setSortType] = useState("newest")
    const [modalState, setModalState] = useState({
        isOpen: false,
        viewOnly: false,
        siteId: null,
        isEdit: false
    })
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleOpenModal = (siteId = null, viewOnly = false, isEdit = false) => {
        setModalState({
            isOpen: true,
            viewOnly,
            siteId,
            isEdit
        });
    };

    const handleCloseModal = () => {
        setModalState(prev => ({...prev, isOpen: false}));
    };


  const [statuses, setStatuses] = useState([]);
  const {user } = useAuth();
  const role = user?.roles?.split("_")[1];

  const filteredSites = sites.filter((site) => {
    const matchesSearch = site.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.siteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.siteAdresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.siteLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || selectedStatus === site.siteStatus;
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortType) {
      case 'newest' :
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest' :
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'IA' :
        return a.interventionsMade.length - b.interventionsMade.length
      case 'ID' :
        return b.interventionsMade.length - a.interventionsMade.length
    }
  })

  const fetchSites = async () => {
    setLoading(true);
    getSites().then((res) => {
      setStatuses(Array.from(new Set(res.data.map((map) => map.siteStatus))))
      setSites(res.data);
    }).catch((err) => setError(err)).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSites();
  }, []);

    return (
        <div className='flex flex-col items-start justify-start gap-5'>
            {loading ? (
                <div className='flex items-center justify-center w-full py-30'>
                    <span className="loading loading-spinner custom-spinner loading-2xl text-main-green"></span>
                </div>
            ) : error != null ? (
                <div className='flex items-center flex-col justify-center w-full py-30'>
                    <ServerCrash className="w-16 h-16 text-red-600 mb-4" />
                    <h2 className="text-2xl font-bold text-red-700 mb-2">Server Error</h2>
                    <p className="text-red-600 text-center">
                        Oops! Something went wrong on our side. Please try refreshing the page or come back later.
                    </p>
                </div>
            ) :  (
                <>
                    {(role === "SUPERUSER") && (
                        <button
                            onClick={() => handleOpenModal(null, false, false)}
                            className='flex items-center gap-5 self-end justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer bg-main-green/90 hover:bg-main-green'>
                            <Plus className='text-white'/>
                            <p className='text-md text-white font-medium'>Create Site</p>
                        </button>
                    )}
                    <SiteOverview sites={sites}/>
                    <SearchBarFilter
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                        sortType={sortType}
                        setSortType={setSortType}
                    />
                    {filteredSites.length === 0 ? (
                        <div className='flex flex-col items-center justify-center w-full py-30'>
                            <MapPinOff className="w-16 h-16 text-red-600 mb-4"/>
                            <h2 className="text-2xl font-bold text-red-700 mb-2">No Sites</h2>
                            <p className="text-red-600 text-center">
                                Create a Site to get started or try adjusting your filters.
                            </p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-3 gap-5 w-full'>
                            {filteredSites.map((site) => (
                                <SiteCard
                                    key={site.id}
                                    data={site}
                                    role={role}
                                    onView={() => handleOpenModal(site.id, true, false)}
                                    onEdit={() => handleOpenModal(site.id, false, true)}
                                />
                            ))}
                        </div>
                    )}

                </>
            )}
            <NewSite
                role={role}
                viewOnly={modalState.viewOnly}
                isEdit={modalState.isEdit}
                siteId={modalState.siteId}
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}

export default Sites
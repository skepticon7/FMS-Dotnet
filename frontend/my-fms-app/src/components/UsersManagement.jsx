import React, {useEffect, useRef, useState} from 'react'
import {useAuth} from "../context/AuthContext.jsx";
import {
  getAllTechniciansAndSupervisors,
  getSuperuserLatestInterventions,
  getTechniciansSupervisors,
  getUsers,
  getUsersStats
} from "../services/api.js";
import axios from "axios";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  FunnelPlus,
  ShieldCheck,
  Play,
  Users,
  Plus,
  User,
  Search,
  LockOpen,
  ServerCrash,
  UserPlus,
  Shield,
  X, ChevronLeft, ChevronRight, Wrench, UserRoundX, Clock, CalendarOff, Mail, Phone, MoreHorizontal, Eye, SquarePen
} from "lucide-react";
import OverviewCard from "../shared/OverviewCard.jsx";
import {getInitials} from "../Utils/getInitials.js";
import {formatLabel} from "../Utils/formatLabel.js";
import UserViewUpdate from "./UserViewUpdate.jsx";
import {NewUser, UsersManagementFilter} from "./index.js";
import {Input} from "@/components/ui/input.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";

const RoleCard = ({role , Icon , description , users , permissions , background , iconColor , borderColor}) => {
  return (
      <div className={`border-[1px] ${borderColor} ${background} p-5 flex flex-col justify-start items-start w-full gap-5 rounded-md`}>
        <div className='flex flex-col items-start justify-start gap-2'>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center justify-start gap-2'>
              <Icon className={`${iconColor} w-5 h-5`}/>
              <p className='text-black font-semibold text-lg'>{role}</p>
            </div>
            {/*here will be the number of jsers*/}
          </div>
          <p className='text-gray-500 text-sm'>{description}</p>
        </div>

        <div className='flex flex-col gap-2 justify-start items-start'>
          <p className='font-medium text-sm'>Permissions :</p>
          <div className='flex flex-row flex-wrap gap-2 w-full'>
            {permissions.map((permission , index) => (
                <p
                    className='bg-green-950 rounded-full px-2 py-0.5 text-xs text-white font-semibold'
                    key={index}
                >
                  {permission}
                </p>
            ))}
          </div>
        </div>

      </div>
  )
}


const RolesAndPermissions = () => {

  const roles = {
    "SUPER USER" : {
      title : "Super User",
      description : 'Full system access. Can manage users, sites, interventions, intervention types, reports, and all system operations' ,
      Icon : ShieldCheck,
      permissions : ['All Permissions'],
      background : 'bg-red-100',
      iconColor : 'text-red-500',
      borderColor : 'border-red-200'
    },
    "TECHNICIAN" : {
      title : "Technician",
      description : 'Manages their own interventions and can view sites and schedules. Limited access to system-wide management features',
      Icon : User,
      permissions : ['Interventions' , 'Schedule' , 'Sites'],
      background : 'bg-green-100',
      iconColor: 'text-green-500',
      borderColor : 'border-green-200'
    },
    "SUPERVISOR" : {
      title : "Supervisor",
      description : 'Manages teams and oversees operations, interventions, and schedules. Cannot create sites, intervention types, or manage technicians',
      Icon : Users,
      permissions : ['Team Management' , 'Interventions' , 'Schedule' , 'Sites'],
      background : 'bg-blue-100',
      iconColor : 'text-blue-500',
      borderColor : 'border-blue-200'
    }
  }

  return (
      <div className='bg-white border-[1px] border-gray-300 rounded-lg p-5 w-full flex flex-col gap-5 items-start justify-start'>
        <div className='flex flex-col items-start justify-start gap-1'>
          <p className='text-2xl font-bold text-black'>Roles & Permissions</p>
          <p className='text-sm font-medium text-gray-500'>Manage user roles and their associated permissions</p>
        </div>
        <div className='grid grid-cols-3 gap-5 w-full'>
          {Object.keys(roles).map((key) => (
              <RoleCard
                role={roles[key].title}
                Icon={roles[key].Icon}
                description={roles[key].description}
                iconColor={roles[key].iconColor}
                borderColor={roles[key].borderColor}
                background={roles[key].background}
                permissions={roles[key].permissions}
              />
          ))}
        </div>
      </div>
  )
}

const ViewBar = ({viewModeState , setViewModeState}) => {
  return (
      <div className='grid grid-cols-2 w-full gap-2 bg-gray-200/50 p-1 rounded-lg'>
        <button
            onClick={() => setViewModeState('users')}
            className={`text-sm font-medium rounded-md py-1.5 ${viewModeState === 'users' ? 'bg-white text-black' : 'text-gray-500' } duration-200 transition-colors ease-in-out cursor-pointer`}
        >
          Users
        </button>
        <button
            onClick={() => setViewModeState('rolesAndPermissions')}
            className={`text-sm font-medium rounded-md py-1.5 ${viewModeState === 'rolesAndPermissions' ? 'bg-white text-black ' : 'text-gray-500' } duration-200 transition-colors ease-in-out cursor-pointer`}
        >
          Roles & Permissions
        </button>
      </div>
  )
}

const UsersOverview = ({stats}) => {
  return (
      <div className='grid grid-cols-4 gap-5 w-full'>
        <OverviewCard title={'Total Users'} Icon={Users} description={stats?.total} button={'text-blue-500'}
                      background={'bg-blue-100'}/>
        <OverviewCard title={'Active Users'} Icon={LockOpen} description={stats?.active} button={'text-green-500'}
                      background={'bg-green-100'}/>
        <OverviewCard title={'Technicians'} Icon={User} description={stats?.technicians} button={'text-green-500'}
                      background={'bg-green-100'}/>
        <OverviewCard title={'Admins'} Icon={Shield} description={stats?.admins} button={'text-red-500'}
                      background={'bg-red-100'}/>
      </div>
  )
}

const SearchBarFilter = ({filters, setFilters, resetAllFilters , role}) => {
  const {usersFiltersApplied, setUsersFiltersApplied} = useAuth();
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);

  function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
  }

  const [localCode, setLocalCode] = useState(filters.name || "");
  const debouncedCode = useDebounce(localCode, 500);

  useEffect(() => {
    setFilters({...filters, name: debouncedCode});
  }, [debouncedCode]);

  const technicianStatus = [
    {value : "AVAILABLE" , label : "Available"},
    {value : "BUSY" , label: "Busy"},
    {value : "ON_LEAVE" , label : "On Leave"},
  ];

  const roles = (role === "SUPERVISOR" || role === "SUPERUSER") ? ["Technician" , "Supervisor"] : ["Technician"];


  useEffect(()=> {
    console.log(filters);
  } , [filters])


  return (
      <div className='flex items-start justify-center w-full gap-6 flex-col p-6 bg-white rounded-lg border-[1px] border-gray-300'>
        <div className='flex items-center justify-between w-full'>
          <p className='text-2xl font-bold text-black'>Filters & Search</p>
          {usersFiltersApplied ? (
              <button
                  onClick={() => {
                    resetAllFilters();
                    setUsersFiltersApplied(false)
                  }}
                  className='flex gap-3 items-center justify-center cursor-pointer bg-red-500/90 transition-colors duration-200 rounded-md p-2  hover:bg-red-500'>
                <X className='w-5 h-5 text-white'/>
                <p className='text-sm font-medium text-white'>Remove Filters </p>
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
        <div className='grid grid-cols-3 w-full gap-5'>
            <Input
                value={localCode}
                disabled={usersFiltersApplied}
                onChange={(e) => setLocalCode(e.target.value)}
                placeholder="Search By Name..."
                className={`py-5 focus:outline-none focus:ring-0 w-full ${usersFiltersApplied ? 'bg-gray-100 text-gray-400' : ''}`}
            />

          <Select
              disabled={usersFiltersApplied}
              value={filters.statuses[0] || ''}
              onValueChange={(value) => setFilters({
                ...filters,
                statuses : value === 'all' ? [] : [value]
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
              disabled={usersFiltersApplied}
              value={filters.roles[0] || ''}
              onValueChange={(value) => setFilters({
                ...filters,
                roles : value === 'all' ? [] : [value]
              })}
          >
            <SelectTrigger
                className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
              <SelectValue
                  placeholder="Select role"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={'all'} value="all">All Roles</SelectItem>
              {roles.map((r) => (
                  <SelectItem
                      key={r}
                      value={r}
                  >
                    <div>{r}</div>
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>


        </div>
        <UsersManagementFilter
          onClose={() => setAdvancedModalOpen(false)}
          isOpen={advancedModalOpen}
          setAllFilters={setFilters}
        />
      </div>
  )

}


const UserRow = ({user , index , onEdit , onView , usersSize , role}) => {
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


  const userStatusStyles = {

    'AVAILABLE': {
      style : 'bg-green-100 text-green-800 border-green-200',
      iconStyle : 'text-green-500',
      Icon : CheckCircle
    },
    'BUSY': {
      style : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      iconStyle : 'text-yellow-500',
      Icon : Clock
    },
    'ON_LEAVE': {
      style : 'bg-red-100 text-red-800 border-red-200',
      iconStyle : 'text-red-500',
      Icon : CalendarOff
    },
  }

  const roleStyles = {
    'SUPERUSER' : {
        style : 'bg-red-100 text-red-800 border-red-200',
        iconStyle : 'text-red-500',
      Icon : Shield
    } ,
    'SUPERVISOR' : {
      style : 'bg-blue-100 text-blue-800 border-blue-200',
      iconStyle : 'text-red-500',
      Icon : Users
    },
    'TECHNICIAN' : {
      style : 'bg-green-100 text-green-800 border-green-200',
      iconStyle : 'text-green-500',
      Icon : User
    }
  }

  return (
      <tr
          key={user.id}
          className={`text-left ${index === usersSize - 1 ? 'border-none' : 'border-b border-gray-300'}`}
      >
        <td className='py-4'>
          <div className='flex items-center justify-start gap-2'>
            <p className='h-11 w-11 flex items-center justify-center text-md text-white rounded-full bg-main-green font-semibold'>{getInitials(user.firstName.concat(" ").concat(user.lastName))}</p>
            <div className='flex flex-col items-start justify-start gap-0.5'>
              <p className='text-md font-semibold'>{user.firstName} {user.lastName}</p>
              <div className='flex items-center justify-center gap-4'>
                <div className='flex items-center justify-center gap-1'>
                  <Mail className='text-gray-500 w-4 h-4'/>
                  <p className='text-sm font-regular text-gray-500'>{user.email}</p>
                </div>
                <div className='flex items-center justify-center gap-1'>
                  <Phone className='text-gray-500 w-4 h-4'/>
                  <p className='text-sm font-regular text-gray-500'>{user.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </td>

        <td className='py-4'>
          <div className='flex items-center justify-start gap-2'>
            {user.role === 'SUPERVISOR' && <Users className='w-4.5 h-4.5 text-blue-500'/>}
            {user.role === 'TECHNICIAN' && <User className='w-4.5 h-4.5 text-green-500'/>}
            <p className={`text-sm rounded-full border-[1px] font-semibold px-2  ${roleStyles[user.role].style}`}>{formatLabel(user.role)}</p>
          </div>
        </td>

        <td className='py-4'>
          <div className='flex items-center justify-start gap-2'>
            {user.technicianStatus === 'AVAILABLE' && <CheckCircle className='w-4.5 h-4.5 text-green-500'/>}
            {user.technicianStatus === 'BUSY' && <Clock className='w-4.5 h-4.5 text-yellow-500'/>}
            {user.technicianStatus === 'ON_LEAVE' && <CalendarOff className='w-4.5 h-4.5 text-red-500'/>}
            <p className={`text-sm px-2 font-semibold border-[1px] rounded-full ${userStatusStyles[user.technicianStatus].style}`}>{formatLabel(user.technicianStatus)}</p>
          </div>
        </td>

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
                {(role === "SUPERUSER") &&
                  <button
                      onClick={() => {
                        onEdit()
                        setActionsDropDown(false)
                      }}
                      className="flex items-center gap-5 p-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                    <SquarePen className="w-5 h-5 text-black"/>
                    <p className="font-medium text-sm">Edit user</p>
                  </button>
                }
                {(role === "SUPERVISOR" && user.role === "TECHNICIAN") &&
                    <button
                        onClick={() => {
                          onEdit()
                          setActionsDropDown(false)
                        }}
                        className="flex items-center gap-5 p-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                      <SquarePen className="w-5 h-5 text-black"/>
                      <p className="font-medium text-sm">Edit Intervention</p>
                    </button>
                }

              </div>
          )}
        </td>


      </tr>
  )
}

const UsersManagement = () => {

  const {user} = useAuth();
  const role = user?.roles?.split("_")[1];
  const [viewMode, setViewMode] = useState('users');
  const [newUserModal , setNewUserModal] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [cachedUsers, setCachedUsers] = useState({
    data: {},
    timestamps: {},
    maxAge: 3 * 60 * 1000 // 3 minutes
  });
  const [modalState, setModalState] = useState({
    userRole : null,
    userId: null,
    viewOnly: false,
    isEdit: false,
    isOpen: false
  });
  const [allFilters, setAllFilters] = useState({
    name: '',
    statuses: [],
    roles : []
  });

  const handleOpenModal = (userId = null, userRole = null ,  viewOnly = false, isEdit = false) => {
    setModalState({
      userId,
      userRole,
      viewOnly,
      isEdit,
      isOpen: true
    });
  }

  const handleCloseModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }))
  }


  const getCacheKey = (page, filters) => {
    return `page_${page}_${JSON.stringify(filters)}`;
  }

  const fetchUsers = async (page = selectedPage, filters = allFilters) => {
    try {
      const cacheKey = getCacheKey(page, filters);
      const cachedData = cachedUsers.data[cacheKey];
      const cachedTimestamps = cachedUsers.timestamps[cacheKey];
      const now = Date.now();

      if (cachedData && cachedTimestamps && (now - cachedTimestamps < cachedUsers.maxAge)) {
          setUsers(cachedData);
          const statsResponse = await getUsersStats();
          console.log(statsResponse.data);
          setStats(statsResponse.data);
          return;
        }

        setLoading(true);

        const params = {
          ...allFilters,
          page,
          size : 5
        }
        const [statsResponse , usersResponse] = await axios.all([
            getUsersStats() ,getAllTechniciansAndSupervisors(params)
        ]);

        setCachedUsers(prev => ({
          ...prev,
          data: {
            ...prev.data,
            [cacheKey] : usersResponse.data.content
          },
          timestamps: {
            ...prev.timestamps,
            [cacheKey] : now
          }
        }));
        console.log(statsResponse.data);

        setUsers(usersResponse.data.content);
        setStats(statsResponse.data);

      }catch (e) {
        console.log(e);
        setError(e.response?.data?.message || "Internal Server Error");
      }finally {
        setLoading(false);
      }
  }

  const handleFilteringSuccess = (fitlers) => {
    fetchUsers(filters);
  }

  const handleResetFilters = () => {
    setAllFilters({
      name : '',
      statuses : [],
      roles : []
    })
  }

  useEffect(() => {
    if(!role || !user || viewMode === 'rolesAndPermissions') return;
    fetchUsers(selectedPage);
  }, [selectedPage , allFilters , role  , user , viewMode]);



  return (
      <>
        <div  className='flex flex-col items-start justify-start w-full gap-6'>
          {viewMode === 'users' && (
              <>
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
                      <button
                          onClick={() => setNewUserModal(true)}
                          className='flex items-center gap-5 self-end justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer bg-main-green/90 hover:bg-main-green'>
                        <UserPlus className='text-white w-5 h-5'/>
                        <p className='text-md text-white font-medium'>Create User</p>
                      </button>
                      <ViewBar
                          viewModeState={viewMode}
                          setViewModeState={setViewMode}
                      />
                      <UsersOverview
                          stats={stats}
                      />
                      <SearchBarFilter
                          filters={allFilters}
                          setFilters={setAllFilters}
                          resetAllFilters={handleResetFilters}
                          onAdvancedFiltersApply={handleFilteringSuccess}
                          role={role}
                      />
                      <div className='border border-[1px] bg-white border-gray-300 rounded-lg flex flex-col gap-5 w-full p-5'>
                        <div className='flex items-center justify-between w-full'>
                          <p className='font-bold text-2xl'>Users</p>
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
                        </div>
                        {users.length === 0 ? (
                            <div className='flex flex-col items-center justify-center w-full py-30'>
                              <UserRoundX className="w-16 h-16 text-red-600 mb-4"/>
                              <h2 className="text-2xl font-bold text-red-700 mb-2">No Users</h2>
                              <p className="text-red-600 text-center">
                                Create a user to get started or try adjusting your filters.
                              </p>
                            </div>
                        ) : (
                            <table className='border-collapse w-full'>
                              <thead>
                              <tr className='border-b-[1px] border-gray-300 text-left'>
                                <th className='font-bold text-sm py-3 px-2'>User</th>
                                <th className='font-bold text-sm'>Role</th>
                                <th className='font-bold text-sm'>Status</th>
                                <th className='font-bold text-sm'>Actions</th>
                              </tr>
                              </thead>
                              <tbody>
                              {
                                users.map((user, index) => (
                                    <UserRow
                                        role={role}
                                        user={user}
                                        index={index}
                                        usersSize={users.length}
                                        onView={() => handleOpenModal(user.id, user.role  ,true, false)}
                                        onEdit={() => handleOpenModal(user.id, user.role ,false, true)}
                                    />
                                ))
                              }
                              </tbody>
                            </table>
                        )}
                      </div>
                    </>
                )}
              </>
          )}
          {viewMode === 'rolesAndPermissions' && (
              <>
                <button
                    onClick={() => setNewUserModal(true)}
                    className='flex items-center gap-5 self-end justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer bg-main-green/90 hover:bg-main-green'>
                  <UserPlus className='text-white w-5 h-5'/>
                  <p className='text-md text-white font-medium'>Create User</p>
                </button>
                <ViewBar
                    viewModeState={viewMode}
                    setViewModeState={setViewMode}
                />
                <RolesAndPermissions/>
              </>
          )}
        </div>
        <NewUser role={role}
          isOpen={newUserModal}
          onClose={() => setNewUserModal(false)}
        />
        <UserViewUpdate
          technicianId={modalState.userId}
          userRole={modalState.userRole}
          viewOnly={modalState.viewOnly}
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          isEdit={modalState.isEdit}
        />

      </>
  )
}

export default UsersManagement
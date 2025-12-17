import React, {useEffect, useMemo, useRef, useState} from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  SquarePen,
  Phone,
  Mail,
  Briefcase,
  ServerCrash,
  UserX,
  Play,
  CircleCheck,
  ChevronLeft , ChevronRight,
  Droplets,
  Calendar,
  FunnelPlus,
  TrendingUp,
    Droplet,
  User2, MoreVertical,X
} from "lucide-react";
import {formatLabel} from "../Utils/formatLabel.js";
import {useAuth} from "../context/AuthContext.jsx";
import {
  getInterventionTypes,
  getPatients,
  getDoctors,
  getTechniciansSupervisors,
  getPatientStats
} from "../services/api.js";
import OverviewCard from "../shared/OverviewCard.jsx";
import {getInitials} from "../Utils/getInitials.js";
import axios from "axios";
import UserViewUpdate from "./UserViewUpdate.jsx";
import {Input} from "@/components/ui/input.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
import AdvancedFilters from "@/components/AdvancedFilters.jsx";
import {AdvancedPatientsFilters} from "@/components/index.js";


const SearchBarFilter = ({filterOptions , setFilterOptions , advancedFilterOptions , setAdvancedFilterOptions, resetAllFilters}) => {

  const {name  , bloodType , gender , sorting} = filterOptions;
  const {filtersApplied , setFiltersApplied} = useAuth();
  const [advancedModalOpen , setAdvancedModalOpen] = useState(false);


  const bloodTypesArr = [
    { value: "O_POSITIVE", label: "O+" },
    { value: "O_NEGATIVE", label: "O-" },

    { value: "A_POSITIVE", label: "A+" },
    { value: "A_NEGATIVE", label: "A-" },

    { value: "B_POSITIVE", label: "B+" },
    { value: "B_NEGATIVE", label: "B-" },

    { value: "AB_POSITIVE", label: "AB+" },
    { value: "AB_NEGATIVE", label: "AB-" },
  ];

  // function useDebounce(value, delay) {
  //   const [debounced, setDebounced] = useState(value);
  //   useEffect(() => {
  //     const handler = setTimeout(() => setDebounced(value), delay);
  //     return () => clearTimeout(handler);
  //   }, [value, delay]);
  //   return debounced;
  // }
  //
  // const [localCode, setLocalCode] = useState(activeFilters.code || "");
  // const debouncedCode = useDebounce(localCode, 500);

  // useEffect(() => {
  //   setActiveFilters({...activeFilters, code: debouncedCode});
  // }, [debouncedCode]);

  return(
      <div className='flex items-start justify-center w-full gap-5 flex-col p-6 bg-white rounded-lg border-[1px] border-gray-300'>
        <div className='flex items-center justify-between w-full'>
          <p className='text-2xl font-bold text-black'>Filters & Search</p>
          <div className='flex gap-2 items-center justify-center'>
            {filtersApplied ? (
                <button
                    onClick={() => {
                      resetAllFilters();
                      setFiltersApplied(false)
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
            <div className="flex items-center gap-2">
              <button
                  onClick={() => setAdvancedFilterOptions((prev) => ({...prev , page : prev.page - 1}))}
                  disabled={advancedFilterOptions.page === 1}
                  className="h-10 flex items-center justify-center border border-gray-300 px-3 cursor-pointer transition-colors duration-200 bg-transparent hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-5 h-5 text-black"/>
              </button>

              <button

                  className="h-10 flex items-center justify-center border border-gray-300 px-3 cursor-pointer transition-colors duration-200 bg-transparent hover:bg-gray-100 rounded-md"
              >
                <p className='font-semibold'>Page {advancedFilterOptions.page}</p>
              </button>
              <button
                  onClick={() => setAdvancedFilterOptions((prev) => ({...prev , page : prev.page + 1}))}
                  className="h-10 flex items-center justify-center border border-gray-300 px-3 cursor-pointer transition-colors duration-200 bg-transparent hover:bg-gray-100 rounded-md"
              >
                <ChevronRight className="w-5 h-5 text-black"/>
              </button>
            </div>
          </div>

        </div>
        <div className='grid grid-cols-4 w-full gap-5'>
          <Input
              value={name}
              onChange={(e) => setFilterOptions({...filterOptions, name: e.target.value})}
              placeholder="Search Patients..."
              className="py-5 focus:outline-none focus:ring-0 w-full"
          />

          <Select
              value={bloodType}
              onValueChange={(value) => setFilterOptions({
                ...filterOptions,
                bloodType: value === 'all' ? '' : value
              })}
          >
            <SelectTrigger
                className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
              <SelectValue
                  placeholder="Select blood type"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'all'}>All types</SelectItem>
              {bloodTypesArr.map((type) => (
                  <SelectItem
                      key={type.value}
                      value={type.value}
                  >
                    <div>{type.label}</div>
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>


          <Select
              value={gender}
              onValueChange={(value) => setFilterOptions({
                ...filterOptions,
                gender: value === 'all' ? '' : value
              })}
          >
            <SelectTrigger
                className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
              <SelectValue
                  placeholder="Select Gender"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Genders</SelectItem>
              <SelectItem value='Male'>Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>

          <Select
              value={sorting}
              onValueChange={(value) => setFilterOptions({
                ...filterOptions,
                sorting : value
              })}
          >
            <SelectTrigger
                className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
              <SelectValue
                  placeholder="Select sorting criteria"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={'newest'} value="newest">Newest</SelectItem>
              <SelectItem value='oldest'>Oldest</SelectItem>
              <SelectItem value="FA">Files- Ascending</SelectItem>
              <SelectItem value="FD">Files - Descending</SelectItem>
              <SelectItem value="AA">Age - Ascending</SelectItem>
              <SelectItem value="AD">Age - Descending</SelectItem>
            </SelectContent>
          </Select>
          <AdvancedPatientsFilters
              onClose={() => setAdvancedModalOpen(false)}
              isOpen={advancedModalOpen}
              setAdvancedFilterOptions={setAdvancedFilterOptions}
          />
        </div>
      </div>
  )
}

const PatientsOverview = ({patientsStats}) => {

  const bloodTypes = {
    'A_POSITIVE' : 'A+' ,
    'A_NEGATIVE' : 'A-' ,
    'B_POSITIVE' : 'B+' ,
    'B_NEGATIVE' : 'B-' ,
    'AB_POSITIVE' : 'AB+' ,
    'AB_NEGATIVE' : 'AB-' ,
    'O_POSITIVE' : 'O+',
    'O_NEGATIVE' : 'O-'
  }

  return (
      <div className='grid grid-cols-4 gap-5 w-full'>
        <OverviewCard title='Blood Type' subtitle={`${bloodTypes[patientsStats.mostCommonBloodType.toUpperCase()]} ${patientsStats.mostCommonBTPourcentage}%`}  Icon={Droplets} description={'Most Common'} color={'red'}/>
        <OverviewCard title='Average Age' Icon={Calendar} subtitle={patientsStats.averageAge} description={'years old'}  color={'blue'}/>
        <OverviewCard title='Gender Ratio' Icon={Users} subtitle={`${patientsStats.genderRatioMale}% / ${patientsStats.genderRatioFemale}%`} description={'Male • Female'} color={'purple'} />
        <OverviewCard title='New Patients' Icon={TrendingUp} description={'this month'} subtitle={`+ ${patientsStats.patientsThisMonth}`} color={'emerald'}/>
      </div>
  )
}

const PatientCard = ({patient  ,role , onView , onEdit}) => {


  const BloodTypes = {
    'A_POSITIVE' : 'A+' ,
    'A_NEGATIVE' : 'A-' ,
    'B_POSITIVE' : 'B+' ,
    'B_NEGATIVE' : 'B-' ,
    'AB_POSITIVE' : 'AB+' ,
    'AB_NEGATIVE' : 'AB-' ,
    'O_POSITIVE' : 'O+',
    'O_NEGATIVE' : 'O-'
  }
  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(patient.birthDate)

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
      <Card className="w-full ">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 bg-emerald-500 text-white">
              <AvatarFallback className="bg-emerald-500 text-white font-semibold">{getInitials(patient.firstName.concat(" ").concat(patient.lastName))}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {patient.firstName} {patient.lastName}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {patient.gender}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {age} years old
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"  className="h-8 w-8 cursor-pointer">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <button
                    onClick={() => onView()}
                    className=" flex items-center gap-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                  <Eye className="w-5 h-5 text-black"/>
                  <p className="font-regular text-sm">View Details</p>
                </button>
              </DropdownMenuItem>
              {role === 'Manager' && (
                  <DropdownMenuItem>
                    <button
                      onClick={() => onView()}
                      className=" flex items-center gap-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                    <SquarePen className="w-5 h-5 text-black"/>
                    <p className="font-regular text-sm">Edit Patient</p>
                  </button>
                  </DropdownMenuItem>

              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4"/>
              <span>{patient.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{patient.email}</span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Droplet className="h-3.5 w-3.5" />
                  <span>Blood Type</span>
                </div>
                <p className="text-sm font-medium text-foreground">{BloodTypes[patient.bloodType.toUpperCase()]}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Birth Date</span>
                </div>
                <p className="text-sm font-medium text-foreground">{formatDate(patient.birthDate)}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User2 className="h-3.5 w-3.5" />
                <span>Patient Since</span>
              </div>
              <p className="text-sm font-medium text-foreground">{formatDate(patient.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
  )
}


const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [patientsStats , setPatientsStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    gender : "",
    bloodType : "",
    sorting : "newest",
    name : ""
  });

  const [advancedFilterOptions, setAdvancedFilterOptions] = useState({
    page : 1,
    genders : [],
    bloodTypes : [],
    sorting : "newest",
    name : ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {user} = useAuth();
  const role = user?.role;


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


  const filteredPatients = useMemo(() => {
    return patients
        .filter((patient) => {
          const matchesName =
              patient.firstName.toLowerCase().includes(filterOptions.name.toLowerCase()) ||
              patient.lastName.toLowerCase().includes(filterOptions.name.toLowerCase()) ||
              patient.email.toLowerCase().includes(filterOptions.name.toLowerCase()) ||
              patient.phoneNumber.toLowerCase().includes(filterOptions.name.toLowerCase());



          const matchesGender =
              filterOptions.gender === '' || patient.gender === filterOptions.gender;

          const matchesBloodType = filterOptions.bloodType === '' || patient.bloodType.toUpperCase() === filterOptions.bloodType.toUpperCase();

          return matchesGender && matchesName && matchesBloodType;
        })
        .sort((a, b) => {
          switch (filterOptions.sorting) {
            case "newest":
              return new Date(b.createdAt) - new Date(a.createdAt);
            case "oldest":
              return new Date(a.createdAt) - new Date(b.createdAt);
            case "AA":
              return new Date(b.birthDate) - new Date(a.birthDate);
            case "AD":
              return new Date(a.birthDate) - new Date(b.birthDate);
            default:
              return 0;
          }
        });
  }, [patients, filterOptions]);

  const fetchPatients = async () => {
    try{
      setLoading(true);

      const [patientsResponse , patientStatsResponse] = await axios.all([
        getPatients(advancedFilterOptions) , getPatientStats()
      ]);
      setPatientsStats(patientStatsResponse.data);
      setPatients(patientsResponse.data.items);
    }catch (e) {
      console.error("Error fetching patients:", e);
      setError(`Error fetching patients: ${e}`);
    }finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if(!user) return;
    fetchPatients();
  }, [user , advancedFilterOptions]);


  const handleResetAllFilters = () => {
    setFilterOptions({
      gender: "",
      bloodType: "",
      sorting: "newest",
      name: ""
    });

    setAdvancedFilterOptions({
      page : 1,
      name: '',
      genders: [],
      bloodTypes: [],
      sorting: ''
    });
  }


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
              {(role === "Manager") && (
                  <button
                      onClick={() => handleOpenModal(null, false, false)}
                      className='flex items-center gap-5 self-end justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer bg-main-green/90 hover:bg-main-green'>
                    <Plus className='text-white'/>
                    <p className='text-md text-white font-medium'>Create Patient</p>
                  </button>
              )}
              {patientsStats && <PatientsOverview patientsStats={patientsStats}/>}

              <SearchBarFilter
                  filterOptions={filterOptions}
                  setFilterOptions={setFilterOptions}
                  advancedFilterOptions={advancedFilterOptions}
                  setAdvancedFilterOptions={setAdvancedFilterOptions}
                  resetAllFilters={handleResetAllFilters}
              />

              {filteredPatients.length === 0 ? (
                  <div className='flex flex-col items-center justify-center w-full py-30'>
                    <UserX className="w-16 h-16 text-red-600 mb-4"/>
                    <h2 className="text-2xl font-bold text-red-700 mb-2">No Patients</h2>
                    <p className="text-red-600 text-center">
                      Create a patient to get started or try adjusting your filters.
                    </p>
                  </div>
              ) : (
                  <div className='grid grid-cols-3 gap-5 w-full'>
                    {filteredPatients.map((patient) => (
                        <PatientCard
                            patient={patient}
                            role={role}
                            onView={() => handleOpenModal(patient.id, tech.role, true, false)}
                            onEdit={() => handleOpenModal(patient.id, tech.role, false, true)}
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

export default Patients
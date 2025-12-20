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
  ChevronLeft, ChevronRight,
  Droplets,
  Calendar,
  FunnelPlus,
  TrendingUp,
  Trash,
  Droplet,
    Microscope,
  User2, MoreVertical, X, UserPlus
} from "lucide-react";
import {formatLabel} from "../Utils/formatLabel.js";
import {useAuth} from "../context/AuthContext.jsx";
import {
  getInterventionTypes,
  getPatients,
  getDoctors,
  getTechniciansSupervisors,
  getPatientStats, deletePatient, getDoctorStats, deleteDoctor
} from "../services/api.js";
import OverviewCard from "../shared/OverviewCard.jsx";
import {getInitials} from "../Utils/getInitials.js";
import axios from "axios";
import UserViewUpdate from "./UserViewUpdate.jsx";
import {Input} from "@/components/ui/input.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
import AdvancedFilters from "@/components/AdvancedFilters.jsx";
import {AdvancedPatientsFilters, PatientDoctorViewUpdate} from "@/components/index.js";
import PasswordConfirmationModal from "@/shared/PasswordConfirmationModal.jsx";
import toast from "react-hot-toast";
import AdvancedDoctorsFilters from "@/components/AdvancedDoctorsFilters.jsx";


const SearchBarFilter = ({filterOptions , setFilterOptions , advancedFilterOptions , setAdvancedFilterOptions, resetAllFilters}) => {

  const {name  , speciality , gender , sorting} = filterOptions;
  const {filtersApplied , setFiltersApplied} = useAuth();
  const [advancedModalOpen , setAdvancedModalOpen] = useState(false);


  const specialities = [

    { value: "Cardiology", label: "Cardiology" },
    { value: "Neurology", label: "Neurology" },

    { value: "Gynecology", label: "Gynecology" },
    { value: "Dermatology", label: "Dermatology" },

    { value: "Pediatrics", label: "Pediatrics" },
    { value: "GeneralPractice", label: "General Practice" },

  ];


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
              value={speciality}
              onValueChange={(value) => setFilterOptions({
                ...filterOptions,
                speciality : value === 'all' ? '' : value
              })}
          >
            <SelectTrigger
                className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
              <SelectValue
                  placeholder="Select Speciality"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'all'}>All types</SelectItem>
              {specialities.map((speciality) => (
                  <SelectItem
                      key={speciality.value}
                      value={speciality.value}
                  >
                    <div>{speciality.label}</div>
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
          <AdvancedDoctorsFilters
              onClose={() => setAdvancedModalOpen(false)}
              isOpen={advancedModalOpen}
              setAdvancedFilterOptions={setAdvancedFilterOptions}
          />
        </div>
      </div>
  )
}

const DoctorsOverview = ({doctorsStats}) => {


  const specialities = {
    'Cardiology' : 'Cardiology' ,
    'Neurology' : 'Neurology' ,
    'Gynecology' : 'Gynecology' ,
    'Dermatology' : 'Dermatology' ,
    'Pediatrics' : 'Pediatrics' ,
    'GeneralPractice' : 'General Practice' ,
  }

  return (
      <div className='grid grid-cols-4 gap-5 w-full'>
        <OverviewCard title='Speciality' subtitle={`${specialities[doctorsStats.mostCommonSpeciality]} ${doctorsStats.mostCommonSpecPourcentage}%`}  Icon={Microscope} description={'Most Common'} color={'red'}/>
        <OverviewCard title='Average Age' Icon={Calendar} subtitle={doctorsStats.averageAge} description={'years old'}  color={'blue'}/>
        <OverviewCard title='Gender Ratio' Icon={Users} subtitle={`${doctorsStats.genderRatioMale}% / ${doctorsStats.genderRatioFemale}%`} description={'Male • Female'} color={'purple'} />
        <OverviewCard title='New Doctors' Icon={TrendingUp} description={'this month'} subtitle={`+ ${doctorsStats.doctorsThisMonth}`} color={'emerald'}/>
      </div>
  )
}

const DoctorCard = ({doctor  ,role , onView , onEdit}) => {

  const [showPasswordModal , setShowPasswordModal] = useState(false);

  const specialities = {
    'Cardiology' : 'Cardiology' ,
    'Neurology' : 'Neurology' ,
    'Gynecology' : 'Gynecology' ,
    'Dermatology' : 'Dermatology' ,
    'Pediatrics' : 'Pediatrics' ,
    'GeneralPractice' : 'General Practice' ,
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

  const age = calculateAge(doctor.birthDate)

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDeleteDoctor = async () => {
    try{
      await deleteDoctor(doctor.id);
      toast.success("doctor successfully deleted");
    }catch (e) {
      console.log("error deleting doctor : " + e);
      throw new Error(e);
    }
  }

  return (
      <Card className="w-full ">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 bg-emerald-500 text-white">
              <AvatarFallback className="bg-emerald-500 text-white font-semibold">{getInitials(doctor.firstName.concat(" ").concat(doctor.lastName))}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {doctor.firstName} {doctor.lastName}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {doctor.gender}
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

                    <DropdownMenuItem>
                      <button
                          onClick={() => onEdit()}
                          className=" flex items-center gap-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                        <SquarePen className="w-5 h-5 text-black"/>
                        <p className="font-regular text-sm">Edit Doctor</p>
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <button
                          onClick={() => setShowPasswordModal(true)}
                          className=" flex items-center gap-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                        <Trash className="w-5 h-5 text-red-500"/>
                        <p className="font-regular text-sm text-red-500">Delete Doctor</p>
                      </button>
                    </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4"/>
              <span>{doctor.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{doctor.email}</span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Microscope className="h-4 w-4" />
                  <span>Speciality</span>
                </div>
                <p className="text-sm font-medium text-foreground">{specialities[doctor.speciality]}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Birth Date</span>
                </div>
                <p className="text-sm font-medium text-foreground">{formatDate(doctor.birthDate)}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User2 className="h-3.5 w-3.5" />
                <span>Doctor Since</span>
              </div>
              <p className="text-sm font-medium text-foreground">{formatDate(doctor.createdAt)}</p>
            </div>
          </div>
        </CardContent>
        <PasswordConfirmationModal
            toDelete={true}
            onSuccess={handleDeleteDoctor}
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
        />
      </Card>
  )
}


const Doctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctorStats , setDoctorStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    gender : "",
    speciality : "",
    sorting : "newest",
    name : ""
  });

  const [advancedFilterOptions, setAdvancedFilterOptions] = useState({
    page : 1,
    genders : [],
    specialities : [],
    name : ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {user} = useAuth();
  const role = user?.role;


  const [modalState, setModalState] = useState({
    userRole : "doctor",
    userId : null,
    isOpen: false,
    viewOnly: false,
    isEdit: false
  })

  const handleOpenModal = (userId = null , viewOnly = false, isEdit = false) => {
    setModalState({
      userRole : "doctor",
      isOpen: true,
      viewOnly,
      isEdit,
      userId
    });
  }

  const handleCloseModal = () => {
    setModalState(prev => ({...prev, isOpen: false}));
  };


  const filteredDoctors = useMemo(() => {
    return doctors
        .filter((doctor) => {
          const matchesName =
              doctor.firstName.toLowerCase().includes(filterOptions.name.toLowerCase()) ||
              doctor.lastName.toLowerCase().includes(filterOptions.name.toLowerCase()) ||
              doctor.email.toLowerCase().includes(filterOptions.name.toLowerCase()) ||
              doctor.phoneNumber.toLowerCase().includes(filterOptions.name.toLowerCase());



          const matchesGender =
              filterOptions.gender === '' || doctor.gender === filterOptions.gender;

          const matchesSpeciality = filterOptions.speciality === '' || doctor.speciality === filterOptions.speciality;

          return matchesGender && matchesName && matchesSpeciality;
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
  }, [doctors, filterOptions]);

  const fetchDoctorsAndStats = async () => {
    try{
      setLoading(true);

      const [doctorsResponse , doctorStatsResponse] = await axios.all([
        getDoctors(advancedFilterOptions) , getDoctorStats()
      ]);
      setDoctorStats(doctorStatsResponse.data);
      setDoctors(doctorsResponse.data.items);
    }catch (e) {
      console.error("Error fetching doctors:", e);
      setError(`Error fetching doctors: ${e}`);
    }finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if(!user) return;
    fetchDoctorsAndStats();
  }, [user , advancedFilterOptions]);


  const handleResetAllFilters = () => {
    setFilterOptions({
      gender: "",
      speciality: "",
      sorting: "newest",
      name: ""
    });

    setAdvancedFilterOptions({
      page : 1,
      name: '',
      genders: [],
      specialities: [],
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
                      className='flex items-center gap-2 self-end justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer bg-main-green/90 hover:bg-main-green'>
                    <UserPlus className='text-white'/>
                    <p className='text-md text-white font-medium'>Create Doctor</p>
                  </button>
              )}
              {doctorStats && <DoctorsOverview doctorsStats={doctorStats}/>}

              <SearchBarFilter
                  filterOptions={filterOptions}
                  setFilterOptions={setFilterOptions}
                  advancedFilterOptions={advancedFilterOptions}
                  setAdvancedFilterOptions={setAdvancedFilterOptions}
                  resetAllFilters={handleResetAllFilters}
              />

              {filteredDoctors.length === 0 ? (
                  <div className='flex flex-col items-center justify-center w-full py-30'>
                    <UserX className="w-16 h-16 text-red-600 mb-4"/>
                      <h2 className="text-2xl font-bold text-red-700 mb-2">No Doctors</h2>
                    <p className="text-red-600 text-center">
                      Create a doctor to get started or try adjusting your filters.
                    </p>
                  </div>
              ) : (
                  <div className='grid grid-cols-3 gap-5 w-full'>
                    {filteredDoctors.map((patient) => (
                        <DoctorCard
                            doctor={patient}
                            role={role}
                            onView={() => handleOpenModal(patient.id , true , false)}
                            onEdit={() => handleOpenModal(patient.id, false, true)}
                        />
                    ))}
                  </div>
              )}
            </>
        )}
        <PatientDoctorViewUpdate
            userRole={modalState.userRole}
            viewOnly={modalState.viewOnly}
            isEdit={modalState.isEdit}
            isOpen={modalState.isOpen}
            onClose={handleCloseModal}
            userId={modalState.userId}
        />
      </div>
  )
}

export default Doctor
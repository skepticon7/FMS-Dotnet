import React, {useEffect, useMemo, useState} from 'react'
import {useAuth} from "@/context/AuthContext.jsx";
import {getInterventions, getTechniciansSupervisors} from "@/services/api.js";
import {Plus, ServerCrash, UserX , ChevronLeft , ChevronRight} from "lucide-react";
import NewIntervention from "@/components/NewIntervention.jsx";
import {Button} from "@/components/ui/button.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
import axios from "axios";
import {Badge} from "@/components/ui/badge.js";
import {formatLabel} from "@/Utils/formatLabel.js";

const Schedule = () => {
  const [loading , setLoading] = useState(false);
  const [error , setError] = useState(null);
  const [hoveredIntervention  , setHoveredIntervention] = useState(null);
  const [interventions , setInterventions] = useState([])
  const [currentDate , setCurrentDate] = useState(new Date());
  const [technicians , setTechnicians] = useState([]);
  const [technicianFilter , setTechnicianFilter] = useState({
    userIds : [],
    startDate : null,
    endDate : null
  })
  const [cachedInterventions , setCachedInterventions] = useState({
    data : {},
    timestamps : {},
    maxAge : 3 * 60 * 1000 // 3 minutes cache
  })
  const [modalOpen , setModalOpen] = useState(false);

  const getWeekDays = (date) => {
    const week = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week;
  }

  // const filteredInterventions = useMemo(() => {
  //   return interventions.filter((intervention) => {
  //     const matchesTechnician = technicianFilter.userIds[0] === "all" || intervention.assignedTo.id === technicianFilter.userIds[0]
  //     return matchesTechnician
  //   })
  // }, [interventions, technicianFilter.userIds])

  const getInterventionsForDay = (date) => {
    return interventions.filter((inter) => {
      const parsedDate = new Date(inter.startDate);
      return (
          parsedDate.getDate() === date.getDate() &&
          parsedDate.getMonth() === date.getMonth() &&
          parsedDate.getFullYear() === date.getFullYear()
      );
    });
  };


  const {user} = useAuth();
  const role = user?.roles?.split("_")[1];

  const getCacheKey = (date , filters) => {
    const weekDays = getWeekDays(date)
    const weekStart = weekDays[0].toISOString().split("T")[0];
    const  weekEnd = weekDays[6].toISOString().split("T")[0];
    return `week_${weekStart}_to_${weekEnd}_${JSON.stringify(filters)}`
  }

  const weekDays = getWeekDays(currentDate);

  const fetchInterventions = async (date = currentDate, filters = technicianFilter) => {
    try {
      const cacheKey = getCacheKey(date, filters);
      const cacheData = cachedInterventions.data[cacheKey];
      const cacheTimestamps = cachedInterventions.timestamps[cacheKey];
      const now = Date.now();

      if (cacheData && cacheTimestamps && (now - cacheTimestamps < cachedInterventions.maxAge)) {
        setInterventions(cacheData);
        return;
      }

      setLoading(true);
      const weekDays = getWeekDays(date);
      const startDate = weekDays[0].toISOString().split('T')[0];
      const endDate = weekDays[6].toISOString().split('T')[0];
      const apiFilters = {
        ...filters,
        startDate: filters.startDate || startDate,
        endDate: filters.endDate || endDate
      };

      if (role === "TECHNICIAN") {
        const interventionsResponse = await getInterventions(apiFilters, user?.id, role);

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
        }));
        setInterventions(interventionsResponse.data.content);
      }
      else if (role === "SUPERUSER" || role === "SUPERVISOR") {
        const [interventionsResponse, techniciansResponse] = await axios.all([
          getInterventions(apiFilters, user?.id, role),
          getTechniciansSupervisors()
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
        }));
        setInterventions(interventionsResponse.data.content);
        setTechnicians(techniciansResponse.data);
      }
      else {
        throw new Error("Invalid role");
      }

    } catch (e) {
      console.log(e);
      setError(e?.response?.data?.message || "Internal server error");
    } finally {
      setLoading(false);
    }
  }
  const handleAdvancedFilteringOnSucccess = (filters) => {
    fetchInterventions(filters);
  }

  useEffect(() => {
    if(!user) return;
    fetchInterventions(currentDate)
  }, [currentDate , technicianFilter  , user]);

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  const statusStyles = {
   "COMPLETED" : "bg-green-500 text-white",
    "IN_PROGRESS": "bg-blue-500 text-white",
    "SCHEDULED": "bg-purple-500 text-white",
    "CANCELED": "bg-gray-500 text-white",
  };

  const statusStylesBorder = {
    'COMPLETED': 'border-l-green-500',
    'IN_PROGRESS': 'border-l-blue-500',
    'SCHEDULED': 'border-l-purple-500',
    'CANCELED': 'border-l-gray-500',
  };

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
                <button
                    onClick={() => setModalOpen(true)}
                    className='flex items-center gap-5 self-end justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer bg-main-green/90 hover:bg-main-green'>
                  <Plus className='text-white'/>
                  <p className='text-md text-white font-medium'>Schedule Intervention</p>
                </button>
                <div className='border flex items-center justify-between border-[1px] bg-white border-gray-300 rounded-lg  gap-5 w-full p-5'>
                    <div className='flex items-center gap-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <Button
                            variant="outline"
                            size="icon"
                            className='cursor-pointer rounded-sm'
                            onClick={() => (navigateWeek("prev"))}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <h2 className="text-xl font-semibold min-w-[200px] text-center">
                          {
                            `Week of ${weekDays[0].toLocaleDateString()}`
                             }
                        </h2>
                        <Button
                            variant="outline"
                            size="icon"
                            className='cursor-pointer rounded-sm'
                            onClick={() => (navigateWeek("next"))}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button className='cursor-pointer rounded-sm' variant="outline" onClick={() => setCurrentDate(new Date())}>
                        Today
                      </Button>
                    </div>
                  {(role === "SUPERVISOR" || role === "SUPERUSER") && (
                      <Select
                          value={technicianFilter.userIds[0] || ''}
                          onValueChange={(value) => setTechnicianFilter(prev => ({
                            ...prev ,
                            userIds : value === 'all' ? [] : [value]
                          }))}
                      >
                        <SelectTrigger className='rounded-sm'>
                          <SelectValue placeholder="All Patients" />
                        </SelectTrigger>
                        <SelectContent className='rounded-sm'>
                          <SelectItem className='rounded-sm' value="all">All Patients</SelectItem>
                          {technicians.map((tech) => (
                              <SelectItem className='rounded-sm' key={tech.id} value={tech.id}>
                                {tech.firstName} {tech.lastName}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  )}
                </div>
            <div className='w-full'>
              <div className="grid grid-cols-8 border-[1px] w-full rounded-t-lg">
                <div className="p-4 border-r bg-gray-50 rounded-t-lg">
                  <span className="text-sm font-medium text-gray-500">Time</span>
                </div>
                {weekDays.map((day, index) => (
                    <div key={index} className={`p-4  bg-gray-50 text-center ${index === weekDays.length - 1 ? 'rounded-t-lg' : 'border-r'}`}>
                      <div className="text-sm font-medium text-gray-900">
                        {day.toLocaleDateString("en-US", {weekday: "short"})}
                      </div>
                      <div className="text-lg font-bold text-gray-900">{day.getDate()}</div>
                    </div>
                ))}
              </div>
              <div className='grid grid-cols-8 w-full'>
                <div className="border-r border-l">
                  {Array.from({length: 24}, (_, hour) => (
                      <div key={hour} className="h-16 border-b p-2 text-xs text-gray-500">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                  ))}
                </div>

                {weekDays.map((day , dayIndex) => (
                    <div key={dayIndex} className='border-r'>
                      {Array.from({length : 24} , (_ , hour) => {
                        const interventions = getInterventionsForDay(day).filter((inter) => {
                          const parsedDate = new Date(inter.startDate);
                          return parsedDate.getHours() === hour;
                        })

                        return (
                            <div key={hour} className='h-16 border-b p-1 relative'>
                              {interventions.map((intervention, index) => (
                                  <div
                                      key={intervention.id}
                                      onMouseEnter={() => setHoveredIntervention(intervention.id)}
                                      onMouseLeave={() => setHoveredIntervention(null)}
                                      className={`${hoveredIntervention === intervention.id ? '"transform transition-all duration-200 ease-in-out scale-105 z-50 shadow-lg" ' : `z-${10 + index}`} absolute inset-x-1 bg-white border-l-4 rounded p-1 shadow-sm text-xs ${statusStylesBorder[intervention.interventionStatus]} ${index > 0 ? "top-8" : "top-1"}`}
                                      style={{ zIndex: hoveredIntervention === intervention.id ? 50 : 10 + index }}
                                  >
                                    <div className="font-medium truncate">{intervention.site.name}</div>
                                    <div className="text-gray-600 truncate">{intervention.interventionAssignedTo.fullName}</div>
                                    <Badge className={`${statusStyles[intervention.interventionStatus]} px-1 py-0 text-xs`}>
                                      {formatLabel(intervention.interventionStatus)}
                                    </Badge>
                                  </div>
                              ))}
                            </div>
                        )

                      })}
                    </div>
                ))}

              </div>
            </div>
          </>
      )}
      <NewIntervention
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

export default Schedule
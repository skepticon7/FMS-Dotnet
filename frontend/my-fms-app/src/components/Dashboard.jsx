import React, {useState, useEffect, useRef, useMemo} from 'react'
import {
    BarChart3,
    Bell,
    Building2,
    Calendar,
    Download,
    Filter,
    Globe,
    Menu,
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
    ChevronDown,
    Pen,
    Trash2,
    Info,
    Trash, ServerCrash, SquarePen
} from "lucide-react"
import { useSearchParams } from 'react-router-dom'
import {getHomePageData, getInterventionsChartStats, getSitesPie} from "../services/api.js";
import {errorNotification} from "../services/notification.js";
import {useAuth} from "../context/AuthContext.jsx";
import {formatLabel} from "../Utils/formatLabel.js";
import {NewIntervention} from "./index.js";
import axios from "axios";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Cell,
    Tooltip,
    BarChart, Legend, Bar
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {constructSitesPie} from "@/Utils/ConstructSitesPie.js";

const OverviewCard = ({ Icon, title, stat, description }) => {
  return (
    <div className='p-5 rounded-lg border bg-white border-gray-300 flex flex-col gap-2 items-start justify-start'>
      <div className='flex items-center justify-between w-full'>
        <p className='font-semibold text-lg'>{title}</p>
        <div className='flex items-center justify-center p-2 bg-main-green rounded-md'>
          <Icon className='w-5 h-5 text-white'/>
        </div>
      </div>
      <p className='text-main-green font-bold text-3xl'>{stat}</p>
      <p className='text-gray-500 text-sm'>{description}</p>
    </div>
  )
}


const Dashboard = () => {
    const {user} = useAuth();
    const [loading , setLoading] = useState(false);
    const [stats , setStats] = useState([]);
    const [err , setError] = useState(null);
    const [interventions , setInterventions] = useState([])
    const [sitesStats , setSitesStats] = useState([])
    const [interventionsStats , setInterventionsStats] = useState([]);
    const [statFilter , setStatsFilter] = useState('first')
    const role = user?.roles?.split("_")[1];
    const userId = user?.id;

    const fetchHomePageData = async () => {

        try{
            setLoading(true)
            const [homePageResponse , siteStatsResponse , interventionStatsResponse] = await axios.all([
                getHomePageData(userId , role) , getSitesPie(role ===  "TECHNICIAN" ? userId : null) , getInterventionsChartStats(userId , role)
            ]);


            setStats(homePageResponse.stats)
            setInterventions(homePageResponse.interventions)
            setSitesStats(constructSitesPie(siteStatsResponse.data))
            setInterventionsStats(interventionStatsResponse.data)

        }catch (e) {
            console.log(`error : ${e}`)
            setError(e?.response?.data?.message || "Internal server error");
        }finally {
            setLoading(false)
        }

    }

    const filteredInterventionsStats = useMemo(() => {
        return statFilter === 'first'
            ? interventionsStats.slice(0, 6)
            : interventionsStats.slice(6);
    }, [interventionsStats, statFilter]);


    useEffect(() => {
        if(!user) return;
        fetchHomePageData();
        console.log(sitesStats.length)
        console.log(interventionsStats.length)
    } , [user])


    const statusStyles = {
        'In Progress': 'bg-blue-900 text-white',
        'Completed': 'bg-green-500 text-white',
        'Scheduled': 'bg-purple-500 text-white',
        'Canceled': 'bg-gray-400 text-white', // Added Canceled
    };

    const priorityStyles = {
        'Low': 'bg-green-100 text-green-800 border-green-200',
        'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'High': 'bg-orange-100 text-orange-800 border-orange-200',
        'Critical': 'bg-red-100 text-red-800 border-red-200',
        'Urgent': 'bg-pink-100 text-pink-800 border-pink-200',
    };


  const [actionsDropDown , setActionsDropDown] = useState(false);
  const [openedIntervention , setOpenedIntervention] = useState(-1);
  const [openModal , setOpenModal] = useState(false)
    const [viewOnly , setViewOnly] = useState(false);

    const dropdownRef = useRef(null);

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

  return (
    <>
        {loading ? (
            <div className='flex items-center justify-center w-full py-30'>
                <span className="loading loading-spinner custom-spinner loading-2xl text-main-green "></span>
            </div>
        ) : err != null ? (
            <div className='flex items-center flex-col justify-center w-full py-30'>
                <ServerCrash className="w-16 h-16 text-red-600 mb-4"/>
                <h2 className="text-2xl font-bold text-red-700 mb-2">Server Error</h2>
                <p className="text-red-600 text-center">
                    Oops! Something went wrong on our side. Please try refreshing the page or come back later.
                </p>
            </div>
        ) : (
            <>
                <div className='grid grid-cols-3 gap-3'>
                    {( role === "SUPERVISOR" || role === "SUPERUSER") ? (

                            <>
                                <OverviewCard
                                    title={"Active Sites"}
                                    Icon={Building2}
                                    stat={stats.activeSites}
                                    description={"Currently operational locations"}
                                />
                                <OverviewCard
                                    title={"Active Patients"}
                                    Icon={Users}
                                    stat={stats.availableUsers}
                                    description={"On-duty field personnel"}
                                />
                                <OverviewCard
                                    title={"Interventions Completed"}
                                    Icon={Wrench}
                                    stat={stats.completedInterventions}
                                    description={"Overall resolved cases"}
                                />
                            </>
                        ) :
                        (
                            <>
                                <OverviewCard
                                    title={"Active Sites"}
                                    Icon={Building2}
                                    stat={stats.activeSites}
                                    description={"Currently operational locations"}
                                />
                                <OverviewCard
                                    title={"Assigned Interventions"}
                                    Icon={Users}
                                    stat={stats.assignedInterventions}
                                    description={"Total assigned cases"}
                                />
                                <OverviewCard
                                    title={"Interventions Completed"}
                                    Icon={Wrench}
                                    stat={stats.completedInterventions}
                                    description={"Your resolved cases"}
                                />
                            </>
                        )

                    }

                </div>

                {(interventionsStats.length !== 0 && sitesStats.length !== 0) && (
                    <div className='grid grid-cols-2 gap-5 w-full mt-5'>
                        <div
                            className='border border-[1px] bg-white border-gray-300 rounded-lg flex flex-col  gap-5 w-full p-5'>
                            <div className='flex items-center justify-between '>
                                <div>
                                    <p className='text-2xl font-bold'>Performance Trends</p>
                                    <p className='text-gray-500 text-sm'>Monthly workload distribution</p>
                                </div>
                                <div>
                                    <Select
                                        value={statFilter}
                                        onValueChange={(value) => setStatsFilter(value)}
                                    >
                                        <SelectTrigger
                                            className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
                                            <SelectValue
                                                placeholder="Select technician status"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem className='font-medium' key="first" value="first">Jan → Jun</SelectItem>
                                            <SelectItem className='font-medium' key="second" value="second">Jul → Dec</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className='flex items-center justify-center  h-full'>
                                <ChartContainer
                                    config={{}}
                                    className="h-[400px] self-center">
                                    {filteredInterventionsStats.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={filteredInterventionsStats}
                                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="scheduled" stackId="a" fill="#a855f7" />
                                                <Bar dataKey="in_progress" stackId="a" fill="#3b82f6" />
                                                <Bar dataKey="completed" stackId="a" fill="#22c55e" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-center text-gray-500 py-10">No data for selected period</p>
                                    )}
                                </ChartContainer>

                            </div>


                        </div>

                        <div
                            className='border border-[1px] bg-white border-gray-300 rounded-lg flex flex-col gap-5 w-full p-5'>
                            <div>
                                <p className='text-2xl font-bold'>Sites Distribution</p>
                                <p className='text-gray-500 text-sm'>Share of interventions by sites</p>
                            </div>
                            <ChartContainer
                                config={{ value: { label: "Interventions", color: "#00bf40" } }}
                                className="h-[300px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={sitesStats}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="count"
                                            nameKey="siteName"
                                        >
                                            {sitesStats.map((d, i) => (
                                                <Cell key={i} fill={d.color} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                            formatter={(value, name) => [`${value} interventions at `, name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            <div className="mt-4 space-y-2">
                                {sitesStats.map((d) => {
                                    const total = sitesStats.reduce((sum, item) => sum + item.count, 0);
                                    const percentage = total > 0 ? ((d.count / total) * 100).toFixed(1) : 0;

                                    return (
                                        <div key={d.siteName} className="flex flex-col text-sm">
                                            <div className="flex items-center space-x-2">
                                                <span className="w-3 h-3 rounded-full"
                                                      style={{backgroundColor: d.color}}/>
                                                <span>{d.siteName}</span>
                                                <span className='font-bold'>{percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className='border border-[1px] bg-white border-gray-300 rounded-lg flex flex-col gap-5 w-full p-5 mt-5'>
                    <div className='flex items-start justify-between w-full'>
                        <div>
                            <p className='text-2xl font-bold'>Recent Interventions</p>
                            <p className='text-gray-500 text-sm'>Latest Technician activity</p>
                        </div>
                        <div className='flex gap-2'>


                            <button
                                onClick={() => {
                                    setOpenModal(true);
                                    setOpenedIntervention(-1);
                                    setViewOnly(false);
                                    setActionsDropDown(false);
                                }}
                                className='flex gap-3 w-full cursor-pointer items-center justify-center rounded-md p-2 bg-main-green transition-colors duration-200 hover:bg-main-green/60'>
                                <Plus className='w-5 h-5 text-white'/>
                                <p className='text-sm font-semibold text-white'>New</p>
                            </button>
                        </div>
                    </div>
                    <div className='px-4 w-full'>
                        {interventions.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 flex flex-col items-center justify-center">
                                    <Wrench className="w-10 h-10 mb-2 "/>
                                    <span className="text-xl font-semibold ">No interventions currently</span>
                                </div>
                            ) :
                            (
                                <table className='border-collapse w-full'>
                                    <thead>
                                    <tr className='border-b-[1px] border-gray-300 text-left'>
                                        <th className='font-bold text-sm py-3 px-2'>Code</th>
                                        <th className='font-bold text-sm'>Site</th>
                                        <th className='font-bold text-sm'>Technician</th>
                                        <th className='font-bold text-sm'>Status</th>
                                        <th className='font-bold text-sm'>Priority</th>
                                        <th className='font-bold text-sm'/>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        interventions.map((int, index) => (
                                            <tr
                                                key={int.id || index}
                                                className={`text-left ${index === interventions.length - 1 ? 'border-none' : 'border-b border-gray-300'}`}
                                            >
                                                <td className="font-mono text-sm font-semibold py-4 px-2">{int.code}</td>
                                                <td className="text-sm py-4">{int.site}</td>
                                                <td className="text-sm py-4">{int.technician}</td>
                                                <td className="py-4">
                                          <span
                                              className={`text-xs font-semibold py-1 px-2 rounded-full ${statusStyles[formatLabel(int.status)]}`}>
                                            {formatLabel(int.status)}
                                          </span>
                                                </td>
                                                <td className="py-4">
                                      <span
                                          className={`text-xs font-semibold py-1 px-2 rounded-full border ${priorityStyles[formatLabel(int.priority)]}`}>
                                        {formatLabel(int.priority)}
                                      </span>
                                                </td>
                                                <td className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenedIntervention(index);
                                                            setActionsDropDown((prev) => openedIntervention === index ? !prev : true);
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <MoreHorizontal/>
                                                    </button>

                                                    {actionsDropDown && openedIntervention === index && (
                                                        <div
                                                            ref={dropdownRef}
                                                            className="absolute p-1 z-50 -right-15 shadow-xl top-10 min-w-50 bg-white border border-gray-300 rounded-lg flex flex-col items-start dropdown-animate-down"
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setViewOnly(true);
                                                                    setOpenModal(true);
                                                                    setOpenedIntervention(index);
                                                                    setActionsDropDown(false)
                                                                }}
                                                                className="flex items-center gap-5 p-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                                                                <Eye className="w-5 h-5 text-black"/>
                                                                <p className="font-medium text-sm">View Details</p>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setOpenModal(true);
                                                                    setOpenedIntervention(index);
                                                                    setViewOnly(false);
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
                                        ))
                                    }
                                    </tbody>
                                </table>
                            )
                        }


                    </div>

                </div>
            </>
        ) }
        <NewIntervention
            viewOnly={viewOnly}
            key={openedIntervention}
            isEdit={openedIntervention !== -1}
            interventionId={openedIntervention !== -1 ? interventions[openedIntervention]?.id : null}
            onClose={() => {
                setOpenModal(false)
                setOpenedIntervention(-1)}
            }
            isOpen={openModal}
        >

        </NewIntervention>
    </>

  )
}

export default Dashboard
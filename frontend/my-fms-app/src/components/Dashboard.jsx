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
    Trash, ServerCrash, SquarePen , FolderOpen ,FileText , Activity , Database
} from "lucide-react"
import { useSearchParams } from 'react-router-dom'
import {
    deleteFile,
    getDashboardPageData,
    getHomePageData,
    getInterventionsChartStats,
    getSitesPie
} from "../services/api.js";
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
import OverviewCard from "@/shared/OverviewCard.jsx";
import {formatFileSize} from "@/Utils/formatFileSize.js";
import {Card} from "@/components/ui/card.js";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.jsx";
import {Badge} from "@/components/ui/badge.js";
import {format} from "date-fns";
import {Button} from "@/components/ui/button.js";
import {getFileTypeLabel} from "@/Utils/getFileTypeLabel.js";
import FileUploadModal from "@/components/FileUploadModal.jsx";
import FilePreviewModal from "@/components/FilePreviewModal.jsx";
import FileDeleteConfirmationModal from "@/components/FileDeleteConfirmationModal.jsx";
import {toast} from "react-hot-toast";


const Dashboard = () => {
    const {user  , setSelectedPage} = useAuth();
    const [loading , setLoading] = useState(false);
    const [err , setError] = useState(null);
    const [statFilter , setStatsFilter] = useState('first')
    const [previewFile, setPreviewFile] = useState(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);


    const [stats , setStats] = useState(null);
    const [files , setFiles] = useState([]);

    const role = user?.role;
    const userId = user?.id;

    const fetchDashboardData = async () => {

        try{
            setLoading(true)

            const dashboardResponse = await getDashboardPageData(userId , role);

            setStats(dashboardResponse.stats);
            setFiles(dashboardResponse.files);

        }catch (e) {
            console.log(`error : ${e}`)
            setError(e?.response?.data?.message || "Internal server error");
        }finally {
            setLoading(false)
        }

    }

    // const filteredInterventionsStats = useMemo(() => {
    //     return statFilter === 'first'
    //         ? interventionsStats.slice(0, 6)
    //         : interventionsStats.slice(6);
    // }, [interventionsStats, statFilter]);


    useEffect(() => {
        if(!user) return;
        fetchDashboardData();
    } , [user])

    const confirmDelete = async (note) => {
        if (!fileToDelete) return;

        try {
            setIsDeleting(true);
            await deleteFile(fileToDelete.id, note); // Pass the note to the API
            toast.success("File deleted successfully");

            // Close modal and clear selection
            setFileToDelete(null);

            // Refresh list
            fetchDashboardData();
        } catch (error) {
            console.error("Failed to delete file:", error);
            toast.error("Failed to delete file");
        } finally {
            setIsDeleting(false);
        }
    };



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
                <div className='grid grid-cols-4 gap-3'>
                                        <OverviewCard
                                            title={`${role === 'Manager' ? 'Total Patients Folders' : 'Assigned Folders'}`}
                                            subtitle={stats?.filesStats?.totalFolders}
                                            // description={`${role === 'Manager' ? 'Total Patient folders' : 'Patient folders assigned to you'}`}
                                            Icon={FolderOpen}
                                            color={'blue'}
                                        />
                                        <OverviewCard
                                            title={'Medical File Entries'}
                                            subtitle={stats?.filesStats?.totalFiles}
                                            // description={`${role === 'Manager' ? 'Total medical file entries across the system' : 'Files related to your patients'}`}
                                            Icon={FileText}
                                            color={'green'}
                                        />
                                        <OverviewCard
                                            title={`${role === 'Manager' ? 'Cloud Storage' : 'Data Load'}`}
                                            subtitle={formatFileSize(stats?.filesStats?.totalSize)}
                                            // description={`${role === 'Manager' ? 'Total allocated cloud storage' : 'Total size of assigned files'}`}
                                            Icon={Database}
                                            color={'orange'}
                                        />
                                        <OverviewCard
                                            title={`${role === 'Manager' ? 'Active Doctors' : 'Active Patients'}`}
                                            subtitle={role === 'Manager' ? stats?.usersStats?.activeDoctors : stats?.usersStats?.activePatients}
                                            // description={`${role === 'Manager' ? 'Total doctors in the system' : 'Patients under your care'}`}
                                            Icon={Activity}
                                            color={'purple'}
                                        />
                </div>


                <Card
                    className=' bg-white  rounded-lg flex flex-col gap-5 w-full p-5 mt-5'>
                    <div className='flex items-start justify-between w-full'>
                        <div>
                            <p className='text-2xl font-bold'>Recent File Entries</p>
                            <p className='text-gray-500 text-sm'>Latest Documents submitted</p>
                        </div>
                        <div className='flex gap-2'>


                            <button
                                onClick={() => setSelectedPage("files")}
                                className='flex gap-2 w-full cursor-pointer items-center justify-center rounded-md py-2 px-3 bg-main-green transition-colors duration-200 hover:bg-main-green/60'>
                                <Eye className='w-5 h-5 text-white'/>
                                <p className='text-sm font-semibold text-white'>View All</p>
                            </button>
                        </div>
                    </div>
                    <div className='px-4 w-full'>
                        <Card className="rounded-lg border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden bg-white/80 backdrop-blur-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-100">
                                        <TableHead className="py-5 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">File Name</TableHead>
                                        <TableHead className="py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Type</TableHead>
                                        <TableHead className="py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Size</TableHead>
                                        <TableHead className="py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Version</TableHead>
                                        <TableHead className="py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Uploaded</TableHead>
                                        <TableHead className="py-5 px-6 text-right text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {files.map((file) => (
                                        <TableRow key={file.id} className="group border-b border-slate-100 transition-all hover:bg-emerald-50/30">
                                            <TableCell className="py-5 px-6 font-bold text-slate-900">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all duration-300">
                                                        <FileText className="size-5" />
                                                    </div>
                                                    {file.fileName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600 border-none">
                                                    {/* 2. Use the helper function here */}
                                                    {getFileTypeLabel(file.fileType)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-5 text-muted-foreground text-sm">{(file.size / 1024).toFixed(1)} KB</TableCell>
                                            <TableCell className="py-5">
                                                <span className="text-sm font-medium">v{file.version || 1}</span>
                                            </TableCell>
                                            <TableCell className="py-5 text-muted-foreground text-sm">
                                                {file.uploadedAt ? format(new Date(file.uploadedAt), "MMM d, yyyy") : "N/A"}
                                            </TableCell>
                                            <TableCell className="py-5 text-right px-6">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-9 rounded-xl border-slate-200 hover:border-emerald-500 hover:text-emerald-600 bg-white"
                                                        onClick={() => setPreviewFile(file)}
                                                    >
                                                        <Eye className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-9 rounded-xl border-slate-200 hover:border-emerald-500 hover:text-emerald-600 bg-white"
                                                    >
                                                        <Download className="size-4" />
                                                    </Button>
                                                    {role === 'Manager' && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="size-9 rounded-xl border-slate-200 hover:border-red-500 hover:text-red-600 bg-white"
                                                            onClick={() => setFileToDelete(file)} // Just set state, don't delete yet
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {files.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                                No files uploaded to this folder yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </Card>


                <FilePreviewModal
                    isOpen={!!previewFile}
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                />
                <FileDeleteConfirmationModal
                    isOpen={!!fileToDelete}
                    onClose={() => setFileToDelete(null)}
                    onConfirm={confirmDelete}
                    fileName={fileToDelete?.fileName}
                    loading={isDeleting}
                />
            </>
        ) }
        {/*<NewIntervention*/}
        {/*    viewOnly={viewOnly}*/}
        {/*    key={openedIntervention}*/}
        {/*    isEdit={openedIntervention !== -1}*/}
        {/*    interventionId={openedIntervention !== -1 ? interventions[openedIntervention]?.id : null}*/}
        {/*    onClose={() => {*/}
        {/*        setOpenModal(false)*/}
        {/*        setOpenedIntervention(-1)}*/}
        {/*    }*/}
        {/*    isOpen={openModal}*/}
        {/*>*/}

        {/*</NewIntervention>*/}
    </>

  )
}

export default Dashboard
import {Input} from "@/components/ui/input.js";
import {
    ServerCrash,
    UserPlus,
    UserX,
    Folder,
    Badge,
    MoreVertical,
    Eye,
    Edit2,
    Trash2,
    FileText,
    Calendar,
    ChevronRight,
    ChevronLeft,
    FolderUp,
    SquarePen, Trash, FolderX
} from "lucide-react";
import React, {useEffect, useMemo, useState} from "react";
import {useAuth} from "@/context/AuthContext.jsx";
import {Card, CardContent} from "@/components/ui/card.js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.js";
import {Button} from "@/components/ui/button.js";
import {format} from "date-fns";
import {getFoldersByDoctorId, getFoldersByManager} from "@/services/api.js";

const SearchBarFilter = ({filterOptions , setFilterOptions , advancedFilterOptions , setAdvancedFilterOptions, role}) => {

    const [modalState , setModalState] = useState({
        folderId : null,
        isOpen : false,
        viewOnly : false,
        isEdit : false
    });

    const handleOpenModal = (folderId = null , viewOnly = false , isEdit = false) => {
        setModalState(prev => ({...prev , folderId , viewOnly  , isEdit  , isOpen: true}))
    }

    const handleCloseModal = () => {
        setModalState(prev => ({...prev , isOpen: false}))
    }

    const {name} = filterOptions;

    return(
        <div className='flex items-start justify-center w-full gap-5 flex-col p-6 bg-white rounded-lg border-[1px] border-gray-300'>
            <div className='flex items-center justify-between w-full'>
                <p className='text-2xl font-bold text-black'>Filters & Search</p>
                <div className='flex gap-2 items-center justify-center'>
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
            <div className='flex flex-wrap gap-4 w-full '>
                <Input
                    value={name}
                    onChange={(e) => setFilterOptions({...filterOptions, name: e.target.value})}
                    placeholder="Search Folders..."
                    className="py-5 focus:outline-none focus:ring-0 flex-1"
                />

                {role === 'Manager' && (
                    <button
                        onClick={() => handleOpenModal(null , false , false)}
                        className='flex items-center gap-2 self-end justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer bg-main-green/90 hover:bg-main-green'>
                        <FolderUp className='text-white'/>
                        <p className='text-md text-white font-medium'>Create Folder</p>
                    </button>
                )}

            </div>
        </div>
    )
}

const FolderCard = ({folder , onClick , role}) => {
    return (
        <>
           <div className="group cursor-pointer" onClick={() => onClick(folder)}>
            <Card className="relative overflow-hidden border-slate-200/60 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-emerald-200/50 rounded-2xl group-hover:-translate-y-0.5">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-100">
                                <Folder className="size-6 fill-emerald-600/10" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 text-lg tracking-tight leading-none mb-1.5">
                                    {/* 1. Dynamic Name */}
                                    {folder.name || "Untitled Folder"}
                                </h3>
                                <Badge variant="secondary" className="bg-slate-50 text-slate-500 font-medium text-[10px] px-2 py-0 h-5 border-none">
                                    {/* 2. Dynamic Type (Medical/Clinical) */}
                                    {folder.type || "General"}
                                </Badge>
                            </div>
                        </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="size-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <button
                                            onClick={() => onClick(folder)}
                                            className=" flex items-center gap-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                                            <Eye className="w-5 h-5 text-black"/>
                                            <p className="font-regular text-sm">View Folder</p>
                                        </button>
                                    </DropdownMenuItem>
                                    {role === 'Manager' && (
                                        <>
                                            <DropdownMenuItem>
                                                <button
                                                    onClick={() => onEdit()}
                                                    className=" flex items-center gap-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                                                    <SquarePen className="w-5 h-5 text-black"/>
                                                    <p className="font-regular text-sm">Edit Patient</p>
                                                </button>
                                            </DropdownMenuItem>
                                        </>

                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Files</span>
                            <div className="flex items-center gap-1.5">
                                <FileText className="size-3.5 text-emerald-500" />
                                <span className="text-sm font-bold text-slate-700">
                                    {/* 3. Dynamic File Count (If you added it to DTO, otherwise 0) */}
                                    {folder.fileCount || 0}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Created At</span>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="size-3.5 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600">
                                    {/* 4. Dynamic Date Formatting */}
                                    {folder.createdAt 
                                        ? format(new Date(folder.createdAt), "MMM d, yyyy") 
                                        : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        </>
    )
}

const Files = () => {
    const {user} = useAuth();
    const role = user?.role;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [folders , setFolders] = useState([]);
    
    const [filterOptions, setFilterOptions] = useState({
        name: ""
    });

    const [advancedFilterOptions, setAdvancedFilterOptions] = useState({
        page: 1
    });

    const getFolders = async () => {
       try{
           setLoading(true);
           let fetchFolders;
           switch (role) {
               case "Manager" :
                   fetchFolders = () => getFoldersByManager(); // GET /api/folder/all
                   break;
               case "Doctor":
                   fetchFolders = () => getFoldersByDoctorId(user?.id);
                   break;
               default : 
                   // Handle generic or admin cases if needed
                   fetchFolders = async () => ({ data: [] });
           }
           
           const foldersResponse = await fetchFolders();
           // Ensure we map the response correctly. 
           // If your API returns just the list, use foldersResponse. 
           // If it returns { items: [...] }, use foldersResponse.data.items or foldersResponse.items
           // Based on your previous code you expected .data.items:
           const data = foldersResponse.data?.items || foldersResponse.data || [];
           setFolders(data);

       } catch (e) {
           console.log(`Error fetching folders : ${e}`);
           setError(e);
       } finally {
           setLoading(false);
       }
    }

    // 1. Fetch data on load
    useEffect(() => {
        if(!user) return;
        getFolders();
    } , [user] );

    // 2. Define filteredFolders (The missing piece)
    const filteredFolders = useMemo(() => {
        if (!folders) return [];
        return folders.filter(folder => {
            const fName = folder.name?.toLowerCase() || "";
            const search = filterOptions.name?.toLowerCase() || "";
            return fName.includes(search);
        });
    } , [folders, filterOptions.name]);

    return (
        <div className={'flex flex-col justify-start items-start  h-full gap-6 w-full'}>
            {loading ? (
                <div className='flex items-center justify-center w-full py-30'>
                    <span className="loading loading-spinner custom-spinner loading-2xl text-main-green "></span>
                </div>
            ) : error != null ? (
                <div className='flex items-center flex-col justify-center w-full py-30'>
                    <ServerCrash className="w-16 h-16 text-red-600 mb-4"/>
                    <h2 className="text-2xl font-bold text-red-700 mb-2">Server Error</h2>
                    <p className="text-red-600 text-center">
                        Oops! Something went wrong.
                    </p>
                </div>
            ) : (
                <>
                    <SearchBarFilter
                        filterOptions={filterOptions}
                        setFilterOptions={setFilterOptions}
                        advancedFilterOptions={advancedFilterOptions}
                        setAdvancedFilterOptions={setAdvancedFilterOptions}
                        role={role}
                    />

                    {/* 3. Use filteredFolders here */}
                    {filteredFolders.length === 0 ? (
                        <div className='flex flex-col items-center justify-center w-full py-20'>
                             <FolderX className="w-16 h-16 text-gray-300 mb-4"/>
                             <h2 className="text-xl font-semibold text-gray-500">No Folders Found</h2>
                        </div>
                    ) : (
                        <div className='grid grid-cols-4 w-full gap-5'>
                            {filteredFolders.map((folder, index) => (
                                <FolderCard
                                    key={folder.id || index}
                                    folder={folder}
                                    role={role}
                                    // Add onClick handler here if needed
                                    onClick={(f) => console.log(f)} 
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Files;
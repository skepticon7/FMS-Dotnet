import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext.jsx";
import { 
    getFoldersByDoctorId, 
    getFoldersByManager, 
    deleteFolder 
} from "@/services/api.js";

// Icons
import {
    ServerCrash,
    Folder,
    Badge,
    MoreVertical,
    Eye,
    SquarePen,
    FileText,
    Calendar,
    ChevronRight,
    ChevronLeft,
    FolderPlus,
    FolderX,
    Trash2
} from "lucide-react";

// UI Components
import { Input } from "@/components/ui/input.js";
import { Card, CardContent } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.js";

// Custom Components
import FolderCreateUpdate from "./FolderCreateUpdate.jsx";
import DeleteConfirmationModal from "./DeleteConfirmationModal.jsx";
import { FolderDetailView } from "./FolderDetailView.jsx"; // <-- Import the new view

// --- SearchBarFilter ---
const SearchBarFilter = ({ 
    filterOptions, 
    setFilterOptions, 
    advancedFilterOptions, 
    setAdvancedFilterOptions, 
    role, 
    onCreateOpen 
}) => {
    const { name } = filterOptions;
    // ... (Keep implementation exactly as before)
    return (
        <div className='flex items-start justify-center w-full gap-5 flex-col p-6 bg-white rounded-lg border-[1px] border-gray-300'>
            <div className='flex items-center justify-between w-full'>
                <p className='text-2xl font-bold text-black'>Filters & Search</p>
                <div className='flex gap-2 items-center justify-center'>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAdvancedFilterOptions((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={advancedFilterOptions.page === 1}
                            className="h-10 flex items-center justify-center border border-gray-300 px-3 cursor-pointer transition-colors duration-200 bg-transparent hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5 text-black" />
                        </button>
                        <div className="h-10 flex items-center justify-center border border-gray-300 px-3 bg-transparent rounded-md">
                            <p className='font-semibold'>Page {advancedFilterOptions.page}</p>
                        </div>
                        <button
                            onClick={() => setAdvancedFilterOptions((prev) => ({ ...prev, page: prev.page + 1 }))}
                            className="h-10 flex items-center justify-center border border-gray-300 px-3 cursor-pointer transition-colors duration-200 bg-transparent hover:bg-gray-100 rounded-md"
                        >
                            <ChevronRight className="w-5 h-5 text-black" />
                        </button>
                    </div>
                </div>
            </div>
            <div className='flex flex-wrap gap-4 w-full '>
                <Input
                    value={name}
                    onChange={(e) => setFilterOptions({ ...filterOptions, name: e.target.value })}
                    placeholder="Search Folders..."
                    className="py-5 focus:outline-none focus:ring-0 flex-1"
                />
                {role === 'Manager' && (
                    <button
                        onClick={onCreateOpen}
                        className='flex items-center gap-2 justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer border border-main-green/90 text-main-green hover:bg-main-green/10 bg-white'>
                        <FolderPlus className='w-5 h-5' />
                        <p className='text-md font-medium'>Create Folder</p>
                    </button>
                )}
            </div>
        </div>
    )
}

// --- Folder Card ---
const FolderCard = ({ folder, onClick, role, onEdit, onDelete }) => {
    // ... (Keep implementation exactly as before - make sure to remove nested <button>)
    return (
        <div className="group cursor-pointer" onClick={() => onClick(folder)}>
            <Card className="relative overflow-hidden border-slate-200/60 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-emerald-200/50 rounded-2xl group-hover:-translate-y-0.5">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-100">
                                <Folder className="size-6 fill-emerald-600/10" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 text-lg tracking-tight leading-none mb-1.5 truncate max-w-[150px]">
                                    {folder.name || "Untitled Folder"}
                                </h3>
                                <Badge variant="secondary" className="bg-slate-50 text-slate-500 font-medium text-[10px] px-2 py-0 h-5 border-none">
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
                                    <MoreVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={(e) => { e.stopPropagation(); onClick(folder); }}
                                    className="flex items-center gap-2 cursor-pointer text-gray-700">
                                    <Eye className="w-4 h-4" />
                                    <span>View Folder</span>
                                </DropdownMenuItem>
                                {role === 'Manager' && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={(e) => { e.stopPropagation(); onEdit(folder); }}
                                            className="flex items-center gap-2 cursor-pointer text-gray-700">
                                            <SquarePen className="w-4 h-4" />
                                            <span>Edit Folder</span>
                                        </DropdownMenuItem>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <DropdownMenuItem
                                            onClick={(e) => { e.stopPropagation(); onDelete(folder); }}
                                            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete Folder</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {/* ... Stats Section ... */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Files</span>
                            <div className="flex items-center gap-1.5">
                                <FileText className="size-3.5 text-emerald-500" />
                                <span className="text-sm font-bold text-slate-700">{folder.fileCount || 0}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Created At</span>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="size-3.5 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600">
                                    {folder.createdAt ? format(new Date(folder.createdAt), "MMM d, yyyy") : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// --- Main Files Component ---
const Files = () => {
    const { user } = useAuth();
    const role = user?.role; 
    
    // View State: 'list' (default) or 'detail' (viewing a folder)
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
    const [activeFolder, setActiveFolder] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [folders, setFolders] = useState([]);

    const [filterOptions, setFilterOptions] = useState({ name: "" });
    const [advancedFilterOptions, setAdvancedFilterOptions] = useState({ page: 1 });

    // Modals
    const [modalState, setModalState] = useState({ isOpen: false, folderId: null, viewOnly: false, isEdit: false });
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, folder: null });
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Logic
    const getFolders = async () => {
        try {
            setLoading(true);
            let response;
            if (role === "Manager" || role === "SuperUser") {
                response = await getFoldersByManager();
            } else if (role === "Doctor") {
                response = await getFoldersByDoctorId(user?.id);
            } else {
                setFolders([]); return;
            }
            const data = response?.data?.items || response?.data || response || [];
            setFolders(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(`Error fetching folders:`, e);
            setError(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!user) return;
        getFolders();
    }, [user, role, advancedFilterOptions.page]);

    // Handlers
    const handleViewOpen = (folder) => {
        setActiveFolder(folder);
        setViewMode('detail'); // Switch view
    };

    const handleBackToList = () => {
        setViewMode('list');
        setActiveFolder(null);
        getFolders(); // Refresh list on back (optional)
    };

    const handleDeleteClick = (folder) => setDeleteModalState({ isOpen: true, folder });
    
    const confirmDelete = async (note) => {
        if (!deleteModalState.folder) return;
        try {
            setIsDeleting(true);
            await deleteFolder(deleteModalState.folder.id, note);
            toast.success("Folder deleted successfully");
            setDeleteModalState({ isOpen: false, folder: null });
            getFolders();
        } catch (e) {
            toast.error("Failed to delete folder");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreateOpen = () => setModalState({ isOpen: true, folderId: null, isEdit: false });
    const handleEditOpen = (folder) => setModalState({ isOpen: true, folderId: folder.id, isEdit: true });
    const handleModalClose = () => { setModalState(prev => ({ ...prev, isOpen: false })); getFolders(); };

    // Filtering
    const filteredFolders = useMemo(() => {
        if (!Array.isArray(folders)) return [];
        return folders.filter(folder => 
            (folder.name?.toLowerCase() || "").includes(filterOptions.name?.toLowerCase() || "")
        );
    }, [folders, filterOptions.name]);

    // --- RENDER LOGIC ---

    // 1. If in Detail Mode, show the Detail View
    if (viewMode === 'detail' && activeFolder) {
        return <FolderDetailView folder={activeFolder} onBack={handleBackToList} />;
    }

    // 2. Otherwise, show the Grid View (Default)
    return (
        <div className={'flex flex-col justify-start items-start h-full gap-6 w-full'}>
            {loading ? (
                <div className='flex items-center justify-center w-full py-30'>
                    <span className="loading loading-spinner custom-spinner loading-2xl text-main-green "></span>
                </div>
            ) : error != null ? (
                <div className='flex items-center flex-col justify-center w-full py-30'>
                    <ServerCrash className="w-16 h-16 text-red-600 mb-4" />
                    <h2 className="text-2xl font-bold text-red-700 mb-2">Server Error</h2>
                    <p className="text-red-600 text-center">Oops! Something went wrong.</p>
                </div>
            ) : (
                <>
                    <SearchBarFilter
                        filterOptions={filterOptions}
                        setFilterOptions={setFilterOptions}
                        advancedFilterOptions={advancedFilterOptions}
                        setAdvancedFilterOptions={setAdvancedFilterOptions}
                        role={role}
                        onCreateOpen={handleCreateOpen}
                    />

                    {filteredFolders.length === 0 ? (
                        <div className='flex flex-col items-center justify-center w-full py-20'>
                            <FolderX className="w-16 h-16 text-gray-300 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-500">No Folders Found</h2>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-5'>
                            {filteredFolders.map((folder, index) => (
                                <FolderCard
                                    key={folder.id || index}
                                    folder={folder}
                                    role={role}
                                    onClick={handleViewOpen}
                                    onEdit={handleEditOpen}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Modals are always rendered but hidden until needed */}
            <FolderCreateUpdate 
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                isEdit={modalState.isEdit}
                userRole={role}
                folderId={modalState.folderId} 
            />

            <DeleteConfirmationModal 
                isOpen={deleteModalState.isOpen}
                folderName={deleteModalState.folder?.name}
                loading={isDeleting}
                onClose={() => setDeleteModalState({ isOpen: false, folder: null })}
                onConfirm={confirmDelete}
            />
        </div>
    )
}

export default Files;
import React, { useEffect, useState } from "react";
import { ArrowLeft, FileText, Download, UploadCloud, Eye, Clock, User, HardDrive, Loader2, ServerCrash, Stethoscope , Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getFilesByFolder, getDoctorById, getPatientById , deleteFile } from "@/services/api.js";
import FilePreviewModal from "./FilePreviewModal.jsx";
import FileUploadModal from "./FileUploadModal.jsx";
import FileDeleteConfirmationModal from "./FileDeleteConfirmationModal.jsx"; // <-- 1. Import Modal
import { toast } from "react-hot-toast";
import {formatFileSize} from "@/Utils/formatFileSize.js";
import {getFileTypeLabel} from "@/Utils/getFileTypeLabel.js";
// 1. Helper to Map Enum Integers to Strings


function StatItem({ icon: Icon, label, value }) {
    return (
        <Card className="shadow-none border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600">
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-lg font-bold text-slate-900 leading-tight truncate max-w-[150px]" title={value}>
                        {value}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export function FolderDetailView({ folder, onBack }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // State for Names
    const [doctorName, setDoctorName] = useState("Loading...");
    const [patientName, setPatientName] = useState("Loading...");


    const fetchFilesOnly = async () => {
        try {
            const filesRes = await getFilesByFolder(folder.id);
            setFiles(filesRes.data || []);
        } catch (e) {
            console.error("Error refreshing files", e);
        }
    };
    const confirmDelete = async (note) => {
        if (!fileToDelete) return;

        try {
            setIsDeleting(true);
            await deleteFile(fileToDelete.id, note); // Pass the note to the API
            toast.success("File deleted successfully");
            
            // Close modal and clear selection
            setFileToDelete(null);
            
            // Refresh list
            fetchFilesOnly();
        } catch (error) {
            console.error("Failed to delete file:", error);
            toast.error("Failed to delete file");
        } finally {
            setIsDeleting(false);
        }
    };
    const handleDelete = async (fileId, fileName) => {
        if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
            return;
        }

        try {
            // Optimistic UI update (optional): remove immediately from list
            // setFiles(prev => prev.filter(f => f.id !== fileId)); 

            await deleteFile(fileId, "Deleted via Web UI");
            toast.success("File deleted successfully");
            
            // Refresh list to sync with backend
            fetchFilesOnly(); 
        } catch (error) {
            console.error("Failed to delete file:", error);
            toast.error("Failed to delete file");
            // If you used optimistic UI, revert here if needed
        }
    };

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // 1. Fetch Files
                const filesRes = await getFilesByFolder(folder.id);
                setFiles(filesRes.data || []);

                // 2. Fetch Doctor Name
                if (folder.doctorId) {
                    try {
                        const docRes = await getDoctorById(folder.doctorId);
                        const doc = docRes.data; 
                        setDoctorName(`Dr. ${doc.firstName} ${doc.lastName}`);
                    } catch (e) {
                        setDoctorName("Unknown");
                    }
                } else {
                    setDoctorName("N/A");
                }

                // 3. Fetch Patient Name
                if (folder.patientId) {
                    try {
                        const patRes = await getPatientById(folder.patientId);
                        const pat = patRes.data;
                        setPatientName(`${pat.firstName} ${pat.lastName}`);
                    } catch (e) {
                        setPatientName("Unknown");
                    }
                } else {
                    setPatientName("N/A");
                }

            } catch (e) {
                console.error("Error loading folder details:", e);
                setError("Failed to load folder contents.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [folder.id, folder.doctorId, folder.patientId]);

    // Derived Stats
    const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
    const formattedSize = formatFileSize(totalSize)
    const latestActivity = files.length > 0
        ? new Date(Math.max(...files.map((f) => new Date(f.uploadedAt).getTime())))
        : new Date(folder.createdAt);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
                <Loader2 className="w-10 h-10 text-main-green animate-spin" />
                <p className="text-sm text-gray-500">Loading folder details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
                <ServerCrash className="w-10 h-10 text-red-500" />
                <p className="text-red-500">{error}</p>
                <Button variant="outline" onClick={onBack}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 font-sans w-full">
            {/* Header Section */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-8">
                <div className="flex items-center gap-6">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onBack}
                        className="size-12 rounded-2xl bg-white border-slate-200/80 shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <ArrowLeft className="size-5" />
                    </Button>
                    <div>
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{folder.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-slate-400 font-medium">Folders</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-emerald-600 font-semibold">{folder.type || "General"}</span>
                        </div>
                    </div>
                </div>
                <Button 
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-[#064e3b] hover:bg-[#064e3b]/90 h-12 px-8 gap-3 rounded-2xl shadow-xl shadow-emerald-900/20 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-white"
                >
                    <UploadCloud className="size-5" /> Upload File
                </Button>
            </div>

            {/* Folder Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatItem icon={FileText} label="Total Files" value={files.length.toString()} />
                <StatItem icon={HardDrive} label="Storage Used" value={formattedSize} />
                <StatItem icon={Clock} label="Last Activity" value={format(latestActivity, "MMM d, HH:mm")} />
                <StatItem icon={Stethoscope} label="Assigned Doctor" value={doctorName} />
                <StatItem icon={User} label="Patient" value={patientName} />
            </div>

            {/* Files Table */}
            <Card className="rounded-3xl border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden bg-white/80 backdrop-blur-sm">
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
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-9 rounded-xl border-slate-200 hover:border-red-500 hover:text-red-600 bg-white"
                                            onClick={() => setFileToDelete(file)} // Just set state, don't delete yet
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
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

            <FileUploadModal 
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                folderId={folder.id}
                onUploadSuccess={fetchFilesOnly} 
            />
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
        </div>
    );
}
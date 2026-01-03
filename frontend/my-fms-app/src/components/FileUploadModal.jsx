import React, { useState } from 'react';
import { UploadCloud, X, File } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { uploadFile } from "@/services/api.js";

const FileUploadModal = ({ isOpen, onClose, folderId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    // 1. Corrected Enum Mapping
    const fileTypes = [
        { value: "General", label: "General / Other" },
        { value: "Prescription", label: "Prescription" },
        { value: "LabReport", label: "Lab Report" },
        { value: "MRI", label: "MRI" },
        { value: "XRay", label: "X-Ray" },
        { value: "CTScan", label: "CT Scan" },
        { value: "Ultrasound", label: "Ultrasound" },
        { value: "DischargeSummary", label: "Discharge Summary" },
        { value: "InsuranceDocument", label: "Insurance Document" }
    ];

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file || !fileType) {
            toast.error("Please select a file and a file type.");
            return;
        }

        const formData = new FormData();
        formData.append("FolderId", folderId);
        formData.append("File", file);
        formData.append("FileType", fileType); // Sends correct string (e.g., "XRay")
        if (notes) formData.append("Notes", notes);

        try {
            setLoading(true);
            await uploadFile(formData);
            toast.success("File uploaded successfully!");
            onUploadSuccess(); 
            onClose();
            
            // Reset form
            setFile(null);
            setFileType("");
            setNotes("");
        } catch (error) {
            console.error("Upload failed", error);
            // Show specific backend error if available
            toast.error(error.response?.data?.title || "Failed to upload file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 p-6">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Upload File</h3>
                        <p className="text-sm text-gray-500">Add a new document to this folder.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* File Dropzone */}
                    <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50/50 transition-colors">
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {file ? (
                            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-md pointer-events-none">
                                <File className="w-5 h-5" />
                                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                <span className="text-xs text-emerald-500">({(file.size/1024).toFixed(1)} KB)</span>
                            </div>
                        ) : (
                            <>
                                <div className="p-3 bg-gray-100 rounded-full mb-3">
                                    <UploadCloud className="w-6 h-6 text-gray-500" />
                                </div>
                                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-400 mt-1">PDF, Images, or Documents</p>
                            </>
                        )}
                    </div>

                    {/* File Type Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Document Type <span className="text-red-500">*</span></label>
                        <Select value={fileType} onValueChange={setFileType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                                {fileTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <Textarea 
                            placeholder="Add any relevant details about this file..."
                            className="resize-none h-24 text-sm"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : "Upload"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FileUploadModal;
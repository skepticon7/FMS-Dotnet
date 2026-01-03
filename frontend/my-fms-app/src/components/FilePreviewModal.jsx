import React from 'react';
import { X, Download, FileText, Image as ImageIcon, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";

// 1. DEFINE BACKEND URL (Strips trailing slash if present)
const backendUrl = (import.meta.env.VITE_BACKEND_SERVER || "http://localhost:5035").replace(/\/$/, "");

const FilePreviewModal = ({ isOpen, onClose, file }) => {
    if (!isOpen || !file) return null;

    // 2. ROBUST URL CONSTRUCTION
    // Step A: Clean the DB path. Remove 'wwwroot', replace backslashes, remove leading slashes.
    // Example: "wwwroot\uploads\file (2).jpg" -> "uploads/file (2).jpg"
    const cleanPath = (file.storagePath || "")
        .replace(/wwwroot/i, "")      // Remove 'wwwroot' (case insensitive)
        .replace(/\\/g, "/")          // Replace backslashes with forward slashes
        .replace(/^\/+/, "");         // Remove leading slashes

    // Step B: Build the raw URL
    const rawUrl = file.storagePath.startsWith("http") 
        ? file.storagePath 
        : `${backendUrl}/${cleanPath}`;

    // Step C: Encode the URL to handle spaces " " and parentheses "(2)"
    // This turns "Image (2).jpg" into "Image%20(2).jpg" which servers require.
    // We preserve the hash #toolbar=0 for PDFs.
    const urlParts = rawUrl.split('#');
    const fullFileUrl = encodeURI(urlParts[0]) + (urlParts[1] ? `#${urlParts[1]}` : '');

    // Logic to determine file type
    const isImage = file.contentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName);
    const isPdf = file.contentType === 'application/pdf' || /\.pdf$/i.test(file.fileName);

    const renderContent = () => {
        if (isImage) {
            return (
                <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg overflow-hidden">
                    <img 
                        src={fullFileUrl} 
                        alt={file.fileName} 
                        className="max-w-full max-h-full object-contain shadow-sm"
                        onError={(e) => {
                            e.target.style.display = 'none'; // Hide broken image icon
                            console.error("Failed to load image at:", fullFileUrl);
                        }}
                    />
                </div>
            );
        }

        if (isPdf) {
            return (
                <iframe
                    src={`${fullFileUrl}#toolbar=0`} 
                    title={file.fileName}
                    className="w-full h-full rounded-lg bg-slate-50 border border-slate-200"
                />
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {file.contentType?.includes('sheet') ? (
                        <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
                    ) : (
                        <FileText className="w-10 h-10 text-slate-400" />
                    )}
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">Preview not available</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">
                        This file type ({file.fileType}) cannot be previewed directly.
                    </p>
                </div>
                <Button 
                    onClick={() => window.open(fullFileUrl, '_blank')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                    <Download className="w-4 h-4" /> Download to View
                </Button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            {isImage ? <ImageIcon className="w-5 h-5 text-purple-500" /> : 
                             isPdf ? <FileText className="w-5 h-5 text-red-500" /> : 
                             <FileText className="w-5 h-5 text-slate-500" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate pr-4" title={file.fileName}>
                                {file.fileName}
                            </h3>
                            <span className="text-xs text-slate-500">
                                {file.fileType} • {(file.size / 1024).toFixed(1)} KB
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="hidden sm:flex gap-2 text-slate-700"
                            onClick={() => window.open(fullFileUrl, '_blank')}
                        >
                            <ExternalLink className="w-4 h-4" /> Open Original
                        </Button>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-hidden bg-slate-50/50 relative">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
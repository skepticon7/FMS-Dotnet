// src/components/DeleteConfirmationModal.jsx
import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, folderName, loading }) => {
    const [note, setNote] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        onConfirm(note);
        setNote(""); // Reset after submit
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 p-6 scale-100 transition-transform">
                
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">Delete Folder</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Are you sure you want to delete <span className="font-semibold text-gray-800">"{folderName}"</span>? 
                            This action will move the folder and its files to the trash.
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Input Section */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for deletion (Optional)
                    </label>
                    <Input 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g., Duplicate folder, Requested by patient..."
                        className="w-full text-sm py-2"
                    />
                </div>

                {/* Footer Buttons */}
                <div className="mt-8 flex justify-end gap-3">
                    <Button 
                        variant="outline" 
                        onClick={onClose}
                        disabled={loading}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    >
                        {loading ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        {loading ? "Deleting..." : "Delete Folder"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
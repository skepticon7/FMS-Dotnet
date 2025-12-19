import React, { useEffect } from "react";
import {X} from "lucide-react";

function MyModal({ isOpen, onClose, children , isExporting = false , loading}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 duration-200 transition-all">
            <div className={`${loading ? '' : 'bg-white'} rounded-lg shadow-lg relative`}>
                <button
                    disabled={isExporting}
                    onClick={onClose}
                    className={`absolute top-5 right-5 text-gray-500 duration-200 transition-all ${isExporting ? 'cursor-not-allowed' : 'cursor-pointer hover:text-black' } `}
                >
                    <X />
                </button>
                {children}
            </div>
        </div>
    );
}

export default MyModal;

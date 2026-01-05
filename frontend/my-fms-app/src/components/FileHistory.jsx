import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    FileText, 
    User, 
    ChevronLeft, 
    ChevronRight,
    AlertCircle 
} from 'lucide-react';
import { getFileHistory } from '../services/api'; // <--- Import from your main api.js

const FileHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [hasMore, setHasMore] = useState(true);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionColor = (action) => {
        switch (action) {
            case 0: return 'bg-green-100 text-green-700'; // Created
            case 1: return 'bg-blue-100 text-blue-700';   // Updated
            case 2: return 'bg-red-100 text-red-700';     // Deleted
            case 3: return 'bg-yellow-100 text-yellow-700'; // Restored
            case 4: return 'bg-purple-100 text-purple-700'; // Downloaded
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getActionLabel = (action) => {
        const labels = ["Created", "Updated", "Deleted", "Restored", "Downloaded"];
        return labels[action] || "Unknown";
    };

    useEffect(() => {
        const loadHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                // Call the API function directly
                const response = await getFileHistory(page, pageSize);
                const data = response.data; // Access .data from the axios response
                
                setHistory(data);
                
                if (data.length < pageSize) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load history data.");
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [page]); 

    return (
        <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <div className="p-3 bg-main-green/10 rounded-lg">
                    <Clock className="w-6 h-6 text-main-green" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">System Activity Log</h2>
                    <p className="text-sm text-gray-500">Track all file operations across the system</p>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5"/>
                    {error}
                </div>
            )}

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">File Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                                    </tr>
                                ))
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        No activity found.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-700">{item.fileName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(item.action)}`}>
                                                {getActionLabel(item.action)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">{item.performedBy}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(item.timestamp)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 italic">
                                            {item.notes || "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
                    <span className="text-sm text-gray-500">
                        Page <span className="font-medium text-gray-900">{page}</span>
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={!hasMore || loading}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileHistory;
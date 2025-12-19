//
// const SearchBarFilter = ({filtersOption , setFilterOptions}) => {
// }

import React, {useEffect, useMemo, useRef, useState} from "react";
import {useAuth} from "@/context/AuthContext.jsx";
import {getUserExportations} from "@/services/api.js";
import {
    ChevronLeft,
    ChevronRight, ExternalLink,
    Eye,
    HardDriveDownload,
    MapPin,
    MoreHorizontal,
    Plus,
    Calendar,
    ServerCrash, SquarePen, Wrench, DatabaseBackup
} from "lucide-react";
import {Input} from "@/components/ui/input.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
import {getInitials} from "@/Utils/getInitials.js";
import {formatLabel} from "@/Utils/formatLabel.js";
import {NewExportation} from "@/components/index.js";


const ExportRow = ({exp ,  index, exportSize}) => {


    return (
        <tr
            key={exp.id}
            className={`text-left ${index === exportSize - 1 ? 'border-none' : 'border-b border-gray-300'}`}
        >
            <td className="font-mono text-sm font-semibold py-4 px-2">{exp.id}</td>
            <td className="text-sm py-4">
                <p className='text-sm'>{exp.fileName}</p>
            </td>
            <td className="text-sm py-4 font-medium">
                <div className='flex items-center justify-start gap-2'>
                    <Calendar className='w-5 h-5 text-main-green'/>
                    <p>{exp.createdAt.split("T")[0].split("-").join("/")}</p>
                </div>
            </td>
            <td className="py-4">
                <button
                >
                    <a
                        href={exp.fileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ExternalLink className='text-main-green w-5 h-5'/>
                    </a>
                </button>
            </td>
        </tr>
    )
}



const Exports = () => {
    const {user} = useAuth();
    const role = user?.roles?.split("_")[1]
    const [loading , setLoading] = useState(false)
    const [error , setError] = useState(null)
    const [exportModal , setExportModal] = useState(false)
    const [exports , setExports] = useState([])
    const [cachedExports , setCachedExports] = useState({
        data : {},
        timestamps : {},
        maxAge : 3 * 3600 * 1000 // 3 minutes
    })
    const [filters , setFilters] = useState({
        page : 0,
        fileName : '',
        sortType : 'newest'
    })

    let filteredExports = useMemo(() => {
        return exports.filter((exp) => {
            return exp.fileName.toLowerCase().includes(filters.fileName.toLowerCase())
        }).sort((a, b) => {
            switch (filters.sortType) {
                case 'newest' :
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest' :
                    return new Date(a.createdAt) - new Date(b.createdAt);
            }
        })
    }, [filters, exports]);


    const getCacheKey = (filters) => `page_${filters.page}_${JSON.stringify(filters)}`

    const fetchExports = async () => {
        try{
            const cachedKey = getCacheKey(filters);
            const cachedData = cachedExports.data[cachedKey];
            const cachedTimestamp = cachedExports.timestamps[cachedKey];
            const now = Date.now();

            if(cachedData && cachedTimestamp && (now - cachedTimestamp < cachedExports.maxAge)){
                setExports(cachedData);
                return;
            }

            setLoading(true)

            const params = {
                page : filters.page,
                size : 5,
                role : role,
                id : user?.id
            }
            console.log(params);

            const exports = await getUserExportations(params);
            setCachedExports(prev => ({
                ...prev,
                data: {
                    ...prev.data,
                    [cachedKey] : exports.data.content
                },
                timestamps: {
                    ...prev.timestamps,
                    [cachedKey] : now
                }
            }))
            setExports(exports.data.content)
        }catch (e) {
            console.log(`error : ${e}`)
            setError(e?.response?.data?.message || "Internal server error")
        }finally {
            setLoading(false)
        }
    }

    function useDebounce(value, delay) {
        const [debounced, setDebounced] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebounced(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debounced;
    }

    const [localCode, setLocalCode] = useState(filters.fileName || "");
    const debouncedCode = useDebounce(localCode, 500);

    useEffect(() => {
        setFilters({...filters, fileName: debouncedCode});
    }, [debouncedCode]);



    useEffect(() => {
        if(!user) return
        fetchExports()
        console.log(exports)
    }, [user , filters]);

    return (
        <div className='flex flex-col items-start justify-start w-full gap-6'>
            {loading ? (
                <div className='flex items-center justify-center w-full py-30'>
                    <span className="loading loading-spinner custom-spinner loading-2xl text-main-green "></span>
                </div>
            ) : error ? (
                <div className='flex items-center flex-col justify-center w-full py-30'>
                    <ServerCrash className="w-16 h-16 text-red-600 mb-4"/>
                    <h2 className="text-2xl font-bold text-red-700 mb-2">Server Error</h2>
                    <p className="text-red-600 text-center">
                        Oops! Something went wrong on our side. Please try refreshing the page or come back later.
                    </p>
                </div>
            ) : (
                <>
                    <button
                        onClick={() => setExportModal( true)}
                        className='flex items-center gap-5 self-end justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer bg-main-green/90 hover:bg-main-green'>
                        <HardDriveDownload className='text-white'/>
                        <p className='text-md text-white font-medium'>Export Data</p>
                    </button>
                    <div className='border mb-5 border-[1px] bg-white border-gray-300 rounded-lg flex flex-col gap-5 w-full p-5'>
                        <div className='flex items-start justify-between w-full'>
                            <p className='text-2xl font-bold'> Exports</p>
                            <div className="flex gap-5">
                                <div className="flex items-center gap-2 ">
                                    <button
                                        onClick={() => setFilters({...filters , page : filters.page - 1})}
                                        disabled={filters.page === 0}
                                        className="h-10 flex items-center justify-center border border-gray-300 px-3 cursor-pointer transition-colors duration-200 bg-transparent hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-black"/>
                                    </button>

                                    <button

                                        className="h-10 w-20  flex items-center justify-center border border-gray-300 px-3 cursor-pointer transition-colors duration-200 bg-transparent hover:bg-gray-100 rounded-md"
                                    >
                                        <p className='font-semibold '>Page {filters.page}</p>
                                    </button>
                                    <button
                                        onClick={() => setFilters({...filters , page : filters.page + 1})}
                                        className="h-10 flex items-center justify-center border border-gray-300 px-3 cursor-pointer transition-colors duration-200 bg-transparent hover:bg-gray-100 rounded-md"
                                    >
                                        <ChevronRight className="w-5 h-5 text-black"/>
                                    </button>
                                </div>
                                <Input
                                    value={localCode}
                                    onChange={(e) => setLocalCode( e.target.value)}
                                    placeholder="Search file name..."
                                    className="py-5 focus:outline-none focus:ring-0 w-full"
                                />

                                <Select
                                    value={filters.sortType}
                                    onValueChange={(value) => setFilters({
                                        ...filters,
                                        sortType : value
                                    })}
                                >
                                    <SelectTrigger
                                        className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
                                        <SelectValue
                                            placeholder="Select sorting criteria"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem key={'newest'} value="newest">newest</SelectItem>
                                        <SelectItem value='oldest'>Oldest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                        {filteredExports.length === 0 ? (
                            <div className='flex flex-col items-center justify-center w-full py-30'>
                                <DatabaseBackup className="w-16 h-16 text-red-600 mb-4"/>
                                <h2 className="text-2xl font-bold text-red-700 mb-2">No Exports</h2>
                                <p className="text-red-600 text-center">
                                    Export CSV files to get started or try adjusting your filters.
                                </p>
                            </div>
                        ) : (
                            <table className='border-collapse w-full'>
                                <thead>
                                <tr className='border-b-[1px] border-gray-300 text-left'>
                                    <th className='font-bold text-sm py-3 px-2'>ID</th>
                                    <th className='font-bold text-sm'>File Name</th>
                                    <th className='font-bold text-sm'>Exportation Date</th>
                                    <th className='font-bold text-sm'>File Link</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    filteredExports.map((exp, index) => (
                                        <ExportRow
                                            exp={exp}
                                            index={index}
                                            exportSize={filteredExports.length}
                                        />
                                    ))
                                }
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        <NewExportation
            isOpen={exportModal}
            onClose={() => setExportModal(false)}
        />
        </div>
    )
}

export default Exports;
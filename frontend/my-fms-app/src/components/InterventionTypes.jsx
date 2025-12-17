import React, {useEffect, useMemo, useRef, useState} from "react";
import {useAuth} from "../context/AuthContext.jsx";
import {getInterventionTypes} from "../services/api.js";
import {
    ChevronDown,
    Eye, ListCheck,
    MoreHorizontal,
    Pin,
    Plus,
    Search,
    ServerCog,
    ServerCrash,
    SquarePen,
    UserX
} from "lucide-react";
import {formatLabel} from "../Utils/formatLabel.js";
import {NewInterventionType} from "./index.js";
import {Input} from "@/components/ui/input.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";


const SearchBarFilter = ({filterOptions , setFilterOptions}) => {

    const interventionPriority = [
        {value : "LOW" , label : "Low"},
        {value : "MEDIUM" , label: "Medium"},
        {value : "HIGH" , label : "High"},
        {value : "URGENT" , label: "Urgent"},
        {value : "CRITICAL" , label: "Critical"},
    ];

 return (
     <div
         className='flex items-start justify-center w-full gap-5 flex-col p-6 bg-white border-[1px] border-gray-300 rounded-lg'>
         <p className='text-2xl font-bold text-black'>Filters & Search</p>
         <div className='grid grid-cols-3 w-full gap-5'>
                 <Input
                     value={filterOptions.searchTerm}
                     onChange={(e) => setFilterOptions({...filterOptions, searchTerm: e.target.value})}
                     placeholder="Search Intervention Types..."
                     className="py-5 focus:outline-none focus:ring-0 w-full"
                 />
             <Select
                 value={filterOptions.priority}
                 onValueChange={(value) => setFilterOptions({
                     ...filterOptions,
                     priority : value
                 })}
             >
                 <SelectTrigger
                     className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
                     <SelectValue
                         placeholder="Select intervention priority"/>
                 </SelectTrigger>
                 <SelectContent>
                     <SelectItem key={'all'} value="all">All Priorities</SelectItem>
                     {interventionPriority.map((prio) => (
                         <SelectItem
                             key={prio.value}
                             value={prio.value}
                         >
                             <div>{prio.label}</div>
                         </SelectItem>
                     ))}
                 </SelectContent>
             </Select>


             <Select
                 value={filterOptions.sortType}
                 onValueChange={(value) => setFilterOptions({
                     ...filterOptions,
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
                     <SelectItem value="CA">Interventions Completed - Ascending</SelectItem>
                     <SelectItem value="CD">Interventions Completed - Descending</SelectItem>
                     <SelectItem value="AA">Interventions Assigned - Ascending</SelectItem>
                     <SelectItem value="AD">Interventions Assigned - Descending</SelectItem>
                 </SelectContent>
             </Select>

         </div>

     </div>
 )
}

const InterventionTypeCard = ({onView , onEdit , interventionType , role}) => {

    const [actionsDropDown , setActionsDropDown] = useState(false);
    const dropDownRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
                setActionsDropDown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const priorityStyles = {
        'Low': 'bg-green-100 text-green-800 border-green-200',
        'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'High': 'bg-orange-100 text-orange-800 border-orange-200',
        'Critical': 'bg-red-100 text-red-800 border-red-200',
        'Urgent': 'bg-pink-100 text-pink-800 border-pink-200',
    };

    return (
        <div className='p-6 bg-white border-[1px] border-gray-300 rounded-lg relative min-h-32'>
            <div className='flex flex-col gap-4 items-start justify-center '>
                <div className='flex flex-col w-full items-start gap-1 justify-start'>
                    <div className='flex items-center justify-between w-full'>
                        <p className='text-lg font-bold text-black'>{interventionType.name}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActionsDropDown(!actionsDropDown);
                            }}
                            className="cursor-pointer "
                        >
                            <MoreHorizontal className='text-black'/>
                        </button>
                    </div>
                    <p className={`border-[1px] px-1 py-1 rounded-md text-xs font-semibold ${priorityStyles[formatLabel(interventionType.interventionTypePriority)]}`}>{formatLabel(interventionType.interventionTypePriority)}</p>
                </div>
                <p className='text-gray-500 text-sm font-medium'>{interventionType.description}</p>

                <hr className='border-t-[1px] border-gray-300 w-full max-lg:text-accent-content mt-2 mb-2'/>

                <div className='grid grid-cols-2 w-full'>
                    <div className='flex flex-col items-start justify-start w-full rounded-lg'>
                        <p className='text-gray-500 text-sm'>Assigned</p>
                        <div className='flex items-center justify-start gap-2'>
                            <Pin className='w-5 h-5 text-yellow-500'/>
                            <p className='text-black text-sm font-semibold'>{interventionType.interventionsAssigned}</p>
                        </div>
                    </div>
                    <div className='flex flex-col items-start justify-start w-full rounded-lg'>
                        <p className='text-gray-500 text-sm'>Completed</p>
                        <div className='flex items-center justify-start gap-2'>
                            <ListCheck className='w-5 h-5 text-main-green'/>
                            <p className='text-black text-sm font-semibold'>{interventionType.interventionsCompleted}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                {actionsDropDown && (
                    <div
                        ref={dropDownRef}
                        className="absolute p-1 z-50 -right-12 shadow-xl top-12 min-w-50 bg-white border border-gray-300 rounded-lg flex flex-col items-start dropdown-animate-down"
                    >
                        <button
                            onClick={() => {
                                onView();
                                setActionsDropDown(false);
                            }}
                            className="flex items-center gap-5 p-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                            <Eye className="w-5 h-5 text-black"/>
                            <p className="font-medium text-sm">View Details</p>
                        </button>
                        {(role === "SUPERUSER" || role === "SUPERVISOR") && (
                            <button
                                onClick={() => {
                                    setActionsDropDown(false);
                                    onEdit();
                                }}
                                className="flex items-center gap-5 p-2 w-full hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                                <SquarePen className="w-5 h-5 text-black"/>
                                <p className="font-medium text-sm">Edit Intervention Type</p>
                            </button>
                        )}
                    </div>
                )}
            </div>

        </div>
    )
}

const InterventionTypes = () => {

    const {user} = useAuth();
    const role = user?.roles?.split("_")[1];


    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [interventionTypes, setInterventionTypes] = useState([])
    const [filterOptions, setFilterOptions] = useState({
        priority: 'all',
        searchTerm: '',
        sortType: 'newest'
    })
    const [modalState, setModalState] = useState({
        viewOnly: false,
        interventionTypeId: null,
        isEdit: false,
        isOpen: false
    })


    let filteredInterventionTypes = useMemo(() => {
        return interventionTypes.filter((type) => {
            const searchTermMatch = type.name.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
                type.description.toLowerCase().includes(filterOptions.searchTerm.toLowerCase());
            const priorityMatch = filterOptions.priority === 'all' || filterOptions.priority === type.interventionTypePriority;
            return priorityMatch && searchTermMatch
        }).sort((a, b) => {
            switch (filterOptions.sortType) {
                case 'newest' :
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest' :
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'CA' :
                    return a.interventionsCompleted - b.interventionsCompleted;
                case 'CD' :
                    return b.interventionsCompleted - a.interventionsCompleted;
                case 'AA' :
                    return a.interventionsAssigned - b.interventionsAssigned;
                case 'AD' :
                    return b.interventionsAssigned - a.interventionsAssigned;
            }
        })
    }, [interventionTypes, filterOptions]);

    const handleOpenModal = (interventionTypeId = null, viewOnly = false, isEdit = full) => {
        setModalState({
            interventionTypeId,
            viewOnly,
            isEdit,
            isOpen: true
        })
    }

    const handleCloseModal = () => {
        setModalState(prev => ({
            ...prev,
            isOpen: false
        }))
    }

    const fetchInterventionTypes = async () => {
        try {
            const response = await getInterventionTypes();
            setInterventionTypes(response.data);
        } catch (e) {
            setError(e?.response?.data?.message || 'Internal Server Error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!user || !role) return;
        fetchInterventionTypes();
    }, [role , user]);

    return (
        <div className='flex flex-col justify-start items-start w-full h-full gap-6'>
            {loading ? (
                <div className='flex items-center justify-center w-full py-30'>
                    <span className="loading loading-spinner custom-spinner loading-2xl text-main-green "></span>
                </div>
            ) : error !== null ? (
                <div className='flex items-center flex-col justify-center w-full py-30'>
                    <ServerCrash className="w-16 h-16 text-red-600 mb-4"/>
                    <h2 className="text-2xl font-bold text-red-700 mb-2">Server Error</h2>
                    <p className="text-red-600 text-center">
                        Oops! Something went wrong on our side. Please try refreshing the page or come back later.
                    </p>
                </div>
            ) : (
                <>
                    {(role === "SUPERUSER") && (
                        <button
                            onClick={() => handleOpenModal(null, false, false)}
                            className='flex items-center gap-5 self-end justify-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer bg-main-green/90 hover:bg-main-green'>
                            <Plus className='text-white'/>
                            <p className='text-md text-white font-medium'>Create Intervention Type</p>
                        </button>
                    )}
                    <SearchBarFilter
                        filterOptions={filterOptions}
                        setFilterOptions={setFilterOptions}
                    />
                    {filteredInterventionTypes.length === 0 ? (
                        <div className='flex flex-col items-center justify-center w-full py-30'>
                            <ServerCog className="w-16 h-16 text-red-600 mb-4"/>
                            <h2 className="text-2xl font-bold text-red-700 mb-2">No Intervention Types</h2>
                            <p className="text-red-600 text-center">
                                Create an Intervention type to get started or try adjusting your filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className='grid grid-cols-3 gap-5 w-full'>
                                {filteredInterventionTypes.map((type , index) => (
                                    <InterventionTypeCard
                                        key={index}
                                        interventionType={type}
                                        role={role}
                                        onView={() => handleOpenModal(type.id , true , false)}
                                        onEdit={() => handleOpenModal(type.id , false , true)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
            <NewInterventionType
                isOpen={modalState.isOpen}
                isEdit={modalState.isEdit}
                viewOnly={modalState.viewOnly}
                interventionTypeId={modalState.interventionTypeId}
                onClose={handleCloseModal}
            />
        </div>
    )
}

export default InterventionTypes;
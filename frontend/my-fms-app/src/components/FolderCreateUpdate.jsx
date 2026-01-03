import * as Yup from 'yup'
import React, { useEffect, useMemo, useState } from "react";
import {
    createFolder,
    updateFolder,   // <-- IMPORT THIS
    getFolderById,  // <-- IMPORT THIS
    getDoctors,
    getPatients
} from "../services/api.js"; 
import { MyModal } from "./index.js"; 
import { 
    FolderPlus, 
    FileText, 
    User, 
    Stethoscope, 
    ServerCrash, 
    Plus,
    Save // Icon for update
} from "lucide-react";
import { Form, Formik } from "formik";
import { toast } from "react-hot-toast"
import { Input } from "@/components/ui/input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.js";

const validationSchema = Yup.object({
    name: Yup.string().required("Folder Name is required"),
    type: Yup.string().required("Folder Type is required"),
    patientId: Yup.string().required("Patient is required"),
    doctorId: Yup.string().required("Doctor is required"),
})

// 1. Receive folderId from props
const FolderCreateUpdate = ({ isOpen, onClose, userRole, isEdit, folderId }) => {
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    
    // State to hold the folder data being edited
    const [editingFolder, setEditingFolder] = useState(null);

    // 2. Dynamic Initial Values
    const initialValues = useMemo(() => {
        if (isEdit && editingFolder) {
            return {
                name: editingFolder.name || '',
                type: editingFolder.type || '',
                // Ensure IDs are strings for the Select component
                patientId: editingFolder.patientId ? String(editingFolder.patientId) : '',
                doctorId: editingFolder.doctorId ? String(editingFolder.doctorId) : ''
            };
        }
        return {
            name: '',
            type: '',
            patientId: '',
            doctorId: ''
        };
    }, [isEdit, editingFolder]);

    // 3. Fetch Data (Lists + Folder Details if Editing)
    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) return;
            
            try {
                setIsLoadingData(true);
                setError(null);

                // Always fetch dropdown lists
                const [patientsRes, doctorsRes] = await Promise.all([
                    getPatients({ page: 1, limit: 100, name: '' }), 
                    getDoctors({ page: 1, limit: 100, name: '' })
                ]);

                setPatients(patientsRes.data.items || []);
                setDoctors(doctorsRes.data.items || []);

                // IF EDITING: Fetch the specific folder details
                if (isEdit && folderId) {
                    const folderRes = await getFolderById(folderId);
                    // Adjust based on your API response structure (e.g. res.data or res.data.item)
                    setEditingFolder(folderRes.data); 
                } else {
                    setEditingFolder(null);
                }

            } catch (e) {
                console.error("Error fetching data", e);
                setError(e);
                toast.error("Failed to load data");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [isOpen, isEdit, folderId]);

    const folderTypes = [
        { value: "Medical", label: "Medical Record" },
        { value: "Administrative", label: "Administrative" },
        { value: "LabResults", label: "Lab Results" },
        { value: "Prescriptions", label: "Prescriptions" },
    ];

    return (
        <MyModal isOpen={isOpen} onClose={onClose}>
            {loading ? (
                <div className='flex items-center justify-center w-full py-30'>
                    <span className="loading loading-spinner custom-spinner loading-2xl text-main-green "></span>
                </div>
            ) : error != null ? (
                <div className='p-10'>
                    <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-md border border-red-300 max-w-md mx-auto mt-10">
                        <ServerCrash className="w-16 h-16 text-red-600 mb-4" />
                        <h2 className="text-2xl font-bold text-red-700 mb-2">Server Error</h2>
                        <p className="text-red-600 text-center">
                            Oops! Something went wrong. Please try again later.
                        </p>
                    </div>
                </div>
            ) : (
                <div className='flex flex-col gap-5 p-5 justify-center items-start w-[800px]'>
                    <div className='flex flex-col items-start justify-center '>
                        <h2 className="text-lg font-semibold flex gap-2 items-center justify-start">
                            <FolderPlus className='text-main-green' />
                            {/* Dynamic Title */}
                            <p className='font-semibold'>{isEdit ? "Update Folder" : "Create New Folder"}</p>
                        </h2>
                        <p className='text-gray-400 font-regular text-sm'>
                            {isEdit ? "Update folder details and associations." : "Create a digital folder to organize documents."}
                        </p>
                    </div>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        enableReinitialize={true} // <--- CRITICAL: Allows form to update after data fetch
                        validateOnMount={true}
                        onSubmit={async (values, { setSubmitting }) => {
                            setSubmitting(true);
                            try {
                                if (isEdit) {
                                    // 4. Update Logic
                                    await updateFolder(folderId, values);
                                    toast.success("Folder updated successfully");
                                } else {
                                    // Create Logic
                                    await createFolder(values);
                                    toast.success("Folder created successfully");
                                }
                                onClose();
                            } catch (e) {
                                console.log("error :" + e);
                                toast.error(e?.response?.data?.message || "Internal Server Error");
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isValid, isSubmitting, values, setFieldValue }) => (
                            <Form className='space-y-4 max-h-[70vh] overflow-y-auto pr-2 w-full'>
                                
                                {/* ... [Field Sections: Same as before] ... */}
                                {/* Folder Details Section */}
                                <div className='w-full rounded-lg p-5 border-[1px] border-gray-200'>
                                    <h3 className='mb-5 font-semibold text-lg flex items-center gap-2'>
                                        <p>Folder Details</p>
                                    </h3>
                                    <div className='flex flex-col gap-5 mt-6'>
                                        <div className='flex flex-col gap-2'>
                                            <div className='flex gap-1 items-center justify-start'>
                                                <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                </div>
                                                <label className="text-sm font-medium">Folder Name</label>
                                            </div>
                                            <Input
                                                value={values.name}
                                                onChange={(e) => setFieldValue('name', e.target.value)}
                                                name="name"
                                                type='text'
                                                placeholder='e.g., Cardiology Report 2026'
                                                className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'
                                            />
                                        </div>

                                        <div className='flex flex-col gap-2'>
                                            <div className='flex gap-1 items-center justify-start'>
                                                <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                                <label className="text-sm font-medium">Type</label>
                                            </div>
                                            <Select
                                                value={values.type}
                                                onValueChange={(value) => setFieldValue('type', value)}
                                            >
                                                <SelectTrigger className='w-full py-2 rounded-md hover:bg-gray-50 transition-colors duration-200'>
                                                    <SelectValue placeholder="Select folder type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {folderTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-gray-500"/>
                                                                {type.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Associations Section (Patient/Doctor) */}
                                <div className='w-full rounded-lg p-5 border-[1px] border-gray-200'>
                                    <h3 className='mb-5 font-semibold text-lg flex items-center gap-2'>
                                        <p>Associations</p>
                                    </h3>
                                    <div className='flex flex-col gap-5 mt-6'>
                                        <div className='flex flex-col gap-2'>
                                            <div className='flex gap-1 items-center justify-start'>
                                                <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                                </div>
                                                <label className="text-sm font-medium">Patient</label>
                                            </div>
                                            <Select
                                                disabled={isLoadingData}
                                                value={values.patientId}
                                                onValueChange={(value) => setFieldValue('patientId', value)}
                                            >
                                                <SelectTrigger className='w-full py-2 rounded-md hover:bg-gray-50 transition-colors duration-200'>
                                                    <SelectValue placeholder={isLoadingData ? "Loading..." : "Assign a Patient"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {patients.map((p) => (
                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <User className="w-4 h-4 text-gray-500"/>
                                                                {p.firstName} {p.lastName}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className='flex flex-col gap-2'>
                                            <div className='flex gap-1 items-center justify-start'>
                                                <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                                </div>
                                                <label className="text-sm font-medium">Doctor</label>
                                            </div>
                                            <Select
                                                disabled={isLoadingData}
                                                value={values.doctorId}
                                                onValueChange={(value) => setFieldValue('doctorId', value)}
                                            >
                                                <SelectTrigger className='w-full py-2 rounded-md hover:bg-gray-50 transition-colors duration-200'>
                                                    <SelectValue placeholder={isLoadingData ? "Loading..." : "Assign a Doctor"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {doctors.map((d) => (
                                                        <SelectItem key={d.id} value={d.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <Stethoscope className="w-4 h-4 text-gray-500"/>
                                                                Dr. {d.firstName} {d.lastName}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div className="flex justify-end gap-3 items-center mt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className='text-black text-sm rounded-md bg-transparent duration-200 transition-all border-[1px] border-gray-300 hover:bg-gray-200 px-4 py-2 cursor-pointer'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!isValid || isSubmitting || isLoadingData}
                                        className={`flex gap-2 items-center justify-center text-sm px-4 py-2 rounded-md transition-all duration-200
                                          ${(!isValid || isSubmitting || isLoadingData)
                                                ? 'bg-main-green/60 text-white cursor-not-allowed'
                                                : 'bg-main-green/90 hover:bg-main-green text-white cursor-pointer'}`}
                                    >
                                        {isEdit ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        {isSubmitting 
                                            ? (isEdit ? 'Updating...' : 'Creating...') 
                                            : (isEdit ? 'Save Changes' : 'Create Folder')}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            )}
        </MyModal>
    )
}

export default FolderCreateUpdate;
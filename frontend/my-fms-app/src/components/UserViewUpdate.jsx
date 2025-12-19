import * as Yup from 'yup'
import React, {useEffect, useMemo, useState} from "react";
import {
    getSuperuser,
    getSupervisor,
    getTechnician,
    saveTechnican, updateSuperuser,
    updateSupervisor,
    updateTechnician
} from "../services/api.js";
import {MyModal} from "./index.js";
import {useAuth} from "../context/AuthContext.jsx";
import {BriefcaseIcon, ChevronDownIcon, Eye, EyeOff, Info, Plus, ServerCrash, Settings, SquarePen} from "lucide-react";
import {Field, Form, Formik} from "formik";
import {toast} from "react-hot-toast"
import {format, formatDate} from "date-fns";
import PasswordConfirmationModal from "../shared/PasswordConfirmationModal.jsx";
import {Input} from "@/components/ui/input.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.js";
import {Calendar} from '@/components/ui/calendar.js'
import {Button} from "@/components/ui/button.js";
const validationSchema = Yup.object({
    firstName : Yup.string().required("Required"),
    lastName : Yup.string().required("Required"),
    email : Yup.string().email("Invalid email").required("Required")
        .matches(/@vivoenergy\.com$/, 'Email must be a vivoenergy.com domain'),
    phoneNumber : Yup.string().required("Required").matches(
        /^(?:\+212|0)([5-7]\d{8})$/,
        "Invalid phone number"
    ),
    password : Yup.string().min(8, "Password must be at least 6 characters").max(20 , "Password must be at max 20 characters").matches(
        /^(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\-=/\\]).{8,20}$/,
        "Password must be 8-20 characters, include at least 1 number and 1 special character"
    ),
    technicianStatus : Yup.string().required("Required"),
    hireDate : Yup.date().required("Required"),
})

const UserViewUpdate = ({isOpen , onClose , isEdit , viewOnly = false , technicianId , userRole}) => {

    const [technician , setTechnician] = useState(null);
    const [loading , setLoading] = useState(false);
    const [error , setError] = useState(null);
    const [showPasswordTech , setShowPasswordTech] = useState(false);
    const [passwordModalOpen , setPasswordModalOpen] = useState(false);
    const [formValues , setFormValues] = useState(null);
    const [open , setOpen] = useState(false);

    const {user} = useAuth();
    const role = user?.roles?.split("_")[1];

    const initialValues = useMemo(() => ({
        firstName: technician?.firstName || '',
        lastName: technician?.lastName || '',
        email: technician?.email || '',
        phoneNumber: technician?.phoneNumber || '',
        password: '',
        technicianStatus: technician?.technicianStatus || '',
        hireDate: technician?.hireDate ? format(new Date(technician.hireDate) , 'yyyy-MM-dd') : ''
    }) , [technician , user]);

    const fetchTechnician = async () => {
        try{
            console.log(userRole)
            console.log("heeeyy")
            setLoading(true);
            let res;
            console.log(userRole);
            if(userRole === "TECHNICIAN")
                res =  await getTechnician(technicianId);
            else if(userRole === "SUPERVISOR")
                res = await getSupervisor(technicianId);
            else if(userRole === "SUPERUSER")
                res = await getSuperuser(technicianId)
            setTechnician(res.data);
            console.log(res.data);
        }catch (e) {
            console.log(e);
            setError(e);
        }finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(!role || !isOpen)  {
            return;
        }
        if((isEdit || viewOnly) && technicianId)
            fetchTechnician()
        else
            setTechnician(null)
    }, [isOpen , technicianId , isEdit , role , userRole]);

    const handleUpdateTechnician = async () => {
        try{
            if(userRole === "TECHNICIAN")
                await updateTechnician(formValues , technicianId);
            else if(userRole === "SUPERVISOR")
                await updateSupervisor(formValues , technicianId);
            else if(userRole === "SUPERUSER")
                await updateSuperuser(formValues , technicianId)
            toast.success("updates saved successfully");
            onClose();
        }catch (e) {
            console.log(e);
            toast.error(e.response?.data?.message || "Internal Server Error");
        }
    }

    const technicianStatus = [
        {value : "AVAILABLE" , label : "Available"},
        {value : "BUSY" , label: "Busy"},
        {value : "ON_LEAVE" , label : "On Leave"},
    ];

    return (
        <>
            <MyModal isOpen={isOpen} onClose={onClose}>
                {loading ?
                    (
                        <div className='flex items-center justify-center w-full py-30'>
                            <span className="loading loading-spinner custom-spinner loading-2xl text-main-green "></span>
                        </div>
                    ) : (error != null ? (
                        <div className='p-10'>
                            <div
                                className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-md border border-red-300 max-w-md mx-auto mt-10">
                                <ServerCrash className="w-16 h-16 text-red-600 mb-4"/>
                                <h2 className="text-2xl font-bold text-red-700 mb-2">Server Error</h2>
                                <p className="text-red-600 text-center">
                                    Oops! Something went wrong on our side. Please try refreshing the page or come back later.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-5 p-5 justify-center items-start w-[900px]'>
                            <div className='flex flex-col items-start justify-center '>
                                <h2 className="text-lg font-semibold flex gap-2 items-center justify-start">

                                    {technicianId === user?.id ? (
                                        <>
                                            <Settings className='w-5 h-5 text-main-green'/>
                                            <p className='font-semibold'>Update Settings</p>
                                        </>
                                    ) : (
                                        <>
                                            {viewOnly ? <Eye className='text-main-green'/> : isEdit ?
                                                <SquarePen className='text-main-green'/> : <Plus className='text-main-green'/>}
                                            <p className='font-semibold'>{viewOnly ? "View" : !isEdit ? "Create" : "Update "} {userRole === "TECHNICIAN" && 'Technician '} {userRole === "SUPERVISOR" && 'Supervisor'} </p>
                                        </>
                                    )}

                                </h2>
                                {technicianId === user?.id ? (
                                    <>
                                        <p className='text-gray-400 font-regular text-sm'>
                                           Update your overall account settings
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className='text-gray-400 font-regular text-sm'>
                                            {viewOnly ? "View " : !isEdit ? "Create " : "Update "}
                                            {userRole === "TECHNICIAN" && 'Technician'} {userRole === "SUPERVISOR" && 'Supervisor '}
                                            to manage and oversee operations at Vivo Energy locations
                                        </p>
                                    </>
                                )}

                            </div>
                            <Formik
                                key={technician?.id || 'create'}
                                initialValues={initialValues}
                                enableReinitialize={true}
                                validationSchema={!viewOnly ? validationSchema : null}
                                validateOnMount={!viewOnly}
                                onSubmit={async (values , {setSubmitting}) => {
                                    setSubmitting(true);
                                    try {
                                        if(isEdit){
                                            setFormValues(values);
                                            setPasswordModalOpen(true);
                                        }else {
                                            if(userRole === 'patient'){
                                                await savePatient(values);
                                            }else if(userRole === 'doctor'){
                                                await saveDoctor(values);
                                            }else {
                                                throw new Error('invalid error');
                                            }
                                            toast.success("updates saved successfully");
                                            onClose();
                                        }
                                    }catch (e) {
                                        console.log("error :" + e);
                                        toast.error(e?.response?.data?.message || "Internal Server Error");
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                {({isValid , isSubmitting , values , setFieldValue}) => (
                                    <Form className='space-y-4 max-h-[70vh] overflow-y-auto pr-2 w-full'>
                                        <div className='flex w-full gap-5'>
                                            <div className='p-5 rounded-lg  border-[1px] border-gray-200 w-full'>
                                                <h3 className='mb-5 font-semibold text-lg flex items-center gap-2'>
                                                    <p>General Information</p>
                                                </h3>
                                                <div className='flex flex-col gap-5 mt-6'>
                                                    <div className='flex flex-col gap-2'>
                                                        <div className='flex gap-1 items-center justify-start'>
                                                            <div
                                                                className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                                                                <div
                                                                    className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                            </div>
                                                            <label className="text-sm font-medium">First Name</label>
                                                        </div>
                                                        <Input
                                                            value={values.firstName}
                                                            onChange={(e) => setFieldValue('firstName', e.target.value)}
                                                            disabled={viewOnly} name="firstName" as="input" type='text'
                                                            placeholder='Enter the first name'
                                                            className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        <div className='flex gap-1 items-center justify-start'>
                                                            <div
                                                                className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
                                                                <div
                                                                    className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                            </div>
                                                            <label className="text-sm font-medium">Last Name</label>
                                                        </div>
                                                        <Input value={values.lastName} onChange={(e) => setFieldValue('lastName' , e.target.value)} disabled={viewOnly} name="lastName" as="input"
                                                               type='text'
                                                               placeholder='Enter the last name'
                                                               className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                                    </div>

                                                    {!viewOnly && (
                                                        <div className='relative flex flex-col gap-2'>
                                                            <div className='flex gap-1 items-center justify-start'>
                                                                <div
                                                                    className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                                                    <div
                                                                        className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                </div>
                                                                <label className="text-sm font-medium">Password</label>
                                                            </div>
                                                            <Input  onChange={(e) => setFieldValue('password' , e.target.value)} disabled={viewOnly} name="password" as="input"
                                                                   type={showPasswordTech ? 'text' : 'password'}
                                                                   placeholder='Enter the password'
                                                                   className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPasswordTech(!showPasswordTech)}
                                                                className='absolute right-3 top-9 text-gray-500 cursor-pointer'
                                                            >
                                                                {!showPasswordTech ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 stroke-[1.5]" />}
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className='flex flex-col gap-2'>
                                                        <div className='flex gap-1 items-center justify-start'>
                                                            <div
                                                                className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                                                                <div
                                                                    className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                                            </div>
                                                            <label className="text-sm font-medium">Phone Number</label>
                                                        </div>
                                                        <Input
                                                            value={values.phoneNumber}
                                                            onChange={(e) => setFieldValue('phoneNumber', e.target.value)}
                                                            disabled={viewOnly} name="phoneNumber" as="input"
                                                            type='text'
                                                            placeholder='+212-6-12-34-56-78'
                                                            className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        <div className='flex gap-1 items-center justify-start'>
                                                            <div
                                                                className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                                                                <div
                                                                    className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                                            </div>
                                                            <label className="text-sm font-medium">Email</label>
                                                        </div>
                                                        <Input value={values.email} onChange={(e) => setFieldValue('email' , e.target.value)} disabled={viewOnly} name="email" as="input" type='text'
                                                               placeholder='user@vivoenergy.com'
                                                               className='pl-3 text-sm py-3 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='w-full rounded-lg p-5 border-[1px] border-gray-200'>
                                                <h3 className='mb-5 font-semibold text-lg flex items-center gap-2'>
                                                    <p>Status & Employment</p>
                                                </h3>
                                                <div className='flex flex-col gap-5 mt-6'>
                                                    <div className='flex flex-col gap-2'>
                                                        <div className='flex gap-1 items-center justify-start'>
                                                            <div
                                                                className="w-4 h-4 bg-pink-100 rounded flex items-center justify-center">
                                                                <div
                                                                    className="w-2 h-2 bg-pink-600 rounded-full"></div>
                                                            </div>
                                                            <label className="text-sm font-medium">Hiring Date</label>
                                                        </div>
                                                        <Popover  open={open} onOpenChange={setOpen}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    disabled={viewOnly}
                                                                    variant="outline"
                                                                    id="date"
                                                                    className="justify-between rounded-md shadow-none font-normal hover:bg-gray-50"
                                                                >
                                                                    {values.hireDate
                                                                        ? values.hireDate
                                                                        : "Select hiring date"}
                                                                    <ChevronDownIcon/>
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="overflow-hidden p-0"
                                                                            align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={values.hireDate}
                                                                    disabled={viewOnly}
                                                                    captionLayout="dropdown"
                                                                    onSelect={(date) => {
                                                                        setFieldValue("hireDate", formatDate(date, "yyyy-MM-dd"))
                                                                        setOpen(false)
                                                                    }}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>

                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        <div className='flex gap-1 items-center justify-start'>
                                                            <div
                                                                className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                                                                <div
                                                                    className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                            </div>
                                                            <label className="text-sm font-medium">Technician Status</label>
                                                        </div>
                                                        <Select
                                                            disabled={viewOnly}
                                                            value={values.technicianStatus}
                                                            onValueChange={(value) => setFieldValue('technicianStatus' , value)}
                                                        >
                                                            <SelectTrigger
                                                                className='w-full py-2  rounded-md hover:bg-gray-50 transition-colors duration-200'>
                                                                <SelectValue
                                                                    placeholder="Select technician status"/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {technicianStatus.map((status) => (
                                                                    <SelectItem
                                                                        key={status.value}
                                                                        value={status.value}
                                                                    >
                                                                        <div>{status.label}</div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 items-center mt-6">

                                            {viewOnly ? (
                                                <button
                                                    onClick={onClose}
                                                    className='text-black text-sm rounded-md bg-main-green/90 hover:bg-main-green text-white px-4 py-2 cursor-pointer'
                                                >
                                                    Close
                                                </button>
                                            ) : (
                                                <>
                                                    <p className='text-gray-500 text-sm'>Please fill in all required
                                                        fields</p>
                                                    <button
                                                        onClick={onClose}
                                                        className='text-black text-sm rounded-md bg-transparent duration-200 transition-all border-[1px] border-gray-300 hover:bg-gray-200 px-4 py-2 cursor-pointer'
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={!isValid || isSubmitting}
                                                        className={`flex gap-5 items-center justify-center text-sm px-4 py-2 rounded-md transition-all duration-200
                          ${(!isValid || isSubmitting)
                                                            ? 'bg-main-green/60 text-white cursor-not-allowed'
                                                            : 'bg-main-green/90 hover:bg-main-green text-white cursor-pointer'}`}
                                                    >
                                                        <Plus/>
                                                        {isEdit ? (isSubmitting ? 'Updating Technician...' : 'Update Technician') : (isSubmitting ? 'Creating Technician...' : 'Create Technician')}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    ))}
            </MyModal>
            <PasswordConfirmationModal onSuccess={handleUpdateTechnician} isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)}/>
        </>
    )
}

export default UserViewUpdate;
import * as Yup from 'yup'
import React, {useEffect, useMemo, useState} from "react";
import {
    getDoctorById, getManagerById,
    getPatientById,
    getSuperuser,
    getSupervisor,
    getTechnician, saveDoctor, savePatient,
    saveTechnican, updateDoctorById, updateManagerById, updatePatientById, updateSuperuser,
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
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),

    email: Yup.string()
        .email("Invalid email")
        .required("Required"),

    phoneNumber: Yup.string()
        .required("Required")
        .matches(
            /^(?:\+212|0)([5-7]\d{8})$/,
            "Invalid phone number"
        ),
    officeNo : Yup.string().required("Required"),
    password: Yup.string(),
    gender: Yup.string().required("Required"),
    birthDate: Yup.date().required("Required"),
});



const ManagerViewUpdate = ({isOpen , onClose , managerId}) => {
    const [passwordModalOpen,setPasswordModalOpen] = useState(false);
    const [manager , setManager] = useState(null);
    const [loading , setLoading] = useState(false);
    const [error , setError] = useState(null);
    const [showPasswordManager , setShowPasswordManager] = useState(false);
    const [formValues , setFormValues] = useState(null);
    const [open , setOpen] = useState(false);

    const {user} = useAuth();
    const role = user?.role;


    const genders = [
        {value : "Male" , label: "Male"},
        {value : "Female" , label: "Female"}
    ]

    const bloodTypesMap = {
        'A_POSITIVE' : 'A+' ,
        'A_NEGATIVE' : 'A-' ,
        'B_POSITIVE' : 'B+' ,
        'B_NEGATIVE' : 'B-' ,
        'AB_POSITIVE' : 'AB+' ,
        'AB_NEGATIVE' : 'AB-' ,
        'O_POSITIVE' : 'O+',
        'O_NEGATIVE' : 'O-'
    }


    const initialValues = useMemo(() => ({
        firstName: manager?.firstName || '',
        lastName: manager?.lastName || '',
        email: manager?.email || '',
        gender : manager?.gender || '',
        password : '',
        phoneNumber: manager?.phoneNumber || '',
        officeNo : manager?.officeNo || '',
        birthDate: manager?.birthDate ? format(new Date(manager.birthDate) , 'yyyy-MM-dd') : null
    }) , [manager , user])


    const fetchManager = async () => {
        try{
            setLoading(true);
            let res = await getManagerById(user?.id);
            setManager(res.data);
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
        if(user?.id)
            fetchManager().then(_ => {
                console.log("fetchPatientOrDoctor");
            });
        else
            setManager(null)
    }, [isOpen , user]);


    const handleUpdateManager = async () => {
        try{
            await updateManagerById(user?.id , formValues);
            toast.success("updates saved successfully");
            onClose();
        }catch (e) {
            console.log(e);
            toast.error(e.response?.data?.message || "Internal Server Error");
        }
    }



    return (
        <>
            <MyModal isOpen={isOpen} onClose={onClose} loading={loading}>
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
                                    <Settings className='w-5 h-5 text-main-green'/>
                                    <p className='font-semibold'>Update Settings</p>
                                </h2>
                                <p className='text-gray-400 font-regular text-sm'>
                                        Update your overall account settings
                                </p>
                            </div>
                            <Formik
                                initialValues={initialValues}
                                enableReinitialize={true}
                                validationSchema={validationSchema}
                                validateOnMount={true}
                                onSubmit={async (values , {setSubmitting}) => {
                                    setSubmitting(true);
                                    try {
                                            setFormValues(values);
                                            setPasswordModalOpen(true);
                                    }catch (e) {
                                        console.log("error :" + e);
                                        toast.error( "Internal Server Error");
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                {({isValid , isSubmitting, errors , values , dirty , setFieldValue}) => {
                                    useEffect(() => {
                                        console.log("errors : " , errors)
                                    } , [errors])
                                    return (
                                        <Form className='space-y-4 max-h-[70vh] overflow-y-auto pr-2 w-full'>
                                            <div className='flex w-full gap-5'>
                                                <div className='p-5 rounded-lg  border-[1px] border-gray-200 w-full'>
                                                    <h3 className='mb-5 font-semibold text-lg flex items-center gap-2'>
                                                        <p>General Information</p>
                                                    </h3>
                                                    <div className='flex flex-col gap-5 mt-6'>
                                                        <div className='flex items-center justify-center gap-5'>
                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">First
                                                                        Name</label>
                                                                </div>
                                                                <Input
                                                                    value={values.firstName}
                                                                    onChange={(e) => setFieldValue('firstName', e.target.value)}
                                                                    name="firstName" as="input" type='text'
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
                                                                    <label className="text-sm font-medium">Last
                                                                        Name</label>
                                                                </div>
                                                                <Input value={values.lastName}
                                                                       onChange={(e) => setFieldValue('lastName', e.target.value)}
                                                                       name="lastName" as="input"
                                                                       type='text'
                                                                       placeholder='Enter the last name'
                                                                       className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                                            </div>
                                                        </div>

                                                        <div className='flex flex-col gap-2'>
                                                            <div className='flex gap-1 items-center justify-start'>
                                                                <div
                                                                    className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                                                                    <div
                                                                        className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                                                </div>
                                                                <label
                                                                    className="text-sm font-medium">Gender</label>
                                                            </div>
                                                            <Select
                                                                value={values.gender}
                                                                onValueChange={(value) => setFieldValue('gender', value)}
                                                            >
                                                                <SelectTrigger
                                                                    className='w-full py-2  rounded-md hover:bg-gray-50 transition-colors duration-200'>
                                                                    <SelectValue
                                                                        placeholder="Select Gender"/>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {genders.map((gender) => (
                                                                        <SelectItem
                                                                            key={gender.value}
                                                                            value={gender.value}
                                                                        >
                                                                            <div>{gender.label}</div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className='flex flex-col gap-2'>
                                                            <div className='flex gap-1 items-center justify-start'>
                                                                <div
                                                                    className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                                                    <div
                                                                        className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                </div>
                                                                <label className="text-sm font-medium">Email</label>
                                                            </div>
                                                            <Input value={values.email}
                                                                   onChange={(e) => setFieldValue('email', e.target.value)}
                                                                    name="email" as="input"
                                                                   type='text'
                                                                   placeholder='Enter email'
                                                                   className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                                        </div>

                                                            <div className='relative flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">Password</label>
                                                                </div>
                                                                <Input
                                                                    onChange={(e) => setFieldValue('password', e.target.value)}
                                                                    name="password" as="input"
                                                                    type={showPasswordManager ? 'text' : 'password'}
                                                                    placeholder='Enter the password'
                                                                    className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPasswordManager(!showPasswordManager)}
                                                                    className='absolute right-3 top-9 text-gray-500 cursor-pointer'
                                                                >
                                                                    {!showPasswordManager ? <Eye className="w-5 h-5"/> :
                                                                        <EyeOff className="w-5 h-5 stroke-[1.5]"/>}
                                                                </button>
                                                            </div>


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
                                                                name="phoneNumber" as="input"
                                                                type='text'
                                                                placeholder='+212-6-12-34-56-78'
                                                                className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                                        </div>
                                                        <div className='flex flex-col gap-2'>
                                                            <div className='flex gap-1 items-center justify-start'>
                                                                <div
                                                                    className="w-4 h-4 bg-pink-100 rounded flex items-center justify-center">
                                                                    <div
                                                                        className="w-2 h-2 bg-pink-600 rounded-full"></div>
                                                                </div>
                                                                <label className="text-sm font-medium">Birth Date</label>
                                                            </div>
                                                            <Popover open={open} onOpenChange={setOpen}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        id="date"
                                                                        className="justify-between rounded-md shadow-none font-normal hover:bg-gray-50"
                                                                    >
                                                                        {values.birthDate
                                                                            ? values.birthDate
                                                                            : "Select birth date"}
                                                                        <ChevronDownIcon/>
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="overflow-hidden p-0"
                                                                                align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={values.birthDate}
                                                                        captionLayout="dropdown"
                                                                        onSelect={(date) => {
                                                                            setFieldValue("birthDate", formatDate(date , 'yyyy-MM-dd'))
                                                                            setOpen(false)
                                                                        }}
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>

                                                        </div>

                                                    </div>
                                                </div>
                                                <div className='w-full rounded-lg p-5 border-[1px] border-gray-200'>
                                                    <h3 className='mb-5 font-semibold text-lg flex items-center gap-2'>
                                                        {'Professional Details'}
                                                    </h3>
                                                    <div className='flex flex-col gap-5 mt-6'>

                                                        <div className='flex flex-col gap-2'>
                                                            <div className='flex gap-1 items-center justify-start'>
                                                                <div
                                                                    className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
                                                                    <div
                                                                        className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                                </div>
                                                                <label className="text-sm font-medium">Office Number</label>
                                                            </div>
                                                            <Input value={values.officeNo}
                                                                   onChange={(e) => setFieldValue('officeNo', e.target.value)}
                                                                   name="officeNo" as="input"
                                                                   type='text'
                                                                   placeholder='Enter Office Number'
                                                                   className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3 items-center mt-6">
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
                                                    disabled={
                                                        !isValid ||
                                                        isSubmitting ||
                                                        !dirty
                                                    }
                                                    className={`flex gap-2 items-center justify-center text-sm px-4 py-2 rounded-md transition-all duration-200
                          ${(!isValid || isSubmitting || !dirty)
                                                        ? 'bg-main-green/60 text-white cursor-not-allowed'
                                                        : 'bg-main-green/90 hover:bg-main-green text-white cursor-pointer'}`}
                                                >
                                                    <Plus/>
                                                    {isSubmitting ? `Updating...` : `Update`}
                                                </button>
                                            </div>
                                        </Form>
                                    )
                                }}
                            </Formik>
                        </div>
                    ))}
            </MyModal>
            <PasswordConfirmationModal onSuccess={handleUpdateManager} isOpen={passwordModalOpen}
                                       onClose={() => setPasswordModalOpen(false)}/>

        </>
    )
}

export default ManagerViewUpdate;
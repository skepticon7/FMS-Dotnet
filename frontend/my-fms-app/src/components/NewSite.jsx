import React, {useEffect, useMemo, useState} from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {MyModal} from "./index.js";
import {Calendar, Eye, Info, Plus, ServerCrash, SquarePen} from "lucide-react";
import {
    getInterventionCreationData,
    getSite,
    getSites,
    saveIntervention,
    saveSite,
    updateSite
} from "../services/api.js";
import {toast} from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";
import {useMenu} from "@chakra-ui/react";
import {Input} from "@/components/ui/input.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";

const validationSchema = Yup.object({
    siteName: Yup.string().required("Required"),
    siteCode : Yup.string().required("Required"),
    siteAdresse: Yup.string().required("Required"),
    siteLocation : Yup.string().required("Required"),
    siteStatus: Yup.string().required("Required"),
    email : Yup.string().email().required()
        .matches(/@vivoenergy\.com$/, 'Email must be a vivoenergy.com domain'),
    phoneNumber : Yup.string().required().matches(
        /^(?:\+212|0)([5-7]\d{8})$/,
        "Invalid phone number format"
    ),
    startOperatingHour: Yup.string().matches(/^([01]\d|2[0-3]):([0-5]\d)?$/, "Invalid time format")
        .required("Required"),
    endOperatingHour: Yup.string().matches(/^([01]\d|2[0-3]):([0-5]\d)?$/, "Invalid time format")
        .required("Required")
        .test(
            "is-greater",
            "End time must be greater than start time",
            function (value) {
                const { startOperatingHour } = this.parent;
                if (!startOperatingHour || !value) return true;
                const startTime = new Date(`1970-01-01T${startOperatingHour}`);
                const endTime = new Date(`1970-01-01T${value}`);
                return endTime > startTime;
            }
        ),
});

const NewSite = ({ isOpen, onClose , isEdit ,  siteId ,  viewOnly = false , role}) => {
    const {user} = useAuth();
    const [loading , setLoading] = useState(false);
    const [site , setSite] = useState(null);
    const [err , setError] = useState(null)
    const navigate = useNavigate();



    const initialValues = useMemo(() => ({
        siteCode : site?.siteCode || "",
            siteName: site?.siteName || "",
            siteAdresse: site?.siteAdresse || "",
            siteLocation : site?.siteLocation || "",
            siteStatus: site?.siteStatus || "",
            startOperatingHour: site?.startOperatingHour || "",
            endOperatingHour: site?.endOperatingHour || "",
            email: site?.email || "",
            phoneNumber : site?.phoneNumber || "",
    }) , [site]);

    const fetchSite = async () => {
        getSite(siteId).then((res) => {
            setLoading(true);
            setSite(res.data);
            if (res.data.startOperatingHour && res.data.startOperatingHour.length > 5) {
                res.data.startOperatingHour = res.data.startOperatingHour.substring(0, 5);
            }
            if (res.data.endOperatingHour && res.data.endOperatingHour.length > 5) {
                res.data.endOperatingHour = res.data.endOperatingHour.substring(0, 5);
            }
        }).catch((err) => {
            setError(err);
            console.log(err);
        }).finally(() => setLoading(false))
    }

    useEffect(() => {
        if(!isOpen || !role) return;
        if((isEdit || viewOnly) && siteId) {
            fetchSite();
        } else {
            setSite(null);
        }
    } , [siteId , isEdit , isOpen , role])

    const siteStatuses = [
        {value : "ACTIVE" , label : "Active"},
        {value : "MAINTENANCE" , label: "Maintenance"},
        {value : "EMERGENCY" , label : "Emergency"},
        {value : "INACTIVE" , label: "Inactive"}
    ];

    return (
        <MyModal isOpen={isOpen} onClose={onClose} >
            {loading ?
                <div className='p-10'>
                    ...Loading
                </div>
                : (
                    err != null ? (
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

                    ) :
                        (
                            <div className='flex flex-col gap-5 p-5 justify-center items-start w-[900px]'>
                                <div className='flex flex-col gap-0'>
                                    <h2 className="text-lg font-semibold flex gap-2 items-center justify-start">
                                        {viewOnly ? <Eye className='text-main-green'/> : isEdit ? <SquarePen className='text-main-green'/> : <Plus className='text-main-green'/>}
                                        <p className='font-semibold'>{viewOnly ? "View Site" : !isEdit ? "Create New Site" : "Update Site"}</p>
                                    </h2>
                                    <p className='text-gray-400 text-sm'>{viewOnly ? "View" : !isEdit ? "Create a new" : "Update"} site for technicians to operate and manage interventions at Vivo Energy locations
                                    </p>
                                </div>
                                <Formik
                                    key={site?.id || 'create'}
                                    initialValues={initialValues}
                                    enableReinitialize={true}
                                    validationSchema={viewOnly ? null : validationSchema}
                                    validateOnMount={!viewOnly}
                                    onSubmit={async (values, {setSubmitting}) => {
                                        setSubmitting(true);
                                        try {
                                            let res;
                                            if(!isEdit)
                                                res = await saveSite(values , role , user?.id);
                                            else
                                                res = await updateSite(values , siteId);
                                            toast.success(`Site successfully ${isEdit ? 'updated' : 'created'} `)
                                            onClose();
                                        } catch (err) {
                                            console.log(`error : ${err}`)
                                            toast.error(err?.response?.data?.message || "Internal server error");
                                        } finally {

                                            setSubmitting(false);
                                        }
                                    }}
                                >
                                    {({isValid,  values  , setFieldValue ,isSubmitting}) => {
                                        console.log(values);
                                        return (
                                            <Form className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 w-full">
                                                {/* Left Section */}
                                                <div className='flex gap-5 w-full '>
                                                    <div className='p-5 rounded-lg  border-[1px] border-gray-200 w-full'>
                                                        <h3 className='mb-5 font-semibold text-lg flex items-center gap-2'>
                                                            <p>Basic Information</p>
                                                        </h3>
                                                        <div className='flex flex-col gap-5 mt-6'>
                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">Code</label>
                                                                </div>
                                                                <Input value={values.siteCode} onChange={(e) => setFieldValue('siteCode' , e.target.value)} disabled={viewOnly} name="siteCode" as="input"
                                                                       type='text'
                                                                       placeholder='Enter the code'
                                                                       className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px]  border-gray-300 rounded-md'/>
                                                            </div>
                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">Name</label>
                                                                </div>
                                                                <Input value={values.siteName} onChange={(e) => setFieldValue('siteName' , e.target.value)} disabled={viewOnly} name="siteName" as="input"
                                                                       type='text'
                                                                       placeholder='Enter the name'
                                                                       className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px]  border-gray-300 rounded-md'/>
                                                            </div>

                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-yellow-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">Adresse</label>
                                                                </div>
                                                                <Input value={values.siteAdresse} onChange={(e) => setFieldValue('siteAdresse' , e.target.value)} disabled={viewOnly} name="siteAdresse" as="input"
                                                                       type='text'
                                                                       placeholder='Enter the Adresse'
                                                                       className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px]  border-gray-300 rounded-md'/>
                                                            </div>
                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">Location</label>
                                                                </div>
                                                                <Input value={values.siteLocation} onChange={(e) => setFieldValue('siteLocation' , e.target.value)} disabled={viewOnly} name="siteLocation" as="input"
                                                                       type='text'
                                                                       placeholder='Enter the location'
                                                                       className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px]  border-gray-300 rounded-md'/>
                                                            </div>

                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-pink-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-pink-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">Email</label>
                                                                </div>
                                                                <Input value={values.email} onChange={(e) => setFieldValue('email' , e.target.value)} disabled={viewOnly} name="email" as="input"
                                                                       type='text'
                                                                       placeholder='Enter the email'
                                                                       className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                                            </div>
                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-cyan-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">Phone Number</label>
                                                                </div>
                                                                <Input value={values.phoneNumber} onChange={(e) => setFieldValue('phoneNumber' , e.target.value)} disabled={viewOnly} name="phoneNumber" as="input"
                                                                       type='text'
                                                                       placeholder='Enter the phone number'
                                                                       className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px]  border-gray-300 rounded-md'/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='w-full rounded-lg p-5 border-[1px] border-gray-200'>
                                                        <h3 className='mb-5 font-semibold text-lg flex items-center gap-2'>
                                                            <p>Operating Hours & Status</p>
                                                        </h3>
                                                        <div className='flex flex-col gap-5 mt-6'>
                                                            <div className='flex gap-5'>
                                                                <div className='w-1/2 flex flex-col gap-2'>
                                                                    <div className='flex gap-1 items-center justify-start'>
                                                                        <div
                                                                            className="w-4 h-4 bg-violet-100 rounded flex items-center justify-center">
                                                                            <div
                                                                                className="w-2 h-2 bg-violet-600 rounded-full"></div>
                                                                        </div>
                                                                        <label
                                                                            className="text-sm font-medium">Start Time</label>
                                                                    </div>
                                                                    <Input
                                                                        type="time"
                                                                        disabled={viewOnly}
                                                                        id="time-picker"
                                                                        step="60"
                                                                        defaultValue={values.startOperatingHour}
                                                                        onChange={(e) => setFieldValue("startOperatingHour", e.target.value)}
                                                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                                    />
                                                                </div>

                                                                <div className='w-1/2 flex flex-col gap-2'>
                                                                    <div className='flex gap-1 items-center justify-start'>
                                                                        <div
                                                                            className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                                                                            <div
                                                                                className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                                                        </div>
                                                                        <label
                                                                            className="text-sm font-medium">End
                                                                            Time</label>
                                                                    </div>
                                                                    <Input
                                                                        type="time"
                                                                        disabled={viewOnly}
                                                                        id="time-picker"
                                                                        step="60"
                                                                        defaultValue={values.endOperatingHour}
                                                                        onChange={(e) => setFieldValue("endOperatingHour", e.target.value)}
                                                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                                    </div>
                                                                    <label
                                                                        className="text-sm font-medium">Site Status</label>
                                                                </div>
                                                                <Select
                                                                    disabled={viewOnly}
                                                                    value={values.siteStatus}
                                                                    onValueChange={(value) => setFieldValue('siteStatus' , value)}
                                                                >
                                                                    <SelectTrigger
                                                                        className='w-full py-2  rounded-md hover:bg-gray-50 transition-colors duration-200'>
                                                                        <SelectValue
                                                                            placeholder="Select site status"/>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {siteStatuses.map((status) => (
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
                                                            <p className='text-gray-500 text-sm'>Please fill in all required fields</p>
                                                            <button
                                                                onClick={onClose}
                                                                className='text-black text-sm rounded-md bg-transparent duration-200 transition-all border-[1px] border-gray-300 hover:bg-gray-200 px-4 py-2 cursor-pointer'
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={!isValid || isSubmitting}
                                                                className={`flex gap-5 items-center h-10 justify-center text-sm px-4 py-2 rounded-md transition-all duration-200
                          ${(!isValid || isSubmitting)
                                                                    ? 'bg-main-green/60 text-white cursor-not-allowed'
                                                                    : 'bg-main-green/90 hover:bg-main-green text-white cursor-pointer'}`}
                                                            >
                                                                {(!isValid || !isSubmitting) && <Plus />}
                                                                {isEdit ? (isSubmitting ? (
                                                                    <div className="flex items-center gap-3 justify-center">
                                                                        <span className="loading loading-spinner text-white loading-sm "></span>
                                                                        <span className='font-semibold'>Updating Site...</span>
                                                                    </div>
                                                                ) : 'Update Site') : (isSubmitting ?
                                                                    (
                                                                        <div className="flex items-center gap-3 justify-center">
                                                                            <span className="loading loading-spinner text-white loading-sm "></span>
                                                                            <span className='font-semibold'>Creating Site...</span>
                                                                        </div>
                                                                    ) : 'Create Site')}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </Form>

                                        )
                                    }}
                                </Formik>
                            </div>

                ))}
        </MyModal>
    );
}

export default NewSite;

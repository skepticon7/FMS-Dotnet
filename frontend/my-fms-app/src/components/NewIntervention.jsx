import React, {useEffect, useMemo, useState} from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {MyModal} from "./index.js";
import {
    CalendarOff,
    ChevronDownIcon,
    CircleCheck,
    Clock,
    Eye,
    Info,
    Play,
    Plus,
    ServerCrash,
    Shield,
    SquarePen,
    User,
    Users
} from "lucide-react";
import {
    getInterventionById,
    getInterventionCreationData,
    saveIntervention,
    updateIntervention
} from "../services/api.js";
import {Calendar as Cal} from "lucide-react"
import {toast} from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import { Calendar } from "@/components/ui/calendar"

import {useAuth} from "../context/AuthContext.jsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.js";
import {Button} from "@/components/ui/button.js";
import {formatDate} from "date-fns";
import {Input} from "@/components/ui/input.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
import {Textarea} from "@/components/ui/textarea.js";

const validationSchema = Yup.object({
    site: Yup.number().required("Required"),
    type : Yup.string().required("Required"),
    assignedTo: Yup.number().required("Required"),
    interventionType: Yup.string().required("Required"),
    comment : Yup.string().required("Required"),
    startDate: Yup.date().required("Required"),
    startTime: Yup.string().matches(/^([01]\d|2[0-3]):([0-5]\d)?$/, "Invalid time format")
        .required("Required"),
    interventionPriority: Yup.string().required("Required"),
    interventionStatus : Yup.string().required("Required")
});

const NewIntervention = ({ isOpen, onClose , isEdit , interventionId , viewOnly = false}) => {
    const {user } = useAuth();
    const role = user?.roles;
    const [loading , setLoading] = useState(false);
    const [err , setError] = useState(null)
    const [technicians , setTechnicians] = useState([])
    const [sites , setSites] = useState([]);
    const [interventionTypes , setInterventionTypes] = useState([])
    const [intervention , setIntervention] = useState(null);
    const [open , setOpen] = useState(false);

    const initialValues = useMemo(() => ({
        type: intervention?.type || "",
        site: intervention?.site?.id?.toString() || "",
        assignedTo: role === "TECHNICIAN" ? user?.id : (intervention?.interventionAssignedTo?.id?.toString() || ""),
        interventionType: intervention?.interventionType?.id?.toString() || "",
        comment: intervention?.comment || "",
        startDate: intervention?.startDate ? intervention.startDate.split('T')[0] : "",
        startTime: intervention?.startDate ? intervention.startDate.split('T')[1].substring(0, 5) : new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        interventionPriority: intervention?.interventionPriority || "",
        interventionStatus: intervention?.interventionStatus || ""
    }), [intervention]);


    const fetchIntervention = async (interventionId) => {
        getInterventionById(interventionId).then((res) => {
            setLoading(true);
            setIntervention(res.data);
            console.log(res.data);
        }).catch((err) => {
            console.log(err);
            setError(err?.response?.data?.error || "Failed to fetch intervention data");
        }).finally(() => setLoading(false));
    }

    const fetchCreateInterventionData = async () => {

        getInterventionCreationData(role).then(({sites , interventionTypes , technicians}) => {
            setLoading(true)
            if(role === "SUPERVISOR" || role === "SUPERUSER"){
                setTechnicians(technicians);
            }
            setSites(sites);
            setInterventionTypes(interventionTypes);
        }).catch((error) => {
            setError(error?.response?.data?.error || "Failed to fetch necessary data")
        }).finally(() => setLoading(false))
    }

    useEffect(() => {
        if (!isOpen || !role) return;

        if (interventionId) {
            fetchIntervention(interventionId);
        } else {
            setIntervention(null);
        }
        fetchCreateInterventionData();
    }, [isOpen, role, interventionId, isEdit]);

    const interventionStatus = [
        {value : "SCHEDULED" , label : "Scheduled"},
        {value : "IN_PROGRESS" , label: "In Progress"},
        {value : "COMPLETED" , label : "Completed"},
        {value : "CANCELED" , label: "Canceled"}
    ];

    const interventionPriority = [
        {value : "LOW" , label : "Low"},
        {value : "MEDIUM" , label: "Medium"},
        {value : "HIGH" , label : "High"},
        {value : "URGENT" , label: "Urgent"},
        {value : "CRITICAL" , label: "Critical"},
    ];

    const types = [
        {value : "INCIDENT" , label : "Incident"},
        {value : "DEMAND" , label : "Demand"}
    ]


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
                                        <p className='font-semibold'>
                                            {viewOnly ? "View Intervention" : isEdit ? "Update Intervention" : "Create Intervention"}
                                        </p>
                                    </h2>
                                    <p className='text-gray-400 text-sm'>
                                        {viewOnly ? "View intervention details" : isEdit ? "Edit Intervention" : "Schedule a new Intervention"} for
                                        technicians at Vivo Energy sites
                                    </p>
                                </div>
                                <Formik
                                    key={intervention?.id || 'create'}
                                    enableReinitialize={true}
                                    validationSchema={viewOnly ? null : validationSchema}
                                    validateOnMount={!viewOnly}
                                    initialValues={initialValues}
                                    onSubmit={async (values, {setSubmitting}) => {
                                        setSubmitting(true);
                                        try {
                                            if(!isEdit)
                                                await saveIntervention(values, role , user?.id);
                                            else
                                                await updateIntervention(values , interventionId);
                                            toast.success(`Intervention successfully ${isEdit ? 'updated' : 'created'}`)
                                            onClose();
                                        } catch (err) {
                                            toast.error(err?.response?.data?.message || "Internal Server Error");
                                            console.log(err);
                                        } finally {
                                            setSubmitting(false);
                                        }

                                    }}
                                >
                                    {({isValid, values ,isSubmitting, setFieldValue , errors , touched}) => {
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
                                                                    <label className="text-sm font-medium">Intervention
                                                                        Type</label>
                                                                </div>
                                                                <Select
                                                                    value={values.type}
                                                                    disabled={viewOnly}
                                                                    onValueChange={(value) => setFieldValue("type", value)}>
                                                                    <SelectTrigger
                                                                        className='w-full rounded-md hover:bg-gray-50 transition-colors duration-200'
                                                                    >
                                                                        <SelectValue
                                                                            placeholder="Select type"/>
                                                                    </SelectTrigger>
                                                                    <SelectContent
                                                                        className="max-h-48 overflow-y-auto"
                                                                    >
                                                                        {types.map((type) => (
                                                                            <SelectItem key={type.value} value={type.value}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div>{type.label}</div>
                                                                                </div>
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
                                                                    <label className="text-sm font-medium">Site</label>
                                                                </div>
                                                                <Select
                                                                    disabled={viewOnly}
                                                                    value={values.site?.toString() || ""}
                                                                    onValueChange={(value) => setFieldValue("site", parseInt(value))}
                                                                >
                                                                    <SelectTrigger className="w-full rounded-md hover:bg-gray-50 transition-colors duration-200">
                                                                        <SelectValue placeholder="Select site" />
                                                                    </SelectTrigger>
                                                                    <SelectContent
                                                                        className="max-h-48 overflow-y-auto"
                                                                    >
                                                                        {sites.map((site) => (
                                                                            <SelectItem key={site.id} value={site.id.toString()}>
                                                                                <div className="flex items-center justify-between w-full">
                                                                                    <div>{site.siteName}</div>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>

                                                            </div>


                                                            {(role === "SUPERVISOR" || role === "SUPERUSER") && (
                                                                <div className='flex flex-col gap-2'>
                                                                    <div className='flex gap-1 items-center justify-start'>
                                                                        <div
                                                                            className="w-4 h-4 bg-yellow-100 rounded flex items-center justify-center">
                                                                            <div
                                                                                className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                                                                        </div>
                                                                        <label className="text-sm font-medium">Assigned
                                                                            Technician</label>
                                                                    </div>
                                                                    <Select
                                                                        disabled={viewOnly}
                                                                        value={values.assignedTo?.toString() || ""}
                                                                        onValueChange={(value) => setFieldValue("assignedTo", parseInt(value))}>
                                                                        <SelectTrigger
                                                                            className={`w-full rounded-md hover:bg-gray-50 transition-colors duration-200 `}
                                                                        >
                                                                            <SelectValue
                                                                                placeholder="Select assigned technician"/>
                                                                        </SelectTrigger>
                                                                        <SelectContent
                                                                            className="max-h-48 overflow-y-auto"
                                                                        >
                                                                            {technicians.map((tech) => (
                                                                                <SelectItem key={tech.id}
                                                                                            value={tech.id.toString()}>
                                                                                    <div
                                                                                        className="flex items-center gap-2">
                                                                                        <div>{tech.firstName} {tech.lastName}</div>
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                            )}
                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">Intervention
                                                                        Type</label>
                                                                </div>
                                                                <Select
                                                                    disabled={viewOnly}
                                                                    value={values.interventionType?.toString() || ""}
                                                                    onValueChange={(value) => setFieldValue("interventionType", parseInt(value))}>
                                                                    <SelectTrigger
                                                                        className='w-full rounded-md hover:bg-gray-50 transition-colors duration-200'
                                                                    >
                                                                        <SelectValue
                                                                            placeholder="Select intervention type"/>
                                                                    </SelectTrigger>
                                                                    <SelectContent
                                                                        className="max-h-48 overflow-y-auto"
                                                                    >
                                                                        {interventionTypes.map((type) => (
                                                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div>{type.name}</div>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>

                                                            </div>

                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-pink-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-pink-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">Comment</label>
                                                                </div>
                                                                <textarea
                                                                    disabled={viewOnly}
                                                                    value={values.comment}
                                                                    onChange={(e) => setFieldValue("comment" , e.target.value)}
                                                                    name="comment" as="textarea"
                                                                    placeholder='Enter a comment'
                                                                    className={`pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border mt-2 rounded-md 
                                                                `}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='w-full rounded-lg p-5 border-[1px] border-gray-200'>
                                                        <h3 className='mb-5 font-semibold text-lg flex items-center gap-2'>
                                                            <p>Scheduling & Priority</p>
                                                        </h3>
                                                        <div className='flex flex-col gap-5 mt-6'>
                                                            <div className='flex gap-5'>
                                                                <div className=' flex flex-col gap-2 w-1/2'>
                                                                    <div
                                                                        className='flex gap-1 items-center justify-start'>
                                                                        <div
                                                                            className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                                                                            <div
                                                                                className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                                                        </div>
                                                                        <label className="text-sm font-medium">Scheduled
                                                                            Date</label>
                                                                    </div>
                                                                    <Popover  open={open} onOpenChange={setOpen}>
                                                                        <PopoverTrigger asChild>
                                                                            <Button
                                                                                disabled={viewOnly}
                                                                                variant="outline"
                                                                                id="date"
                                                                                className="justify-between rounded-md shadow-none font-normal hover:bg-gray-50"
                                                                            >
                                                                                {values.startDate
                                                                                    ? values.startDate
                                                                                    : "Select date"}
                                                                                <ChevronDownIcon/>
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="overflow-hidden p-0"
                                                                                        align="start">
                                                                            <Calendar
                                                                                mode="single"
                                                                                selected={values.startDate}
                                                                                disabled={(date) => {
                                                                                    const isCompletedOrInProgress =
                                                                                        values.interventionStatus === "COMPLETED" ||
                                                                                        values.interventionStatus === "IN_PROGRESS";

                                                                                    if (isCompletedOrInProgress) {
                                                                                        return date > new Date();
                                                                                    }
                                                                                    return false;
                                                                                }}
                                                                                captionLayout="dropdown"
                                                                                onSelect={(date) => {
                                                                                    setFieldValue("startDate", formatDate(date, "yyyy-MM-dd"))
                                                                                    setOpen(false)
                                                                                }}
                                                                            />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </div>

                                                                <div className='flex flex-col gap-2 w-1/2'>
                                                                    <div
                                                                        className='flex gap-1 items-center justify-start'>
                                                                        <div
                                                                            className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
                                                                            <div
                                                                                className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                                        </div>
                                                                        <label className="text-sm font-medium">Scheduled
                                                                            Time</label>
                                                                    </div>
                                                                    <Input
                                                                        type="time"
                                                                        disabled={viewOnly}
                                                                        id="time-picker"
                                                                        step="60"
                                                                        defaultValue={values.startTime}
                                                                        onChange={(e) => setFieldValue("startTime", e.target.value)}
                                                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-cyan-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">Intervention
                                                                        Status</label>
                                                                </div>
                                                                <Select
                                                                    disabled={viewOnly}
                                                                    value={values.interventionStatus}
                                                                    onValueChange={(value) => setFieldValue("interventionStatus", value)}
                                                                >
                                                                    <SelectTrigger
                                                                        className='w-full rounded-md hover:bg-gray-50 transition-colors duration-200'>
                                                                        <SelectValue
                                                                            placeholder="Select intervention status"/>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {interventionStatus.map((inter) => {
                                                                            const isFutureDate = new Date(`${values.startDate}T${values.startTime}`) > new Date();
                                                                            const isCompletedOrInProgress = inter.value === "COMPLETED" || inter.value === "IN_PROGRESS";
                                                                            const isDisabled = isFutureDate && isCompletedOrInProgress;

                                                                            return (
                                                                                <SelectItem
                                                                                    key={inter.value}
                                                                                    value={inter.value}
                                                                                    disabled={isDisabled}
                                                                                    className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                                                                                >
                                                                                    <div
                                                                                        className="flex items-center gap-2">
                                                                                        {inter.value === "SCHEDULED" &&
                                                                                            <Clock
                                                                                                className="w-4 h-4"/>}
                                                                                        {inter.value === "IN_PROGRESS" &&
                                                                                            <Play className="w-4 h-4"/>}
                                                                                        {inter.value === "COMPLETED" &&
                                                                                            <CircleCheck
                                                                                                className="w-4 h-4"/>}
                                                                                        {inter.value === "CANCELED" &&
                                                                                            <CalendarOff
                                                                                                className="w-4 h-4"/>}
                                                                                        <div>
                                                                                            <div>{inter.label}</div>
                                                                                            {isDisabled && (
                                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                                    Cannot set
                                                                                                    to {inter.label.toLowerCase()} for
                                                                                                    future dates
                                                                                                </p>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </SelectItem>
                                                                            );
                                                                        })}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className='flex flex-col gap-2'>
                                                                <div className='flex gap-1 items-center justify-start'>
                                                                    <div
                                                                        className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                                                                        <div
                                                                            className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                                                    </div>
                                                                    <label className="text-sm font-medium">Intervention
                                                                        Status</label>
                                                                </div>
                                                                <Select
                                                                    disabled={viewOnly}
                                                                    value={values.interventionPriority}
                                                                    onValueChange={(value) => setFieldValue("interventionPriority", value)}>
                                                                    <SelectTrigger
                                                                        className='w-full rounded-md hover:bg-gray-50 transition-colors duration-200'
                                                                    >
                                                                        <SelectValue
                                                                            placeholder="Select intervention priority"/>
                                                                    </SelectTrigger>
                                                                    <SelectContent

                                                                    >
                                                                        {interventionPriority.map((inter) => (
                                                                            <SelectItem key={inter.value}
                                                                                        value={inter.value}>
                                                                                <div
                                                                                    className="flex items-center gap-2">
                                                                                    <div>{inter.label}</div>
                                                                                </div>
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
                                                            <p className='text-gray-500 text-sm'>Please fill in all
                                                                required
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
                                                                className={`flex gap-5 items-center h-10 justify-center text-sm px-4 py-2 rounded-md transition-all duration-200
                          ${(!isValid || isSubmitting)
                                                                    ? 'bg-main-green/60 text-white cursor-not-allowed'
                                                                    : 'bg-main-green/90 hover:bg-main-green text-white cursor-pointer'}`}
                                                            >
                                                                {(!isValid || !isSubmitting) && <Plus/>}
                                                                {isEdit ? (isSubmitting ? (
                                                                    <div className="flex items-center gap-3 justify-center">
                                                                    <span
                                                                        className="loading loading-spinner text-white loading-sm "></span>
                                                                        <span className='font-semibold'>Updating Intervention...</span>
                                                                    </div>
                                                                ) : 'Update Intervention') : (isSubmitting ?
                                                                    (
                                                                        <div
                                                                            className="flex items-center gap-3 justify-center">
                                                                        <span
                                                                            className="loading loading-spinner text-white loading-sm "></span>
                                                                            <span className='font-semibold'>Creating Intervention...</span>
                                                                        </div>
                                                                    ) : 'Create Intervention')}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </Form>
                                        )
                                    }}
                                </Formik>
                            </div>
                        )
                )}
        </MyModal>
    );
}

export default NewIntervention;

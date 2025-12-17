import {useAuth} from "../context/AuthContext.jsx";
import React, {useEffect, useMemo, useState} from "react";
import * as Yup from "yup";
import axios from "axios";
import { json2csv } from 'json-2-csv';
import {
    createExportation,
    getInterventions,
    getInterventionsToExport,
    getInterventionTypes,
    getSites,
    getTechniciansSupervisors
} from "../services/api.js";
import {MyModal} from "./index.js";
import {ChevronDownIcon, Funnel, HardDriveDownload, Plus, ServerCrash} from "lucide-react";
import {Field, Form, Formik} from "formik";
import {formatLabel} from "../Utils/formatLabel.js";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.js";
import {Button} from "@/components/ui/button.js";
import {Calendar} from "@/components/ui/calendar.js";
import {toast} from 'react-hot-toast'
import {formatDate} from "date-fns";
import {useMsal} from "@azure/msal-react";
import {loginRequest} from "@/Utils/msalAuthConfig.js";

const validationSchema = Yup.object({
    fileName : Yup.string().required().test(
        function (value) {
            if (!value) return false;
            return value.toLowerCase().endsWith('.csv');
        }
    ),
    types : Yup.array().of(Yup.string()).required(),
    statuses : Yup.array().of(Yup.string()).required(),
    priorities : Yup.array().of(Yup.string()).required(),
    startDate : Yup.date().nullable(),
    endDate: Yup.date().nullable()
        .test(
            "is-greater",
            "End date must be after start date",
            function (value) {
                const { startDate } = this.parent;
                if (!startDate || !value)
                    return true;

                const startOfDay = new Date(startDate);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(value);
                endOfDay.setHours(23, 59, 59, 999);

                return endOfDay > startOfDay;
            }
        ),
    siteIds : Yup.array().of(Yup.number()).nullable().required(),
    userIds : Yup.array().of(Yup.number()).nullable().required(),
    interventionTypesIds : Yup.array().of(Yup.number()).nullable().required()
})



const NewExportation = ({isOpen , onClose }) => {
    const {user} = useAuth();
    const role = user?.roles?.split("_")[1];
    const [isExporting , setIsExporting] = useState(false);
    const [loading , setLoading] = useState(false);
    const [error , setError] = useState(null);
    const [sites , setSites] = useState([]);
    const [interventionTypes , setInterventionTypes] = useState([]);
    const [technicians , setTechnicians] = useState([]);
    const [startOpen , setStartOpen] = useState(false)
    const [endOpen , setEndOpen] = useState(false)


    const initialValues = useMemo(() => ({
        fileName : '',
        types : [],
        statuses : [],
        priorities : [],
        siteIds : [],
        userIds : [],
        interventionTypesIds : [],
        startDate : null,
        endDate : null
    }) , [sites , technicians , interventionTypes])


    const fetchFilerDependencies = async () => {
        try{
            const [techniciansResponse , sitesResponse , interventionTypesResponse] = await axios.all([
                getTechniciansSupervisors() , getSites() , getInterventionTypes()
            ]);
            setInterventionTypes(interventionTypesResponse.data);
            setTechnicians(techniciansResponse.data);
            setSites(sitesResponse.data);
        }catch (e) {
            console.log("error : " + e);
            setError(e?.response?.data?.message || "Internal Server Error");
        }finally {
            setLoading(false);
        }
    }

    const { instance, accounts } = useMsal();
    const activeAccount = accounts[0] || null;

    const uploadToOneDrive = async (csvData, fileName) => {
        try {
            setIsExporting(true);
            let account = activeAccount;

            if (!account) {
                const loginResponse = await instance.loginPopup({
                    scopes: loginRequest.scopes,
                    prompt: "select_account",
                });
                account = loginResponse.account;
            }

            const tokenResponse = await instance.acquireTokenSilent({
                scopes: loginRequest.scopes,
                account,
            }).catch(async () => {
                return instance.acquireTokenPopup({
                    scopes: loginRequest.scopes,
                    account
                });
            });

            const accessToken = tokenResponse.accessToken;

            const oneDriveResponse = await axios.put(
                `https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}:/content`,
                csvData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "text/csv",
                    },
                }
            );

            const fileLink = oneDriveResponse.data.webUrl;
            const fileId = oneDriveResponse.data.id;

            try {
                const exportationCreationResponse = await createExportation({
                    fileName,
                    fileLink,
                    createdBy: user?.id,
                    superUser: role === "SUPERUSER"
                });

                // ✅ Show success toast here
                toast.success("Csv data successfully uploaded to OneDrive");

                return { oneDriveResponse, exportationCreationResponse };

            } catch (exportError) {
                console.error("Exportation creation failed, deleting OneDrive file:", exportError);

                try {
                    await axios.delete(
                        `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    );
                    console.log("OneDrive file deleted successfully after exportation failure");
                } catch (deleteError) {
                    console.error("Failed to delete OneDrive file:", deleteError);
                }

                throw exportError;
            }

        } catch (e) {
            toast.error("Upload to OneDrive failed");
            console.error("Upload to OneDrive failed:", e);
            throw e;
        } finally {
            setIsExporting(false);
        }
    };

     const handleExport = async (csvData , fileName) => {
         try{
             await uploadToOneDrive(csvData, fileName);
         }catch (e) {
             throw e;
         }
    };


    useEffect(() => {
        if(!isOpen || !role) return;
        fetchFilerDependencies();
    }, [role , isOpen ]);

    const typeOptions = [
        { value: "DEMAND", label: "Demand" },
        { value: "INCIDENT", label: "Incident" },
    ];

    const statusOptions = [
        {id : "COMPLETED" , name : "Completed" , color: "bg-green-100 text-green-800"},
        {id : "SCHEDULED" , name : "Scheduled" , color : "bg-purple-100 text-purple-800"},
        {id : "IN_PROGRESS" , name : "In Progress" , color : "bg-blue-100 text-blue-800"},
        {id : "CANCELED" , name : "Canceled" , color : "bg-gray-100 text-gray-800"}
    ]

    const priorityOptions = [
        {id : "LOW" , name : "Low" , color : "bg-green-100 text-green-800 border-green-200"},
        {id : "MEDIUM" , name : "Medium" , color: "bg-yellow-100 text-yellow-800 border-yellow-200"},
        {id : "HIGH" , name : "High" , color : 'bg-orange-100 text-orange-800 border-orange-200'},
        {id : "CRITICAL" , name: "Critical" , color: 'bg-red-100 text-red-800 border-red-200'},
        {id : "URGENT" , name: "Urgent" , color: 'bg-pink-100 text-pink-800 border-pink-200'}
    ];

    const siteStatusStyle = {
        'ACTIVE': 'bg-green-100 text-green-800 ',
        'INACTIVE': 'bg-yellow-100 text-yellow-800 ',
        'MAINTENANCE': 'bg-orange-100 text-orange-800 ',
        'EMERGENCY': 'bg-red-100 text-red-800 ',
    }

    const technicianStatusStyles = {
        'AVAILABLE': 'bg-green-100 text-green-800 border-green-200',
        'BUSY': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'ON_LEAVE': 'bg-red-100 text-red-800 border-red-200',
    }


    return (
        <MyModal
            isOpen={isOpen} onClose={onClose} isExporting={isExporting}
        >
            {loading ? (
                <div className='flex items-center justify-center w-full py-30'>
                    <span className="loading loading-spinner custom-spinner loading-2xl text-main-green "></span>
                </div>
            ) : error != null ? (
                <div className='flex items-center flex-col justify-center w-full py-30'>
                    <ServerCrash className="w-16 h-16 text-red-600 mb-4"/>
                    <h2 className="text-2xl font-bold text-red-700 mb-2">Server Error</h2>
                    <p className="text-red-600 text-center">
                        Oops! Something went wrong on our side. Please try refreshing the page or come back later.
                    </p>
                </div>
            ) : (
                <div className='flex flex-col gap-5 p-5 justify-center items-start w-[900px]'>
                    <div className='flex flex-col items-start justify-center'>
                        <h2 className="text-lg font-semibold flex gap-2 items-center justify-start">
                            <HardDriveDownload className='w-5 h-5 text-main-green'/>
                            <p className='font-semibold'>
                                Export Data
                            </p>
                        </h2>
                        <p className='text-gray-400 text-sm'>
                            Customize your data exportation criteria to find specific interventions

                        </p>
                    </div>
                    <Formik
                        key={'filters'}
                        enableReinitialize={true}
                        validationSchema={validationSchema}
                        validateOnMount={true}
                        initialValues={initialValues}
                        onSubmit={async (values, { setSubmitting }) => {
                            try {
                                setIsExporting(true);
                                const interventionsData = await getInterventionsToExport(role , values)
                                if(interventionsData.data.length === 0) {
                                    toast.error("No data to export , try adjusting the filters")
                                    return;
                                }
                                const csvData = json2csv(interventionsData.data);
                                await handleExport(csvData , values.fileName);
                            } catch (err) {
                                console.error(err);
                                toast.error(err?.response?.data?.message || "Failed to export data into oneDrive");
                            } finally {
                                setSubmitting(false);
                                setIsExporting(false);
                            }
                        }}
                    >
                        {({isValid  , dirty, isSubmitting , setFieldValue , values  }) => (
                            <Form className="space-y-4 max-h-[70vh]  overflow-y-auto pr-2 w-full">
                                <div className='flex w-full gap-5'>
                                    <div className='p-5 rounded-lg  border-[1px] border-gray-200 w-full'>
                                        <div className='flex flex-col gap-8'>
                                            <div className='flex flex-col gap-3'>
                                                <div className='flex gap-1 items-center justify-start'>
                                                    <div
                                                        className="w-4 h-4 bg-indigo-100 rounded flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                    </div>
                                                    <label className="text-sm font-medium">File name</label>
                                                </div>
                                                <Field name="fileName" as="input" type='text'
                                                       placeholder='.csv extension'
                                                       className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                                            </div>
                                            <div className='flex flex-col gap-3'>
                                                <div className='flex items-center justify-between w-full'>
                                                    <div className='flex gap-1 items-center justify-start'>
                                                        <div
                                                            className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                                        </div>
                                                        <label className="text-sm font-medium">Type</label>
                                                    </div>
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            setFieldValue("types", values.types.length === typeOptions.length ? [] : typeOptions.map(option => option.value))
                                                        }}
                                                        className='cursor-pointer bg-transparent transition-colors duration-200 hover:bg-gray-100 font-medium text-gray-500 rounded-md px-3 py-1'
                                                    >
                                                        <p className='text-xs'>Select All</p>
                                                    </button>
                                                </div>
                                                <p className='text-xs text-gray-400'>Select types to include in the
                                                    filter</p>
                                                <div className="flex flex-col gap-2">
                                                    {typeOptions.map((option) => (
                                                        <label key={option.value} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                name="types"
                                                                value={option.value}
                                                                checked={values.types.includes(option.value)}
                                                                onChange={(e) => {
                                                                    const newTypes = e.target.checked
                                                                        ? [...values.types, option.value]
                                                                        : values.types.filter((v) => v !== option.value);
                                                                    setFieldValue("types", newTypes);
                                                                }}
                                                                className="h-4 w-4 checkbox rounded border-gray-300 text-main-green focus:ring-main-green"
                                                            />
                                                            <span className="text-sm font-medium">{option.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className='flex flex-col gap-3'>
                                                <div className='flex items-center justify-between w-full'>
                                                    <div className='flex gap-1 items-center justify-start'>
                                                        <div
                                                            className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                        </div>
                                                        <label className="text-sm font-medium">Status</label>
                                                    </div>
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            setFieldValue("statuses", values.statuses.length === statusOptions.length ? [] : statusOptions.map(option => option.id))
                                                        }}
                                                        className='cursor-pointer bg-transparent transition-colors duration-200 hover:bg-gray-100 font-medium text-gray-500 rounded-md px-3 py-1'
                                                    >
                                                        <p className='text-xs'>Select All</p>
                                                    </button>
                                                </div>
                                                <p className='text-xs text-gray-400'>Select status to include in the
                                                    filter</p>
                                                <div className="flex flex-col gap-2">
                                                    {statusOptions.map((option) => (
                                                        <label key={option.value} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                name="statuses"
                                                                value={option.id}
                                                                checked={values.statuses.includes(option.id)}
                                                                onChange={(e) => {
                                                                    const newTypes = e.target.checked
                                                                        ? [...values.statuses, option.id]
                                                                        : values.statuses.filter((v) => v !== option.id);
                                                                    setFieldValue("statuses", newTypes);
                                                                }}
                                                                className="h-4 w-4 checkbox rounded border-gray-300 text-main-green focus:ring-main-green"
                                                            />
                                                            <span className="text-sm font-medium">{option.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className='flex flex-col gap-3'>
                                                <div className='flex items-center justify-between w-full'>
                                                    <div className='flex gap-1 items-center justify-start'>
                                                        <div
                                                            className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                        </div>
                                                        <label className="text-sm font-medium">Priority</label>
                                                    </div>
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            setFieldValue("priorities", values.priorities.length === priorityOptions.length ? [] : priorityOptions.map(option => option.id))
                                                        }}
                                                        className='cursor-pointer bg-transparent transition-colors duration-200 hover:bg-gray-100 font-medium text-gray-500 rounded-md px-3 py-1'
                                                    >
                                                        <p className='text-xs'>Select All</p>
                                                    </button>
                                                </div>
                                                <p className='text-xs text-gray-400'>Select Priority to include in the
                                                    filter</p>
                                                <div className="flex flex-col gap-2">
                                                    {priorityOptions.map((option) => (
                                                        <label key={option.value} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                name="priorities"
                                                                value={option.id}
                                                                checked={values.priorities.includes(option.id)}
                                                                onChange={(e) => {
                                                                    const newTypes = e.target.checked
                                                                        ? [...values.priorities, option.id]
                                                                        : values.priorities.filter((v) => v !== option.id);
                                                                    setFieldValue("priorities", newTypes);
                                                                }}
                                                                className="h-4 w-4 checkbox rounded border-gray-300 text-main-green focus:ring-main-green"
                                                            />
                                                            <span className="text-sm font-medium">{option.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='p-5 rounded-lg  border-[1px] border-gray-200 w-full'>
                                        <div className='flex flex-col gap-8'>
                                            <div className='flex flex-col gap-3'>
                                                <div className='flex items-center justify-between w-full'>
                                                    <div className='flex gap-1 items-center justify-start'>
                                                        <div
                                                            className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                                                            <div
                                                                className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                        </div>
                                                        <label className="text-sm font-medium">Sites</label>
                                                    </div>
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            setFieldValue("siteIds", values.siteIds.length === sites.length ? [] : sites.map(site => site.id))
                                                        }}
                                                        className='cursor-pointer bg-transparent transition-colors duration-200 hover:bg-gray-100 font-medium text-gray-500 rounded-md px-3 py-1'
                                                    >
                                                        <p className='text-xs'>Select All</p>
                                                    </button>
                                                </div>
                                                <p className='text-xs text-gray-400'>Select Sites to include in the
                                                    filter</p>
                                                <div
                                                    className='p-4 border-[1px] border-gray-200 max-h-48 overflow-y-auto rounded-md'>
                                                    <div className='flex flex-col gap-2'>
                                                        {sites.map((site, index) => (
                                                            <div
                                                                className='flex items-center justify-between w-full'>
                                                                <label key={index}
                                                                       className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="siteIds"
                                                                        value={site.id}
                                                                        checked={values.siteIds.includes(site.id)}
                                                                        onChange={(e) => {
                                                                            const newSiteIds = e.target.checked
                                                                                ? [...values.siteIds, site.id]
                                                                                : values.siteIds.filter((v) => v !== site.id);
                                                                            setFieldValue("siteIds", newSiteIds);
                                                                        }}
                                                                        className="h-4 w-4 checkbox rounded border-gray-300 text-main-green focus:ring-main-green"
                                                                    />
                                                                    <span
                                                                        className="text-sm font-medium">{site.siteName}</span>
                                                                </label>
                                                                <p className={` px-2 py-0.5  rounded-full text-xs font-semibold ${siteStatusStyle[site.siteStatus]}`}>{formatLabel(site.siteStatus)}</p>

                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {(role === "SUPERVISOR" || role === "SUPERUSER") && (
                                                <div className='flex flex-col gap-3'>
                                                    <div className='flex items-center justify-between w-full'>
                                                        <div className='flex gap-1 items-center justify-start'>
                                                            <div
                                                                className="w-4 h-4 bg-yellow-100 rounded flex items-center justify-center">
                                                                <div
                                                                    className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                                                            </div>
                                                            <label className="text-sm font-medium">Technicians</label>
                                                        </div>
                                                        <button
                                                            type='button'
                                                            onClick={() => {
                                                                setFieldValue("userIds", values.userIds.length === technicians.length ? [] : technicians.map(tech => tech.id))
                                                            }}
                                                            className='cursor-pointer bg-transparent transition-colors duration-200 hover:bg-gray-100 font-medium text-gray-500 rounded-md px-3 py-1'
                                                        >
                                                            <p className='text-xs'>Select All</p>
                                                        </button>
                                                    </div>
                                                    <p className='text-xs text-gray-400'>Select Technicians to include
                                                        in
                                                        the
                                                        filter</p>
                                                    <div
                                                        className='p-4 border-[1px] border-gray-200 max-h-48 overflow-y-auto rounded-md'>
                                                        <div className='flex flex-col gap-2'>
                                                            {technicians.map((tech, index) => (
                                                                <div
                                                                    className='flex items-center justify-between w-full'>
                                                                    <label key={index}
                                                                           className="flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            name="userIds"
                                                                            value={tech.id}
                                                                            checked={values.userIds.includes(tech.id)}
                                                                            onChange={(e) => {
                                                                                const newUserIds = e.target.checked
                                                                                    ? [...values.userIds, tech.id]
                                                                                    : values.userIds.filter((v) => v !== tech.id);
                                                                                setFieldValue("userIds", newUserIds);
                                                                            }}
                                                                            className="h-4 w-4 checkbox rounded border-gray-300 text-main-green focus:ring-main-green"
                                                                        />
                                                                        <span
                                                                            className="text-sm font-medium">{tech.firstName} {tech.lastName}</span>
                                                                    </label>
                                                                    <p className={` px-2 py-0.5  rounded-full text-xs font-semibold ${technicianStatusStyles[tech.technicianStatus]}`}>{formatLabel(tech.technicianStatus)}</p>

                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className='flex flex-col gap-3'>
                                                <div className='flex items-center justify-between w-full'>
                                                    <div className='flex gap-1 items-center justify-start'>
                                                        <div
                                                            className="w-4 h-4 bg-violet-100 rounded flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-violet-600 rounded-full"></div>
                                                        </div>
                                                        <label className="text-sm font-medium">Intervention
                                                            Types</label>
                                                    </div>
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            setFieldValue("interventionTypesIds", values.interventionTypesIds.length === interventionTypes.length ? [] : interventionTypes.map(int => int.id))
                                                        }}
                                                        className='cursor-pointer bg-transparent transition-colors duration-200 hover:bg-gray-100 font-medium text-gray-500 rounded-md px-3 py-1'
                                                    >
                                                        <p className='text-xs'>Select All</p>
                                                    </button>
                                                </div>
                                                <p className='text-xs text-gray-400'>Select Intervention Types to
                                                    include in the
                                                    filter</p>
                                                <div
                                                    className='p-4 border-[1px] border-gray-200 max-h-48 overflow-y-auto rounded-md'>
                                                    <div className='flex flex-col gap-2'>
                                                        {interventionTypes.map((int, index) => (
                                                            <div className='flex items-center justify-between w-full'>
                                                                <label key={index} className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="interventionTypesIds"
                                                                        value={int.id}
                                                                        checked={values.interventionTypesIds.includes(int.id)}
                                                                        onChange={(e) => {
                                                                            const newIntTypesIds = e.target.checked
                                                                                ? [...values.interventionTypesIds, int.id]
                                                                                : values.interventionTypesIds.filter((v) => v !== int.id);
                                                                            setFieldValue("interventionTypesIds", newIntTypesIds);
                                                                        }}
                                                                        className="h-4 w-4 checkbox rounded border-gray-300 text-main-green focus:ring-main-green"
                                                                    />
                                                                    <span
                                                                        className="text-sm font-medium">{int.name}</span>
                                                                </label>

                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flex flex-col gap-3'>
                                                <div className='flex gap-1 items-center justify-start'>
                                                    <div className='flex flex-col gap-3 w-full'>
                                                        <div className='flex gap-1 items-center justify-start'>
                                                            <div
                                                                className="w-4 h-4 bg-pink-100 rounded flex items-center justify-center">
                                                                <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                                                            </div>
                                                            <label className="text-sm font-medium">Interval</label>
                                                        </div>
                                                        <p className='text-xs text-gray-400'>Select Interval to
                                                            include
                                                            in the
                                                            filter</p>
                                                        <div className='flex gap-5 w-full items-center justify-between'>
                                                            <div className='w-full'>
                                                                <Popover  open={startOpen} onOpenChange={setStartOpen}>
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            id="date"
                                                                            className="justify-between w-full rounded-md shadow-none font-normal hover:bg-gray-50"
                                                                        >
                                                                            {values.startDate
                                                                                ? values.startDate
                                                                                : "Select start date"}
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
                                                                                setStartOpen(false)
                                                                            }}
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>

                                                            <div className='w-full'>
                                                                <Popover  open={endOpen} onOpenChange={setEndOpen}>
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            id="date"
                                                                            className="justify-between w-full rounded-md shadow-none font-normal hover:bg-gray-50"
                                                                        >
                                                                            {values.endDate
                                                                                ? values.endDate
                                                                                : "Select end date"}
                                                                            <ChevronDownIcon/>
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="overflow-hidden p-0"
                                                                                    align="start">
                                                                        <Calendar
                                                                            mode="single"
                                                                            selected={values.endDate}
                                                                            captionLayout="dropdown"
                                                                            onSelect={(date) => {
                                                                                setFieldValue("endDate", formatDate(date, "yyyy-MM-dd"))
                                                                            }}
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2 justify-end'>
                                    <p className='text-gray-500 text-sm self-'>Apply filters to refine your search
                                        results
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className='text-black text-sm rounded-md bg-transparent duration-200 transition-all border-[1px] border-gray-300 hover:bg-gray-200 px-4 py-2 cursor-pointer'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!dirty || !isValid || isSubmitting}
                                        className={`flex gap-5 items-center h-10 justify-center text-sm px-4 py-2 rounded-md transition-all duration-200
                          ${(!dirty || !isValid || isSubmitting)
                                            ? 'bg-main-green/60 text-white cursor-not-allowed'
                                            : 'bg-main-green/90 hover:bg-main-green text-white cursor-pointer'}`}
                                    >
                                        {(!dirty || !isSubmitting) && <HardDriveDownload className='w-5 h-5'/>}
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-3 justify-center">
                                                <span className="loading loading-spinner text-white loading-sm "></span>
                                                <span className=''>Exporting Data...</span>
                                            </div>
                                        ) : 'Export Data'}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            )

            }
        </MyModal>
    )

}

export default NewExportation;
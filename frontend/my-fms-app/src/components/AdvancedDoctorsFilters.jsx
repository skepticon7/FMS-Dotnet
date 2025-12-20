import {useAuth} from "../context/AuthContext.jsx";
import React, {useEffect, useMemo, useState} from "react";
import * as Yup from "yup";
import axios from "axios";
import {getInterventionTypes, getSites, getTechniciansSupervisors} from "../services/api.js";
import {MyModal} from "./index.js";
import {ChevronDownIcon, Funnel, Plus, ServerCrash} from "lucide-react";
import {Field, Form, Formik} from "formik";
import {formatLabel} from "../Utils/formatLabel.js";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.js";
import {Button} from "@/components/ui/button.js";
import {Calendar} from "@/components/ui/calendar.js";
import {formatDate} from "date-fns";

const validationSchema = Yup.object({
    page : Yup.number().required(),
    name : Yup.string().nullable(),
    genders : Yup.array().of(Yup.string()).required(),
    specialities : Yup.array().of(Yup.string()).required(),
})



const AdvancedDoctorsFilters = ({isOpen , onClose  , setAdvancedFilterOptions  }) => {
    const {user} = useAuth();
    const role = user?.roles?.split("_")[1];
    const [loading , setLoading] = useState(false);
    const [error , setError] = useState(null);
    const [sites , setSites] = useState([]);
    const [interventionTypes , setInterventionTypes] = useState([]);
    const [technicians , setTechnicians] = useState([]);
    const [startOpen , setStartOpen] = useState(false)
    const [endOpen , setEndOpen] = useState(false)
    const {setFiltersApplied} = useAuth();

    const initialValues = useMemo(() => ({
        page : 1,
        genders : [],
        name :'',
        specialities : [],
    }) , [])


    const genders = [
        { value: "MALE", label: "Male" },
        { value: "FEMALE", label: "Female" },
    ];


    const specialities = [

        { value: "Cardiology", label: "Cardiology" },
        { value: "Neurology", label: "Neurology" },

        { value: "Gynecology", label: "Gynecology" },
        { value: "Dermatology", label: "Dermatology" },

        { value: "Pediatrics", label: "Pediatrics" },
        { value: "GeneralPractice", label: "General Practice" },

    ];


    return (
        <MyModal
            isOpen={isOpen} onClose={onClose}
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
                            <Funnel className='w-5 h-5 text-main-green'/>
                            <p className='font-semibold'>
                                Advanced Doctors Filtering
                            </p>
                        </h2>
                        <p className='text-gray-400 text-sm'>
                            Customize your search criteria to find specific doctors

                        </p>
                    </div>
                    <Formik
                        key={'filters'}
                        enableReinitialize={true}
                        validationSchema={validationSchema}
                        validateOnMount={true}
                        initialValues={initialValues}
                        onSubmit={async (values , {setSubmitting}) => {
                            setAdvancedFilterOptions(({
                                page : values.page,
                                name : values.name,
                                specialities : values.specialities,
                                genders : values.genders,
                            }))
                            setFiltersApplied(true);
                            onClose();
                        }}
                    >
                        {({isValid  , dirty, isSubmitting , setFieldValue , values , errors , touched}) => (
                            <Form className="space-y-4 max-h-[70vh]  overflow-y-auto pr-2 w-full">
                                <div className='flex w-full gap-5'>
                                    <div className='p-5 rounded-lg  border-[1px] border-gray-200 w-full'>
                                        <div className='flex flex-col gap-8'>
                                            <div>
                                                <div className='flex gap-1 items-center justify-start'>
                                                    <div
                                                        className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                                    </div>
                                                    <label className="text-sm font-medium">Name</label>
                                                </div>
                                                <Field name="name" as="input" type='text'
                                                       placeholder='Enter the name'
                                                       className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] mt-2 border-gray-300 rounded-md'/>
                                            </div>
                                            <div className='flex flex-col gap-3'>
                                                <div className='flex items-center justify-between w-full'>
                                                    <div className='flex gap-1 items-center justify-start'>
                                                        <div
                                                            className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                                        </div>
                                                        <label className="text-sm font-medium">Gender</label>
                                                    </div>
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            setFieldValue("genders", values.genders.length === genders.length ? [] : genders.map(option => option.value))
                                                        }}
                                                        className='cursor-pointer bg-transparent transition-colors duration-200 hover:bg-gray-100 font-medium text-gray-500 rounded-md px-3 py-1'
                                                    >
                                                        <p className='text-xs'>Select All</p>
                                                    </button>
                                                </div>
                                                <p className='text-xs text-gray-400'>Select gender to include in the
                                                    filter</p>
                                                <div className="flex flex-col gap-2">
                                                    {genders.map((gender) => (
                                                        <label key={gender.value} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                name="genders"
                                                                value={gender.value}
                                                                checked={values.genders.includes(gender.value)}
                                                                onChange={(e) => {
                                                                    const genders = e.target.checked
                                                                        ? [...values.genders, gender.value]
                                                                        : values.genders.filter((v) => v !== gender.value);
                                                                    setFieldValue("genders", genders);
                                                                }}
                                                                className="h-4 w-4 checkbox rounded border-gray-300 text-main-green focus:ring-main-green"
                                                            />
                                                            <span className="text-sm font-medium">{gender.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='p-5 rounded-lg  border-[1px] border-gray-200 w-full'>
                                        <div className='flex flex-col gap-3'>
                                            <div className='flex items-center justify-between w-full'>
                                                <div className='flex gap-1 items-center justify-start'>
                                                    <div
                                                        className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                    </div>
                                                    <label className="text-sm font-medium">Speciality</label>
                                                </div>
                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        setFieldValue("specialities", values.specialities.length === specialities.length ? [] : specialities.map(option => option.value))
                                                    }}
                                                    className='cursor-pointer bg-transparent transition-colors duration-200 hover:bg-gray-100 font-medium text-gray-500 rounded-md px-3 py-1'
                                                >
                                                    <p className='text-xs'>Select All</p>
                                                </button>
                                            </div>
                                            <p className='text-xs text-gray-400'>Select speciality to include in the
                                                filter</p>
                                            <div className="flex flex-col gap-2">
                                                {specialities.map((speciality) => (
                                                    <label key={speciality.value} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            name="bloodTypes"
                                                            value={speciality.value}
                                                            checked={values.specialities.includes(speciality.value)}
                                                            onChange={(e) => {
                                                                const specialities = e.target.checked
                                                                    ? [...values.specialities, speciality.value]
                                                                    : values.specialities.filter((v) => v !== speciality.value);
                                                                setFieldValue("specialities", specialities);
                                                            }}
                                                            className="h-4 w-4 checkbox rounded border-gray-300 text-main-green focus:ring-main-green"
                                                        />
                                                        <span className="text-sm font-medium">{speciality.label}</span>
                                                    </label>
                                                ))}
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
                                        className={`flex gap-2 items-center h-10 justify-center text-sm px-4 py-2 rounded-md transition-all duration-200
                          ${(!dirty || !isValid || isSubmitting)
                                            ? 'bg-main-green/60 text-white cursor-not-allowed'
                                            : 'bg-main-green/90 hover:bg-main-green text-white cursor-pointer'}`}
                                    >
                                        {(!dirty || !isSubmitting) && <Funnel className='w-5 h-5'/>}
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-3 justify-center">
                                            <span className="loading loading-spinner text-white loading-sm "></span>
                                                <span className='font-semibold'>Applying Filters...</span>
                                            </div>
                                        ) : 'Apply Filters'}
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

export default AdvancedDoctorsFilters;
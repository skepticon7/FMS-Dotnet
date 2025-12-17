import {MyModal} from "./index.js";
import {useAuth} from "../context/AuthContext.jsx";
import * as Yup from "yup";
import {Funnel} from "lucide-react";
import {Field, Form, Formik} from "formik";
import {formatLabel} from "../Utils/formatLabel.js";
import React from "react";
import status from "daisyui/components/status/index.js";


const validationSchema = Yup.object({
    name : Yup.string().nullable(),
    statuses : Yup.array().of(Yup.string()).nullable(),
    roles : Yup.array().of(Yup.string()).nullable()
})

const UsersManagementFilter = ({isOpen , onClose  , setAllFilters}) => {

    const {user  , setUsersFiltersApplied} = useAuth();
    const role = user?.roles?.split("_")[1];

    const initialValues = {
        name : '',
        roles : [],
        statuses : []
    }

    const roleOptions = ['Supervisor' , 'Technician']

    const statusesOptions = [
        { value: "AVAILABLE", label: "Available" },
        { value: "BUSY", label: "Busy" },
        { value: "ON_LEAVE", label: "On Leave" }
    ];


    return(
        <MyModal
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className='flex flex-col gap-5 p-5 justify-center items-start w-[900px]'>
                <div className='flex flex-col items-start justify-center'>
                    <h2 className="text-lg font-semibold flex gap-2 items-center justify-start">
                        <Funnel className='w-5 h-5 text-main-green'/>
                        <p className='font-semibold'>
                            Advanced Filtering
                        </p>
                    </h2>
                    <p className='text-gray-400 text-sm'>
                        Customize your search criteria to find specific records

                    </p>
                </div>
                <Formik
                    key={'users_filters'}
                    enableReinitialize={true}
                    validationSchema={validationSchema}
                    validateOnMount={true}
                    initialValues={initialValues}
                    onSubmit={async (values) => {
                        try {
                            setAllFilters(({
                                name: values.name,
                                statuses: values.statuses,
                                roles: values.roles,
                            }))
                            setUsersFiltersApplied(true);
                            onClose();
                        }catch (e) {
                            console.log(e);
                        }

                    }}
                >
                    {({isValid, dirty, isSubmitting, setFieldValue, values}) => (
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
                                                        className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    </div>
                                                    <label className="text-sm font-medium">Status</label>
                                                </div>
                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        setFieldValue("statuses", values.statuses.length === statusesOptions.length ? [] : statusesOptions.map(option => option.value))
                                                    }}
                                                    className='cursor-pointer bg-transparent transition-colors duration-200 hover:bg-gray-100 font-medium text-gray-500 rounded-md px-3 py-1'
                                                >
                                                    <p className='text-xs'>Select All</p>
                                                </button>
                                            </div>
                                            <p className='text-xs text-gray-400'>Select status to include in the
                                                filter</p>
                                            <div className="flex flex-col gap-2">
                                                {statusesOptions.map((option) => (
                                                    <label key={option.value} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            name="statuses"
                                                            value={option.id}
                                                            checked={values.statuses.includes(option.value)}
                                                            onChange={(e) => {
                                                                const newTypes = e.target.checked
                                                                    ? [...values.statuses, option.value]
                                                                    : values.statuses.filter((v) => v !== option.value);
                                                                setFieldValue("statuses", newTypes);
                                                            }}
                                                            className="h-4 w-4 checkbox rounded border-gray-300 text-main-green focus:ring-main-green"
                                                        />
                                                        <span className="text-sm font-medium">{option.label}</span>
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
                                                <label className="text-sm font-medium">Roles</label>
                                            </div>
                                            <button
                                                type='button'
                                                onClick={() => {
                                                    setFieldValue("roles", values.roles.length === roleOptions.length ? [] : roleOptions)
                                                }}
                                                className='cursor-pointer bg-transparent transition-colors duration-200 hover:bg-gray-100 font-medium text-gray-500 rounded-md px-3 py-1'
                                            >
                                                <p className='text-xs'>Select All</p>
                                            </button>
                                        </div>
                                        <p className='text-xs text-gray-400'>Select Priority to include in the
                                            filter</p>
                                        <div className="flex flex-col gap-2">
                                            {roleOptions.map((role) => (
                                                <label key={role} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="roles"
                                                        value={role}
                                                        checked={values.roles.includes(role)}
                                                        onChange={(e) => {
                                                            const newTypes = e.target.checked
                                                                ? [...values.roles, role]
                                                                : values.roles.filter((v) => v !== role);
                                                            setFieldValue("roles", newTypes);
                                                        }}
                                                        className="h-4 w-4 checkbox rounded border-gray-300 text-main-green focus:ring-main-green"
                                                    />
                                                    <span className="text-sm font-medium">{role}</span>
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
                                    disabled={!dirty || isSubmitting}
                                    className={`flex gap-5 items-center h-10 justify-center text-sm px-4 py-2 rounded-md transition-all duration-200
                          ${(!dirty || isSubmitting)
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
        </MyModal>
    )
}

export default UsersManagementFilter;
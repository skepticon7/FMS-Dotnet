import {MyModal} from "./index.js";
import * as Yup from 'yup';
import React, {useEffect, useMemo, useState} from "react";
import {useAuth} from "../context/AuthContext.jsx";
import {
    getInterventionById,
    getInterventionTypeById,
    saveInterventionType,
    saveTechnican,
    updateInterventionType
} from "../services/api.js";
import {Eye, Funnel, Plus, ServerCrash, SquarePen} from "lucide-react";
import {Field, Form, Formik} from "formik";
import {formatLabel} from "../Utils/formatLabel.js";
import {toast} from "react-hot-toast";
import {Input} from "@/components/ui/input.js";
import {Textarea} from "@/components/ui/textarea.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
const validationSchema = Yup.object({
    name : Yup.string().required(),
    description : Yup.string().required().min(140).max(200),
    interventionTypePriority : Yup.string().required()
});

const NewInterventionType = ({interventionTypeId , isOpen , onClose , viewOnly = false , isEdit}) => {

   const {user} = useAuth();
   const role = user?.roles

   const [interventionType , setInterventionType] = useState(null);
   const [loading , setLoading] = useState(false);
   const [error , setError] = useState(null);

    const initialValues = useMemo(() => ({
        name : interventionType?.name || '',
        description : interventionType?.description || '',
        interventionTypePriority : interventionType?.interventionTypePriority || '',
        createdBySuperuserId : user?.id
    }) , [interventionType]);


    const fetchInterventionTypeDependencies = async () => {
        try{
            setLoading(true);
            const response = await getInterventionTypeById(interventionTypeId);
            setInterventionType(response.data);
        }catch (e) {
            console.log(`Error : ${e}`);
            setError(e?.response?.data?.message || 'Internal Server Error')
        }finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if(!role || !isOpen) return;
        if(interventionTypeId)
            fetchInterventionTypeDependencies();
        else
            setInterventionType(null);
    }, [role , isOpen , isEdit , interventionTypeId]);

    const interventionPriority = [
        {value : "LOW" , label : "Low"},
        {value : "MEDIUM" , label: "Medium"},
        {value : "HIGH" , label : "High"},
        {value : "URGENT" , label: "Urgent"},
        {value : "CRITICAL" , label: "Critical"},
    ];


    return (
        <MyModal
            isOpen={isOpen}
            onClose={onClose}
        >
            {loading ? (
                <div className='flex items-center justify-center w-full py-30'>
                    <span className="loading loading-spinner custom-spinner loading-2xl text-main-green "></span>
                </div>
            ) : error != null ? (
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
                            {viewOnly ? <Eye className='text-main-green'/> : isEdit ?
                                <SquarePen className='text-main-green'/> : <Plus className='text-main-green'/>}
                            <p className='font-semibold'>{viewOnly ? "View Intervention Type" : !isEdit ? "Edit Intervention Type" : "Update Intervention Type"}</p>
                        </h2>
                        <p className='text-gray-400 font-regular text-sm'>
                            {viewOnly ? "View " : !isEdit ? "Create " : "Update "}
                            intervention type to categorize and standardize technical support cases
                        </p>
                    </div>
                    <Formik
                        key={'interventionTypes'}
                        enableReinitialize={true}
                        validationSchema={!viewOnly ? validationSchema : null}
                        validateOnMount={!viewOnly}
                        initialValues={initialValues}
                        onSubmit={async (values, {setSubmitting}) => {
                            setSubmitting(true);
                            try {
                                let res;
                                if(isEdit){
                                    res = await updateInterventionType(values , interventionTypeId);
                                }else {
                                    res = await saveInterventionType(values);
                                }
                                toast.success(`Intervention type successfully ${isEdit ? 'updated' : 'created'}`);
                                onClose();
                            }catch (e) {
                                console.log("error :" + e);
                                toast.error(e?.response?.data?.message || "Internal Server Error");
                            } finally {
                                setSubmitting(false);
                            }

                        }}
                    >
                        {({isValid, dirty, isSubmitting, setFieldValue, values, errors, touched}) => {
                            return (
                                <Form className="space-y-4 max-h-[70vh]  overflow-y-auto pr-2 w-full">
                                    <div className='flex w-full gap-5'>
                                        <div className='p-5 rounded-lg  border-[1px] border-gray-200 w-full'>
                                            <div className='flex flex-col gap-8 w-full'>
                                                <div>
                                                    <div className='flex gap-1 items-center justify-start'>
                                                        <div
                                                            className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                        </div>
                                                        <label className="text-sm font-medium">Name</label>
                                                    </div>
                                                    <Input disabled={viewOnly} value={values.name} onChange={(e) => setFieldValue('name' ,e.target.value)} name="name" as="input" type='text'
                                                           placeholder='Enter the name'
                                                           className='pl-3 text-sm py-2 w-full focus:outline-none focus:ring-0 border border-[1px] mt-2 border-gray-300 rounded-md'/>
                                                </div>
                                                <div >
                                                    <div className='flex gap-1 items-center justify-start'>
                                                        <div
                                                            className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                        </div>
                                                        <label className="text-sm font-medium">Description</label>
                                                    </div>
                                                    <textarea
                                                        value={values.description}
                                                        onChange={(e) => setFieldValue('description', e.target.value)}
                                                        disabled={viewOnly}
                                                        name="description"
                                                        maxLength={200}
                                                        minLength={140}
                                                        placeholder='Enter the description'
                                                        className='pl-3 w-full text-sm py-2 focus:outline-none focus:ring-0 border border-[1px] mt-2 border-gray-300 rounded-md '
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='p-5 rounded-lg  border-[1px] border-gray-200 w-full'>
                                            <div className='flex flex-col gap-2'>
                                                <div className='flex gap-1 items-center justify-start'>
                                                    <div
                                                        className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                    </div>
                                                    <label className="text-sm font-medium">Priority</label>
                                                </div>
                                                <Select
                                                    disabled={viewOnly}
                                                    value={values.interventionTypePriority || ''}
                                                    onValueChange={(value) => setFieldValue(
                                                        'interventionTypePriority' , value
                                                    )}
                                                >
                                                    <SelectTrigger
                                                        className='w-full py-5  rounded-md hover:bg-gray-50 transition-colors duration-200'>
                                                        <SelectValue
                                                            placeholder="Select intervention priority"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
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
                                                    {(!isValid || !isSubmitting) && <Plus/>}
                                                    {isEdit ? (isSubmitting ? (
                                                        <div className="flex items-center gap-3 justify-center">
                                                        <span
                                                            className="loading loading-spinner text-white loading-sm "></span>
                                                            <span className='font-semibold'>Updating Intervention Type...</span>
                                                        </div>
                                                    ) : 'Update Intervention Type') : (isSubmitting ?
                                                        (
                                                            <div className="flex items-center gap-3 justify-center">
                                                            <span
                                                                className="loading loading-spinner text-white loading-sm "></span>
                                                                <span
                                                                    className='font-semibold'>Creating Intervention Type...</span>
                                                            </div>
                                                        ) : 'Create Intervention Type')}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </Form>
                            )
                        }}
                    </Formik>
                </div>

            )}
        </MyModal>
    )
}

export default NewInterventionType;
import {MyModal} from "./index.js";
import {
    CalendarOff,
    ChevronDownIcon, CircleCheck, Clock,
    Eye,
    EyeOff,
    Funnel,
    IdCardLanyard,
    Info,
    Lock,
    Mail,
    Phone, Shield,
    ShieldCheck,
    ShieldClose, User,
    UserPlus, Users
} from "lucide-react";
import React, {useEffect, useState} from "react";
import {toast} from 'react-hot-toast'
import * as Yup from 'yup'
import {Field, Form, Formik} from "formik";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
import {Button} from "@/components/ui/button.js"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {formatDate} from "date-fns";
import {Input} from "@/components/ui/input.js";
import {saveSuperuser, saveSupervisor, saveTechnican, updateSupervisor} from "@/services/api.js";
import {useAuth} from "@/context/AuthContext.jsx";

const validationSchema = Yup.object({
    firstName : Yup.string().required(),
    lastName : Yup.string().required(),
    email : Yup.string().email().required()
        .matches(/@vivoenergy\.com$/, 'Email must be a vivoenergy.com domain'),
    phoneNumber : Yup.string().required().matches(
        /^(?:\+212|0)([5-7]\d{8})$/,
        "Invalid phone number format"
    ),
    password : Yup.string().required().min(8).max(20).matches(
        /^(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\-=/\\]).{8,20}$/,
        "Password must be 8-20 characters, include at least 1 number and 1 special character"
    ),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),

    hireDate: Yup.date()
        .required("Hire date is required")
        .max(new Date(), "Hire date cannot be in the future"),

    technicianStatus : Yup.string().required(),
    role : Yup.string().required()
})

const SliderPoints = ({selectedPage}) => {
    return (
        <div className="flex items-center justify-center space-x-4 py-4 self-center">
            {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            step <= selectedPage
                                ? "bg-main-green text-white"
                                : step === selectedPage + 1
                                    ? "bg-main-green/20 text-main-green"
                                    : "bg-gray-200 text-gray-500"
                        }`}
                    >
                        {step}
                    </div>
                    {step < 3 && <div className="w-8 h-0.5 bg-gray-200 mx-2"/>}
                </div>
            ))}
        </div>
    )
}


const BasicInformationsForm = ({values , setValues , setPageValidty}) => {

    useEffect(() => {
        const checkFields = async () => {
            try {
                await validationSchema.validateAt("firstName", values);
                await validationSchema.validateAt("lastName", values);
                await validationSchema.validateAt("email", values);
                await validationSchema.validateAt("phoneNumber", values);

                setPageValidty(prev => ({
                    ...prev,
                    page1: true
                }));
            } catch (err) {
                setPageValidty(prev => ({
                    ...prev,
                    page1: false
                }));
            }
        };

        checkFields();
    }, [values]);

    return (
        <div className='flex flex-col items-start justify-center gap-5'>
            <div className='flex items-center justify-center gap-2'>
                <Info className='text-main-green w-5.5 h-5.5'/>
                <p className='text-black font-semibold text-xl'>Basic Informations</p>
            </div>
            <div className='flex flex-col gap-4 w-full'>
                <div className='grid grid-cols-2 w-full gap-5'>
                    <div className='flex flex-col gap-2'>
                        <label className="text-sm font-medium">First name *</label>
                        <Input value={values.firstName} name='firstName' as="input" type='text'
                               onChange={(e) => setValues('firstName', e.target.value)}
                               placeholder='Enter first name'
                               className='pl-3 text-sm font-medium py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className="text-sm font-medium">Last name *</label>
                        <Input value={values.lastName} name='lastName' as="input" type='text'
                               onChange={(e) => setValues('lastName', e.target.value)}
                               placeholder='Enter last name'
                               className='pl-3 text-sm font-medium py-2 w-full focus:outline-none focus:ring-0 border border-[1px] border-gray-300 rounded-md'/>
                    </div>
                </div>
                <div className='flex flex-col gap-2'>
                    <label className="text-sm font-medium">Email *</label>
                    <div className='relative'>
                        <Mail className='absolute left-3 top-[8px] w-4.5 h-4.5 text-gray-400'/>
                        <Input
                            value={values.email}
                            name="email"
                            onChange={(e) => setValues("email" , e.target.value)}
                            className={`pl-10 py-2 font-medium w-full focus:outline-none focus:ring-0 text-sm`}
                            type="text"
                            placeholder='user@vivoenergy.com'
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <label className="text-sm font-medium">Phone Number *</label>
                    <div className='relative '>
                        <Phone className='absolute left-3 top-[8px] w-4.5 h-4.5 text-gray-400'/>
                        <Input
                            value={values.phoneNumber}
                            name="phoneNumber"
                            onChange={(e) => setValues("phoneNumber" , e.target.value)}
                            className='pl-10 py-2 font-medium w-full focus:outline-none focus:ring-0 text-sm'
                            type="text"
                            placeholder='+212-6-12-34-56-78'
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

const SecurityForm = ({values, setValues , setPageValidty}) => {
    const [showPassword , setShowPassword] = useState(false)

    useEffect(() => {
        const checkFields = async () => {
            try {
                await validationSchema.validateAt("password", values);
                await validationSchema.validateAt("confirmPassword", values);


                setPageValidty(prev => ({
                    ...prev,
                    page2: true
                }));
            } catch (err) {
                setPageValidty(prev => ({
                    ...prev,
                    page2: false
                }));
            }
        };

        checkFields();
    }, [values]);


    return (
        <div className='flex flex-col items-start justify-center gap-5'>
            <div className='flex items-center justify-center gap-2'>
                <ShieldCheck
                    className='text-main-green w-5.5 h-5.5'/>
                <p className='text-black font-semibold text-xl'>Security Settings</p>
            </div>
            <div className='flex flex-col gap-4 w-full'>
                <div className='flex flex-col gap-2'>
                    <label className="text-sm font-medium">Password *</label>
                    <div className='relative  rounded-md'>
                        <Lock className='absolute left-3 top-[8px] w-4.5 h-4.5 text-gray-400'/>
                        <Input
                            value={values.password}
                            name="password"
                            onChange={(e) => setValues("password", e.target.value)}
                            className='pl-10 py-2 w-full text-sm focus:outline-none focus:ring-0'
                            type={showPassword ? "text" : "password"}
                            placeholder='Enter your password'
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-4 top-[6.5px] w-4.5 h-4.5 text-gray-400'
                        >
                            {showPassword ? <EyeOff/> : <Eye/>}
                        </button>
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <label className="text-sm font-medium">Confirm Password *</label>
                    <div className='relative  rounded-md'>
                        <Lock className='absolute left-3 top-[8px] w-4.5 h-4.5 text-gray-400'/>
                        <Input
                            value={values.confirmPassword}
                            name="confirmPassword"
                            onChange={(e) => setValues("confirmPassword", e.target.value)}
                            className='pl-10 py-2 w-full text-sm focus:outline-none focus:ring-0'
                            type={showPassword ? "text" : "password"}
                            placeholder='Enter your password'
                        />
                    </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• maximum of 20 characters</li>
                        <li>• Include at least one number</li>
                        <li>• Include at least one special character</li>
                    </ul>
                </div>

            </div>
        </div>

    )
}

const RoleAndStatusForm = ({values, setValues , setPageValidty , role}) => {

    const [open, setOpen] = useState(false)

    useEffect(() => {
        const isValid =
            values.technicianStatus?.trim() &&
            values.role?.trim() &&
            values.hireDate?.trim();

        setPageValidty(prev => ({
            ...prev,
            page1: Boolean(isValid)
        }));
    }, [values]);


    const roles = role === "SUPERUSER" ?  [
        { value: "TECHNICIAN", label: "Technician" },
        { value: "SUPERVISOR", label: "Supervisor" },
        {value : "SUPERUSER" , label : "Superuser"}
    ] : role === "SUPERVISOR" ? [
        { value: "TECHNICIAN", label: "Technician" },
        { value: "SUPERVISOR", label: "Supervisor" },
    ] : [
        {value : "TECHNICIAN" , label:  "Technician"}
    ]

    const statuses = [
        { value: "AVAILABLE", label: "Available" },
        { value: "BUSY", label: "Busy" },
        { value: "ON_LEAVE", label: "On Leave"},
    ]

    return (
        <div className='flex flex-col items-start justify-center gap-5'>
            <div className='flex items-center justify-center gap-2'>
                <IdCardLanyard
                    className='text-main-green w-5.5 h-5.5'/>
                <p className='text-black font-semibold text-xl'>Role & Status</p>
            </div>

            <div className='flex items-start justify-center gap-10 w-full'>
                <div className='flex flex-col items-center justify-center gap-4 w-1/2'>
                        <div className='w-full flex flex-col gap-2'>
                            <label className="text-sm font-medium">Role *</label>
                            <Select
                                value={values.role} onValueChange={(value) => setValues("role", value)}>
                                <SelectTrigger
                                    className='w-full rounded-md hover:bg-gray-50 transition-colors duration-200'
                                >
                                    <SelectValue placeholder="Select user role"/>
                                </SelectTrigger>
                                <SelectContent

                                >
                                    {roles.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            <div className="flex items-center gap-2">
                                                {role.value === "SUPERUSER" && (
                                                    <Shield className="w-4 h-4"/>
                                                )}
                                                {role.value === "SUPERVISOR" && (
                                                    <Users className="w-4 h-4"/>
                                                )}
                                                {role.value === "TECHNICIAN" && (
                                                    <User className="w-4 h-4"/>
                                                )}
                                                <div>
                                                    <div>{role.label}</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label className="text-sm font-medium">Status *</label>
                        <Select
                            value={values.technicianStatus}
                            onValueChange={(value) => setValues("technicianStatus", value)}>
                            <SelectTrigger
                                className='w-full rounded-md hover:bg-gray-50 transition-colors duration-200'
                            >
                                <SelectValue placeholder="Select status"/>
                            </SelectTrigger>
                            <SelectContent

                            >
                                {statuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        <div className="flex items-center gap-2">
                                            {status.value === "AVAILABLE" && (
                                                <CircleCheck className="w-4 h-4"/>
                                            )}
                                            {status.value === "BUSY" && (
                                                <Clock className="w-4 h-4"/>
                                            )}
                                            {status.value === "ON_LEAVE" && (
                                                <CalendarOff className="w-4 h-4"/>
                                            )}
                                            <div>
                                                <div>{status.label}</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-1/2">
                    <div className='w-full flex flex-col gap-2'>
                        <label className="text-sm font-medium">Hire Date *</label>
                        <Popover  open={open} onOpenChange={setOpen}>
                            <PopoverTrigger  asChild>
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="justify-between font-normal hover:bg-gray-50"
                                >
                                    {values.hireDate
                                        ? values.hireDate
                                        : "Select date"}
                                    <ChevronDownIcon/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={values.hireDate}
                                    disabled={(date) => date > new Date()}

                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setValues("hireDate", formatDate(date , "yyyy-MM-dd"))
                                        setOpen(false)
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

            </div>


        </div>
    )
}


const NewUser = ({isOpen, onClose, role}) => {
    const {user} = useAuth();
    const [selectedSection, setSelectedSection] = useState(1)
    const [pagesValid, setPagesValid] = useState({
        page1: false,
        page2: false,
        page3: false
    })

    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        role : '',
        hireDate: null,
        technicianStatus: ''
    }




    return (
        <MyModal
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className='flex flex-col gap-5 p-5 justify-center items-start w-[900px]'>
                <div className='flex flex-col items-start justify-center'>
                    <h2 className="text-lg font-semibold flex gap-2 items-center justify-start">
                        <UserPlus className='w-5 h-5 text-main-green'/>
                        <p className='font-semibold'>
                            Create New user Account
                        </p>
                    </h2>
                    <p className='text-gray-400 text-sm'>
                        Create a new user account
                        for technicians or supervisors
                    </p>
                </div>
                <SliderPoints selectedPage={selectedSection}/>

                <Formik
                    key={'create_user'}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    validateOnMount={true}
                    onSubmit={async (values, {setSubmitting}) => {
                        try {
                            setSubmitting(true);
                            switch (role) {
                                case "SUPERUSER":
                                    switch (values.role) {
                                        case "SUPERVISOR":
                                            await saveSupervisor(values, user?.id , role);
                                            break;
                                        case "TECHNICIAN":
                                            await saveTechnican(values, user?.id, role);
                                            break;
                                        case "SUPERUSER":
                                            await saveSuperuser(values);
                                            break;
                                        default:
                                            throw new Error(`Superuser cannot create ${values.role} accounts`);
                                    }
                                    break;

                                case "SUPERVISOR":
                                    switch (values.role) {
                                        case "SUPERVISOR":
                                            await saveSupervisor(values, user?.id , role);
                                            break;
                                        case "TECHNICIAN":
                                            await saveTechnican(values, user?.id, role);
                                            break;
                                        default:
                                            throw new Error(`Supervisor cannot create ${values.role} accounts`);
                                    }
                                    break;

                                default:
                                    throw new Error("Invalid user role for account creation");
                            }
                            toast.success("New user successfully saved");
                            onClose();
                        }catch (e) {
                            console.log(e);
                            toast.error(e?.response?.data?.message || "Internal Server Error");
                        }finally {
                            setSubmitting(false);

                        }
                    }}
                >
                    {({isValid, isSubmitting,  errors , touched,values, setFieldValue}) => {
                        return (
                            <Form className='w-full space-y-4 '>
                                <div className='p-5 rounded-lg  border-[1px] border-gray-200 w-full'>
                                    {selectedSection === 1 && (
                                        <BasicInformationsForm
                                            errors={errors}
                                            touched={touched}
                                            values={values}
                                            setPageValidty={setPagesValid}
                                            setValues={setFieldValue}
                                        />
                                    )}
                                    {selectedSection === 2 && (
                                        <SecurityForm
                                            values={values}
                                            setPageValidty={setPagesValid}
                                            setValues={setFieldValue}
                                        />
                                    )}
                                    {selectedSection === 3 && (
                                        <RoleAndStatusForm
                                            role={role}
                                            values={values}
                                            setPageValidty={setPagesValid}
                                            setValues={setFieldValue}
                                        />
                                    )}
                                </div>
                                <div className='flex items-center gap-2 justify-end'>
                                    {selectedSection !== 1 && (
                                        <button
                                            onClick={() => setSelectedSection(selectedSection - 1)}
                                            className='text-black text-sm rounded-md bg-transparent duration-200 transition-all border-[1px] border-gray-300 hover:bg-gray-200 px-4 py-2 cursor-pointer'
                                        >
                                            Previous
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            onClose()
                                            setSelectedSection(1)
                                        }}
                                        className='text-black text-sm rounded-md bg-transparent duration-200 transition-all border-[1px] border-gray-300 hover:bg-gray-200 px-4 py-2 cursor-pointer'
                                    >
                                        Cancel
                                    </button>
                                    {selectedSection !== 3 && (
                                        <button
                                            disabled={
                                                (selectedSection === 1 && !pagesValid.page1) ||
                                                (selectedSection === 2 && !pagesValid.page2) ||
                                                (selectedSection === 3 && !pagesValid.page3)
                                            }
                                            onClick={() => setSelectedSection(selectedSection + 1)}
                                            className={`text-white text-sm rounded-md  duration-200 transition-all  px-4 py-2  
                                        ${( (selectedSection === 1 && !pagesValid.page1) ||
                                                (selectedSection === 2 && !pagesValid.page2) ||
                                                (selectedSection === 3 && !pagesValid.page3))
                                                ? 'bg-main-green/60 text-white cursor-not-allowed'
                                                : 'bg-main-green/90 hover:bg-main-green text-white cursor-pointer'}`}
                                        >
                                            Next
                                        </button>
                                    )}
                                    {selectedSection === 3 && (
                                        <button
                                            type="submit"
                                            disabled={!isValid || isSubmitting}
                                            className={`flex gap-5 items-center h-10 justify-center text-sm px-4 py-2 rounded-md transition-all duration-200
                          ${(!isValid || isSubmitting)
                                                ? 'bg-main-green/60 text-white cursor-not-allowed'
                                                : 'bg-main-green/90 hover:bg-main-green text-white cursor-pointer'}`}
                                        >
                                            {(!isValid || !isSubmitting) && <UserPlus className='w-5 h-5'/>}
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-3 justify-center">
                                                    <span className="loading loading-spinner text-white loading-sm "></span>
                                                    <span className='font-semibold'>Creating User...</span>
                                                </div>
                                            ) : 'Create User'}
                                        </button>
                                    )}
                                </div>
                            </Form>
                        )
                    }}
                </Formik>

            </div>
        </MyModal>
    )
}

export default NewUser;
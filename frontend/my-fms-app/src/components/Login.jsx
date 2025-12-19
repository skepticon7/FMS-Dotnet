import React, { useState } from 'react'
import {Wrench , User , Lock , EyeOff , Eye, UserMinus , HeartPlus} from "lucide-react"
import { Formik , Field , Form } from 'formik';
import * as Yup from "yup";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import {useAuth} from "../context/AuthContext.jsx";
import {Input} from "@/components/ui/input.js";
import {vivoLogo} from "@/assets/index.js";

const Login = () => {

    const {login} = useAuth();
    const [showPassword , setShowPassword] = useState(false)
    const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
        <div className='w-full max-w-md'>
            <div className='flex flex-col gap-2 items-center justify-center mb-8'>
                <div className='flex p-1.5 items-center justify-center rounded-md bg-dark-green'>
                    <HeartPlus className='w-10 h-10 rounded-md text-main-green'/>
                </div>
                <p className='text-gray-700 font-medium'>Hospital File Management System</p>
            </div>

            <div className='shadow-2xl  rounded-lg '>
                <div className='flex flex-col items-center justify-start gap-5 p-7 w-full '>
                    <div className='flex flex-col items-center justify-center gap-2'>
                        <h3 className='text-2xl font-bold'>Welcome Back</h3>
                        <p className='text-gray-600 font-medium'>Sign in to access your management dashboard</p>
                    </div>
                    <Formik
                        initialValues={{ Email: '', Password: '' }}
                        validateOnMount={true}
                        validationSchema={Yup.object({
                            Email: Yup.string().email().required("Email is required"),
                            Password: Yup.string().required("Password is required")
                        })}
                        onSubmit={async (values, { setSubmitting }) => {
                            setSubmitting(true);
                            try {
                                const res = await login(values);
                                navigate("/home");
                                toast.success(`Successfully logged in`)
                            } catch (err) {
                                console.log(err);
                                toast.error(err?.response?.data?.message || "Internal Server Error");
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isValid, isSubmitting , values , setFieldValue }) => (
                            <Form className='w-full'>
                                <div className='flex flex-col gap-3'>
                                    <div className='relative border border-[1px] mt-2 border-gray-300 rounded-sm'>
                                        <User className='absolute left-3 top-[9px] w-5 h-5 text-gray-400'/>
                                        <Input
                                            onChange={(e) => setFieldValue('Email' , e.target.value)}
                                            name="Email"
                                            className='pl-10 py-5 w-full border-none focus:outline-none focus:ring-0'
                                            type="text"
                                            placeholder='Enter your email'
                                        />
                                    </div>

                                    <div className='relative border border-[1px] mt-2 border-gray-300 rounded-sm'>
                                        <Lock className='absolute left-3 top-[9px] w-5 h-5 text-gray-400'/>
                                        <Input
                                            onChange={(e) => setFieldValue('Password' , e.target.value)}
                                            name="Password"
                                            className='pl-10 py-5 w-full border-none focus:outline-none focus:ring-0'
                                            type={showPassword ? "text" : "password"}
                                            placeholder='Enter your password'
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className='absolute right-5 top-[8px] w-4 h-4 text-gray-400 '
                                        >
                                            {showPassword ? <EyeOff/> : <Eye/>}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    disabled={!isValid || isSubmitting}
                                    type="submit"
                                    className={`bg-main-green flex items-center justify-center w-full mt-5 text-white font-medium rounded-sm py-2.5 ${
                                        (!isValid || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-3 justify-center">
                                            <span className="loading loading-spinner text-white loading-sm "></span>
                                            <span >Signing In...</span>
                                        </div>
                                    ) : ('Sign In')}
                                </button>
                            </Form>
                        )}
                    </Formik>

                </div>
            </div>
            <div className="text-center mt-8 text-sm text-gray-500">
                <p>© 2025 FMS. All rights reserved.</p>
                <p className="mt-1">Secure File Management System</p>
            </div>
        </div>
    </div>
  )
}

export default Login
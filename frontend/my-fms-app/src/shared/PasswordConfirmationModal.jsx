import MyModal from "./MyModal.jsx";
import * as Yup from 'yup';
import {Field, Form, Formik} from "formik";
import {toast} from "react-hot-toast";
import {confirmPassword} from "../services/api.js";
import {Eye, EyeOff, Lock} from "lucide-react";
import React, {useState} from "react";
import {Input} from "@/components/ui/input.js";
import {useAuth} from "@/context/AuthContext.jsx";

const validationSchema = Yup.object({
    password : Yup.string().required("Password is required")
})

const PasswordConfirmationModal = ({isOpen , onClose , onSuccess , toDelete = false , toDeletedRole}) => {
    const [showPassword, setShowPassword] = useState(false);
    const {user} = useAuth();
    const userId = user?.id;

    return (
        <MyModal isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col gap-5 p-5 justify-center items-center w-[450px]'>
                <h2 className='text-lg font-semibold'>Password Verification</h2>
                <Formik
                    initialValues={{password : ''}}
                    validationSchema={validationSchema}
                    validateOnMount={true}
                    onSubmit={async (values , {setSubmitting}) => {
                        setSubmitting(true);
                        try {
                            const res = await confirmPassword(values.password , userId);
                            console.log(res);
                            if(res.status !== 200) throw new Error(res?.response?.data)
                            onClose();
                            onSuccess();
                        }catch (e) {
                            console.log(e);
                            toast.error("Internal Server Error");
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({isValid ,  values, setFieldValue, isSubmitting}) => (
                        <Form className='w-full'>
                            <div className='relative '>
                                <Lock className='absolute left-3 top-[9px] w-4.5 h-4.5 text-gray-400'/>
                                <Input
                                    value={values.password}
                                    onChange={(e) => setFieldValue('password' , e.target.value)}
                                    name="password"
                                    className='pl-10 py-2 w-full focus:outline-none rounded-sm focus:ring-0'
                                    type={showPassword ? "text" : "password"}
                                    placeholder='Enter your password'
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-5 top-[6px] w-4 h-4 text-gray-400'
                                >
                                    {showPassword ? <EyeOff/> : <Eye/>}
                                </button>
                            </div>
                            <button
                                disabled={!isValid || isSubmitting}
                                type="submit"
                                className={`${toDelete ? 'bg-red-500' : 'bg-main-green'} text-sm flex items-center justify-center w-full mt-5 text-white font-medium rounded-sm py-2 ${
                                    (!isValid || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            >
                                {isSubmitting ? (toDelete ? 'Deleting...' : 'Confirming...') : (toDelete ? `Delete ${toDeletedRole === 'patient' ? 'Patient' : 'Doctor'}` : 'Confirm Password')}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </MyModal>
    )
}

export default PasswordConfirmationModal;
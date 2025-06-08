"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelectedPersonnelStore } from '@/zustand/stores/selected-personnel-store';
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Spinner from "@/components/loading/LoadingSpinner";
import Image from "next/image";
import transition from "react-element-popper/animations/transition";
import opacity from "react-element-popper/animations/opacity";
import "react-multi-date-picker/styles/layouts/mobile.css";
import "react-multi-date-picker/styles/colors/yellow.css";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import { isoToJalali } from '@/lib/utils';
import { getAllRole } from "@/lib/services";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSecurityQuestions } from "@/lib/services";
import { Eye, EyeOff } from 'lucide-react';

type Role = {
    id: number;
    role_name: string;
};

const baseSchema = {
    name: z.string().min(2, { message: "نام باید حداقل ۲ کاراکتر باشد" }).max(20, { message: "نام نمی‌تواند بیش از ۲۰ کاراکتر باشد" }).optional(),
    familyName: z.string().min(2, { message: "نام خانوادگی باید حداقل ۲ کاراکتر باشد" }).max(30, { message: "نام خانوادگی نمی‌تواند بیش از ۳۰ کاراکتر باشد" }).optional(),
    phone: z.string().length(11, { message: "شماره تلفن باید ۱۱ رقم باشد" }).regex(/^09[0-9]{9}$/, { message: "شماره تلفن معتبر نیست" }).optional(),
    birth: z.string()
        .refine(val => {
            if (!val) return true; // Optional in edit mode
            const date = new DateObject({ date: val, calendar: persian, locale: persian_fa });
            const year = date.year;
            return year >= 1315 && year <= 1395;
        }, {
            message: "سال تولد باید بین ۱۳۱۵ تا ۱۳۹۵ باشد"
        })
        .optional(),
    salary: z.number({
        invalid_type_error: "حقوق باید عدد باشد"
    })
        .min(0, { message: "حقوق نمی‌تواند منفی باشد" })
        .max(1000000000, { message: "حقوق نمی‌تواند بیش از ۱ میلیارد ریال باشد" })
        .optional(),
    role: z.number().optional(),
    address: z.string().max(100, { message: " آدرس باید حداکثر 100 کاراکتر باشد " }).optional(),
    username: z.string()
        .min(3, "نام کاربری باید حداقل ۳ حرف باشد")
        .max(25, "نام کاربری نمی‌تواند بیش از ۲۵ حرف باشد")
        .regex(/^[a-z0-9_]+$/i, "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد و زیرخط باشد")
        .optional(),
    password: z.string()
        .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
        .max(20, "رمز عبور نمی‌تواند بیش از ۲۰ حرف باشد")
        .refine(val => !val || (/[A-Za-z]/.test(val) && /\d/.test(val)), {
            message: "رمز عبور باید شامل حروف و عدد انگلیسی باشد"
        })
        .optional(),
    question_id: z.number().optional(),
    question_answer: z.string().min(2, "پاسخ باید حداقل ۲ حرف باشد").optional()
};

// Create different schemas for edit and register modes
const createFormSchema = (isEditMode: boolean) => {
    if (!isEditMode) {
        return z.object(baseSchema);
    }

    // For edit mode, make all fields optional but keep validation if provided
    return z.object({
        name: baseSchema.name.optional(),
        familyName: baseSchema.familyName.optional(),
        phone: baseSchema.phone.optional(),
        birth: baseSchema.birth.optional(),
        salary: baseSchema.salary.optional(),
        role: baseSchema.role.optional(),
        address: baseSchema.address.optional(),
        username: baseSchema.username.optional(),
        password: z.union([
            z.literal(''), // Allow empty string (no change)
            baseSchema.password.unwrap() // Or validate if provided
        ]),
        question_id: baseSchema.question_id.optional(),
        question_answer: z.union([
            z.literal(''), // Allow empty string (no change)
            baseSchema.question_answer.unwrap() // Or validate if provided
        ])
    });
};

export default function AddPersonnel() {
    const [loading, setLoading] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const searchParams = useSearchParams();
    const { selectedPersonnel, clearSelectedPersonnel } = useSelectedPersonnelStore();
    const isEditMode = searchParams.has('edit');
    const router = useRouter();
    const [roles, setRoles] = useState<Role[] | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [securityQuestions, setSecurityQuestions] = useState<{question_id: number, question_text: string}[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const formSchema = createFormSchema(isEditMode);
    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            familyName: '',
            phone: '',
            birth: '',
            salary: undefined,
            role: undefined,
            address: '',
            username: "",
            password: "",
            question_id: undefined,
            question_answer: ""
        },
        mode: "onChange"
    });


    useEffect(() => {
        const fetchSecurityQuestions = async () => {
            setIsLoadingQuestions(true);
            try {
                const result = await getSecurityQuestions();
                if (result.success) {
                    setSecurityQuestions(result.data);
                } else {
                    toast.error(result.message || "خطایی در دریافت سوالات امنیتی رخ داده است", {
                        style: { background: "red", color: "#fff" },
                    });
                }
            } catch (error: any) {
                toast.error(error.message || "خطایی در دریافت سوالات امنیتی رخ داده است", {
                    style: { background: "red", color: "#fff" },
                });
            } finally {
                setIsLoadingQuestions(false);
            }
        };

        fetchSecurityQuestions();
    }, []);

    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true);
            try {
                const result = await getAllRole();
                if (result.success) {
                    setRoles(result.data);
                } else {
                    toast.error(result.message || "خطایی رخ داده است", {
                        style: { background: "red", color: "#fff" },
                    });
                }
            } catch (e: any) {
                toast.error(e.message || "خطایی رخ داده است", {
                    style: { background: "red", color: "#fff" },
                });
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        if (isEditMode && selectedPersonnel) {
            form.reset({
                name: selectedPersonnel.first_name,
                familyName: selectedPersonnel.last_name,
                phone: selectedPersonnel.phone,
                birth: isoToJalali(selectedPersonnel.birth_date),
                salary: Number(selectedPersonnel.salary),
                role: selectedPersonnel.role_id,
                address: selectedPersonnel.address,
                username: selectedPersonnel.username,
                password: "",
                question_id: selectedPersonnel.question_id,
                question_answer: ""
            });
        }
    }, [isEditMode, selectedPersonnel, form]);

    useEffect(() => {
        const subscription = form.watch((values) => {
            if (!isEditMode) {
                setHasChanges(true);
                return;
            }

            if (!selectedPersonnel) return;

            // Create a comparison object with the same structure as form values
            const originalValues = {
                name: selectedPersonnel.first_name,
                familyName: selectedPersonnel.last_name,
                phone: selectedPersonnel.phone,
                birth: isoToJalali(selectedPersonnel.birth_date),
                salary: Number(selectedPersonnel.salary),
                role: selectedPersonnel.role_id,
                address: selectedPersonnel.address,
                username: selectedPersonnel.username,
                question_id: selectedPersonnel.question_id,
                question_answer: ""
            };

            // Compare each field
            const hasChanged = Object.keys(originalValues).some(key => {
                const formValue = values[key as keyof typeof values];
                const originalValue = originalValues[key as keyof typeof originalValues];

                // Special handling for dates and numbers
                if (key === 'birth') {
                    return formValue !== isoToJalali(selectedPersonnel.birth_date);
                }
                if (key === 'salary') {
                    return Number(formValue) !== Number(originalValue);
                }

                return formValue !== originalValue;
            });

            // Also check if password is being changed
            const passwordChanged = isEditingPassword && values.password !== "";

            setHasChanges(hasChanged || passwordChanged);
        });

        return () => subscription.unsubscribe();
    }, [form.watch, isEditMode, selectedPersonnel, isEditingPassword]);

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            const url = isEditMode
                ? `http://localhost:3001/api/personnel/${selectedPersonnel?.id}`
                : 'http://localhost:3001/api/personnel/register';

            const method = isEditMode ? 'PUT' : 'POST';

            // Prepare the payload - only include fields that have values
            const payload: any = {};

            if (values.name) payload.first_name = values.name;
            if (values.familyName) payload.last_name = values.familyName;
            if (values.phone) payload.phone = values.phone;
            if (values.birth) payload.birth_date = values.birth;
            if (values.salary !== undefined) payload.salary = values.salary;
            if (values.role) payload.role_id = values.role;
            if (values.address) payload.address = values.address;
            if (values.username) payload.username = values.username;
            if (values.question_id) payload.question_id = values.question_id;
            if (values.question_answer) payload.question_answer = values.question_answer;

            // Only include password if it's being changed (edit mode) or in registration
            if ((isEditMode && values.password) || !isEditMode) {
                payload.password = values.password;
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || (isEditMode ? 'اطلاعات با موفقیت بروزرسانی شد' : 'ثبت نام موفقیت‌آمیز بود'), {
                    style: { background: "#31C440", color: "#fff" }
                });

                if (isEditMode) {
                    clearSelectedPersonnel();
                    router.push(`/personnel/${selectedPersonnel?.id}`);
                } else {
                    form.reset();
                    router.push("/");
                }
            } else {
                toast.error(data.message || 'خطایی رخ داده است', {
                    style: { background: "red", color: "#fff" }
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'مشکل در ارتباط با سرور', {
                style: { background: "red", color: "#fff" }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: number) => void) => {
        const value = e.target.value.replace(/,/g, '');
        if (value === '') {
            onChange(0);
            return;
        }
        if (!isNaN(Number(value))) {
            const parsedValue = parseInt(value, 10);
            if (parsedValue >= 0) {
                onChange(parsedValue);
            }
        }
    };

    const pass = form.watch("password");

    return (
        <div className="w-full min-h-screen relative flex justify-center">
            <button
                className='absolute z-40 left-2 top-2 active:scale-95 duration-300 w-20 h-10 text-sm rounded-lg bg-[var(--secondary)]'
                onClick={() => router.back()}
            >
                بازگشت
            </button>

            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/register-bg.webp"
                    alt="Login background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <div className="z-10 pt-10 flex flex-col items-center justify-center gap-5">
                <p className="md:text-4xl text-3xl text-[var(--secondary)]">
                    {isEditMode ? 'ویرایش پرسنل' : 'ثبت نام'}
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                          className="sm-plus:px-0 space-y-6 bg-secondary p-6 mb-2 rounded-xl">

                        {/* Name Field */}
                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        نام
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="text"
                                            dir="ltr"
                                            maxLength={20}
                                            className="h-11 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Family Name Field */}
                        <FormField
                            name="familyName"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        نام خانوادگی
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="text"
                                            dir="ltr"
                                            maxLength={30}
                                            className="h-11 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Phone Field */}
                        <FormField
                            name="phone"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        شماره تلفن
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="tel"
                                            dir="ltr"
                                            pattern="[0-9]*"
                                            maxLength={11}
                                            inputMode="numeric"
                                            className="h-11 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Birth Date Field */}
                        <FormField
                            name="birth"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        تاریخ تولد
                                    </div>
                                    <FormControl>
                                        <div className="h-11 w-full rounded-lg flex items-center justify-center border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                             style={{direction: "rtl"}}>
                                            <DatePicker
                                                value={
                                                    field.value
                                                        ? new DateObject({ date: field.value, calendar: persian, locale: persian_fa })
                                                        : ""
                                                }
                                                currentDate={new DateObject({ year: 1395, month: 1, day: 1, calendar: persian })}
                                                onChange={(date) => {
                                                    if (date?.isValid) {
                                                        const formatted = date.format("YYYY/MM/DD");
                                                        field.onChange(formatted);
                                                    } else {
                                                        field.onChange("");
                                                    }
                                                }}
                                                format="YYYY/MM/DD"
                                                calendar={persian}
                                                locale={persian_fa}
                                                calendarPosition="bottom-right"
                                                style={{border: 0, outline: 0}}
                                                className="rmdp-mobile yellow bg-dark"
                                                maxDate={new DateObject({
                                                    year: 1395,
                                                    month: 12,
                                                    day: 29,
                                                    calendar: persian
                                                })}
                                                minDate={new DateObject({
                                                    year: 1315,
                                                    month: 1,
                                                    day: 1,
                                                    calendar: persian
                                                })}
                                                animations={[
                                                    opacity(),
                                                    transition({
                                                        from: 40,
                                                        transition: "all 400ms cubic-bezier(0.335, 0.010, 0.030, 1.360)",
                                                    }),
                                                ]}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600"/>
                                </FormItem>
                            )}
                        />

                        {/* Salary Field */}
                        <FormField
                            name="salary"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        حقوق دریافتی (ریال)
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="text"
                                            dir="ltr"
                                            maxLength={12}
                                            value={field.value?.toLocaleString('en-US')}
                                            onChange={(e) => handleSalaryChange(e, field.onChange)}
                                            className="h-11 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Role Selection */}
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        نقش
                                    </div>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value?.toString()}
                                        defaultValue={isEditMode ? selectedPersonnel?.role_id?.toString() : undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="لطفا یک نقش انتخاب کنید" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='z-50 bg-[var(--secondary)]'>
                                            {roles?.map((role) => (
                                                <SelectItem
                                                    className='hover:bg-gray-300 duration-300 text-[var(--primary)]'
                                                    key={role.id}
                                                    value={role.id.toString()}
                                                >
                                                    {role.role_name === 'receptionist' ? "منشی" : "مربی"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* address Field */}
                        <FormField
                            name="address"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        آدرس
                                    </div>
                                    <FormControl>
                                        <textarea
                                            {...field}
                                            rows={4}
                                            maxLength={100}
                                            className=" w-full py-2 rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Authentication Section */}
                        <div className="pt-4 border-t flex flex-col gap-6 border-[var(--primary)] relative">
                            <p className="font-medium mb-4 text-[var(--primary)] absolute -top-[12px] bg-secondary right-2 ">اطلاعات احراز هویت</p>

                            <FormField
                                name="username"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="relative w-full mt-4">
                                        <div className="absolute -top-[15px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                            نام کاربری
                                        </div>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="text"
                                                dir="ltr"
                                                maxLength={25}
                                                className="h-12 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormMessage dir="rtl" className="text-red-600 text-xs" />
                                    </FormItem>
                                )}
                            />

                            {isEditMode && !isEditingPassword ? (
                                <div className="relative">
                                    <div className="absolute -top-[17px] right-2 bg-[var(--secondary)] px-1 text-lg text-[var(--primary)]">
                                        رمز عبور
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-12 border-[var(--primary)] text-[var(--primary)]"
                                        onClick={() => setIsEditingPassword(true)}
                                    >
                                        تغییر رمز عبور
                                    </Button>
                                </div>
                            ) : (
                                <FormField
                                    name="password"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="relative h-full w-full">
                                                    <div className="absolute -top-[17px] right-2 bg-[var(--secondary)] px-1 text-lg text-[var(--primary)]">
                                                        رمز عبور
                                                    </div>
                                                    <input
                                                        dir="ltr"
                                                        type={showPassword ? "text" : "password"}
                                                        {...field}
                                                        maxLength={20}
                                                        className="h-12 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                                        disabled={loading}
                                                        placeholder={isEditMode ? "رمز عبور جدید" : "رمز عبور"}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className={`absolute inset-y-0 right-3 ${pass != "" ? "flex" : "hidden"} items-center text-[var(--primary)]`}
                                                        disabled={loading}
                                                    >
                                                        {showPassword ? (
                                                            <Eye className="h-5 w-5" />
                                                        ) : (
                                                            <EyeOff className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                    {isEditMode && isEditingPassword && (
                                                        <button
                                                            type="button"
                                                            className="absolute left-2 top-2 text-xs text-red-500"
                                                            onClick={() => {
                                                                setIsEditingPassword(false);
                                                                form.setValue("password", "");
                                                            }}
                                                        >
                                                            انصراف
                                                        </button>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage dir="rtl" className="text-red-600 text-xs" />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="question_id"
                                render={({ field }) => (
                                    <FormItem className="w-full relative">
                                        <div className="absolute -top-[15px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                            سوال امنیتی
                                        </div>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            disabled={isLoadingQuestions}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-transparent border-[var(--primary)] text-[var(--primary)] max-w-60 w-full truncate" dir="rtl">
                                                    <SelectValue placeholder="سوال امنیتی را انتخاب کنید" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[var(--secondary)] border-[var(--primary)] w-full">
                                                {securityQuestions?.map((question) => (
                                                    <SelectItem
                                                        key={question.question_id}
                                                        value={question.question_id.toString()}
                                                        className="hover:bg-[var(--primary)] hover:text-[var(--secondary)] w-full"
                                                    >
                                                        {question.question_text}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="question_answer"
                                render={({ field }) => (
                                    <FormItem className="w-full relative pb-2">
                                        <div className="absolute -top-[15px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                            پاسخ سوال امنیتی
                                        </div>
                                        <FormControl>
                                            <input
                                                className="bg-transparent rounded-md p-1 w-full border-[var(--primary)] border text-[var(--primary)]"
                                                {...field}
                                                placeholder={isEditMode ? "پاسخ جدید را وارد کنید" : "پاسخ سوال امنیتی"}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            className={`h-10 w-full rounded-lg text-[var(--secondary)] bg-primary text-center text-[16px] font-semibold active:scale-95 duration-500 ${(isEditMode && !hasChanges) ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-90'}`}
                            type="submit"
                            disabled={(isEditMode && !hasChanges) || loading}
                        >
                            {loading ? <Spinner /> : isEditMode ? 'بروزرسانی اطلاعات' : 'ثبت اطلاعات'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelectedUserStore } from '@/zustand/stores/selected-user-store';
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

type Role = {
    id: number;
    role_name: string;
};

const formSchema = z.object({
    name: z.string({ required_error: "نام وارد نشده است" })
        .min(2, { message: "نام باید حداقل ۲ کاراکتر باشد" })
        .max(20, { message: "نام نمی‌تواند بیش از ۲۰ کاراکتر باشد" }),
    familyName: z.string({ required_error: "نام خانوادگی وارد نشده است" })
        .min(2, { message: "نام خانوادگی باید حداقل ۲ کاراکتر باشد" })
        .max(30, { message: "نام خانوادگی نمی‌تواند بیش از ۳۰ کاراکتر باشد" }),
    phone: z.string({ required_error: "شماره تلفن وارد نشده است" })
        .length(11, { message: "شماره تلفن باید ۱۱ رقم باشد" })
        .regex(/^09[0-9]{9}$/, { message: "شماره تلفن معتبر نیست" }),
    birth: z.string({ required_error: "تاریخ تولد وارد نشده است" }),
        // .refine(val => {
        //     if (!val) return false;
        //     const date = new DateObject({ date: val, calendar: persian });
        //     const maxDate = new DateObject({ calendar: persian }).subtract(18, 'years');
        //     const minDate = new DateObject({ calendar: persian }).subtract(100, 'years');
        //     return date <= maxDate && date >= minDate;
        // }, { message: "سن باید بین ۱۸ تا ۱۰۰ سال باشد" }),
    salary: z.number({
        required_error: "مقدار حقوق دریافتی وارد نشده است",
        invalid_type_error: "حقوق باید عدد باشد"
    })
        .min(0, { message: "حقوق نمی‌تواند منفی باشد" })
        .max(1000000000, { message: "حقوق نمی‌تواند بیش از ۱ میلیارد ریال باشد" }),
    role: z.string({ required_error: "لطفاً یک نقش را انتخاب کنید" })
});

export default function AddPersonnel() {
    const [loading, setLoading] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const searchParams = useSearchParams();
    const { selectedUser, clearSelectedUser } = useSelectedUserStore();
    const isEditMode = searchParams.has('edit');
    const router = useRouter();
    const [roles, setRoles] = useState<Role[] | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            familyName: '',
            phone: '',
            birth: '',
            salary: 0,
            role: '',
        },
        mode: "onChange"
    });

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
        if (isEditMode && selectedUser) {
            form.reset({
                name: selectedUser.first_name,
                familyName: selectedUser.last_name,
                phone: selectedUser.phone,
                birth: isoToJalali(selectedUser.birth_date)
                // salary: selectedUser.salary,
                // role: selectedUser.role
            });
        }
    }, [isEditMode, selectedUser, form]);

    useEffect(() => {
        const subscription = form.watch((values, { name }) => {
            if (!isEditMode) {
                setHasChanges(true);
                return;
            }

            if (!selectedUser) return;

            const hasChanged = (
                values.name !== selectedUser.first_name ||
                values.familyName !== selectedUser.last_name ||
                values.phone !== selectedUser.phone ||
                values.birth !== isoToJalali(selectedUser.birth_date)
                // values.salary !== selectedUser.salary ||
                // values.role !== selectedUser.role
            );

            setHasChanges(hasChanged);
        });

        return () => subscription.unsubscribe();
    }, [form.watch, isEditMode, selectedUser]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const url = isEditMode
                ? `http://localhost:3001/api/personnel/${selectedUser?.id}`
                : 'http://localhost:3001/api/personnel/register';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: values.name,
                    last_name: values.familyName,
                    phone: values.phone,
                    birth_date: values.birth,
                    salary: values.salary,
                    role: values.role,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || (isEditMode ? 'اطلاعات با موفقیت بروزرسانی شد' : 'ثبت نام موفقیت‌آمیز بود'), {
                    style: { background: "#31C440", color: "#fff" }
                });

                if (isEditMode) {
                    clearSelectedUser();
                    router.push(`/users/${selectedUser?.id}`);
                } else {
                    form.reset();
                    router.push("/");
                }
            } else {
                toast.error(data.message || 'خطایی رخ داده است', {
                    style: { background: "red", color: "#fff" }
                });
            }
        } catch (error) {
            toast.error('مشکل در ارتباط با سرور', {
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
                    {isEditMode ? 'ویرایش کاربر' : 'ثبت نام'}
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
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        تاریخ تولد
                                    </div>
                                    <FormControl>
                                        <div className="h-11 w-full rounded-lg flex items-center justify-center border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                             style={{ direction: "rtl" }}>
                                            <DatePicker
                                                value={field.value ? new DateObject({
                                                    date: field.value,
                                                    calendar: persian,
                                                    locale: persian_fa
                                                }) : ""}
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
                                                style={{ border: 0, outline: 0 }}
                                                className="rmdp-mobile yellow bg-dark"
                                                minDate={new DateObject({
                                                    calendar: persian,
                                                    date: new DateObject({ calendar: persian })
                                                        .subtract(100, "years")
                                                        .subtract(1, "day")
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
                                    <FormMessage dir="rtl" className="text-red-600" />
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
                                            value={field.value.toLocaleString('en-US')}
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                                    value={role.role_name}
                                                >
                                                    {role.role_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        <Button
                            className={`h-10 w-full rounded-lg text-[var(--secondary)] bg-primary text-center text-[16px] font-semibold active:scale-95 duration-500 ${
                                (isEditMode && !hasChanges) ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-90'
                            }`}
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
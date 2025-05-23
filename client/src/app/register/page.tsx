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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Spinner from "@/components/loading/LoadingSpinner";
import Image from "next/image";
import transition from "react-element-popper/animations/transition"
import opacity from "react-element-popper/animations/opacity"
import "react-multi-date-picker/styles/layouts/mobile.css"
import "react-multi-date-picker/styles/colors/yellow.css"
import "react-multi-date-picker/styles/backgrounds/bg-dark.css"
import { isoToJalali } from '@/lib/utils'


export default function Register() {
    const [loading, setLoading] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const searchParams = useSearchParams();
    const { selectedUser, clearSelectedUser } = useSelectedUserStore();
    const isEditMode = searchParams.has('edit');
    const router = useRouter();
    console.log(selectedUser);


    const formSchema = z.object({
        name: z.string({ required_error: "نام وارد نشده است" }),
        familyName: z.string({ required_error: "نام خانوادگی وارد نشده است" }),
        phone: z.string({ required_error: "شماره تلفن وارد نشده است" })
            .min(11, { message: "شماره تلفن باید ۱۱ رقم باشد" })
            .regex(/^[0-9]+$/, { message: "شماره تلفن فقط باید شامل اعداد باشد" }),
        birth: z
            .string({ required_error: "تاریخ تولد وارد نشده است" })
            // .refine(val => {
            //     if (!val) return false;
            //     const date = new DateObject({ date: val, calendar: persian });
            //     const maxDate = new DateObject({ calendar: persian }).subtract(10, 'years');
            //     const minDate = new DateObject({ calendar: persian }).subtract(100, 'years');
            //     return date <= maxDate && date >= minDate;
            // }, {
            //     message: "سن کاربر باید بین ۱۰ تا ۱۰۰ سال باشد"
            // })
            ,
        weight: z.preprocess(
            (val) => Number(val) || undefined,
            z.number({ invalid_type_error: "وزن باید عدد باشد" })
                .min(1, { message: "وزن باید بزرگ‌تر از ۰ باشد" })
                .max(250, { message: "وزن نمی‌تواند بیشتر از ۳ رقم باشد" })
                .optional()
        ),
        height: z.preprocess(
            (val) => Number(val) || undefined,
            z.number({ invalid_type_error: "قد باید عدد باشد" })
                .min(50, { message: "قد باید حداقل ۵۰ سانتیمتر باشد" })
                .max(250, { message: "قد نمی‌تواند بیشتر از ۳ رقم باشد" })
                .optional()
        ),
        gender: z.enum(["male", "female"], { required_error: "جنسیت انتخاب نشده است" }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            familyName: '',
            phone: '',
            birth: '',
            weight: undefined,
            height: undefined,
            gender: 'male'
        },
        mode: "onChange"
    });

    // Initialize form with user data in edit mode
    useEffect(() => {
        if (isEditMode && selectedUser) {
            form.reset({
                name: selectedUser.first_name,
                familyName: selectedUser.last_name,
                phone: selectedUser.phone,
                birth: isoToJalali(selectedUser.birth_date),
                weight: selectedUser.weight_kg,
                height: selectedUser.height_cm,
                gender: selectedUser.gender
            });
        }
    }, [isEditMode, selectedUser, form]);

    // Check for form changes
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
                values.birth !== selectedUser.birth_date ||
                values.weight !== selectedUser.weight_kg ||
                values.height !== selectedUser.height_cm ||
                values.gender !== selectedUser.gender
            );

            setHasChanges(hasChanged);
        });

        return () => subscription.unsubscribe();
    }, [form.watch, isEditMode, selectedUser]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        console.log('values', values);


        try {
            const url = isEditMode
                ? `http://localhost:3001/api/user/${selectedUser?.id}`
                : 'http://localhost:3001/api/user/register';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: values.name,
                    last_name: values.familyName,
                    phone: values.phone,
                    birth_date: values.birth,
                    weight_kg: values.weight,
                    height_cm: values.height,
                    gender: values.gender,
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="sm-plus:px-0 space-y-6 bg-secondary p-6 mb-2 rounded-xl">
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
                                        <div className="h-11 w-full rounded-lg flex items-center justify-center border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0" style={{ direction: "rtl" }}>
                                            <DatePicker
                                                value={field.value ? new DateObject({ date: field.value, calendar: persian, locale: persian_fa }) : ""}
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
                                                // maxDate={new DateObject({ calendar: persian }).subtract(10, 'years')}
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

                        {/* Weight Field */}
                        <FormField
                            name="weight"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        وزن (کیلو گرم)
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="number"
                                            dir="ltr"
                                            min={0}
                                            max={250}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className="h-11 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Height Field */}
                        <FormField
                            name="height"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        قد (سانتی متر)
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="number"
                                            dir="ltr"
                                            min={0}
                                            max={250}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className="h-11 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Gender Field */}
                        <FormField
                            name="gender"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-end w-full">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="text-[var(--primary)]">جنسیت :</div>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex items-center"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="male" id="r1" />
                                                    <Label htmlFor="r1">مذکر</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="female" id="r2" />
                                                    <Label htmlFor="r2">مونث</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                    </div>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        <Button
                            className={`h-10 w-full rounded-lg text-[var(--secondary)] bg-primary text-center text-[16px] font-semibold active:scale-95 duration-500 ${(isEditMode && !hasChanges) ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-90'
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
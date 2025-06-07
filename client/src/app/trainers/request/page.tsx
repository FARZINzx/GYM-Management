"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Define service types
const services = [
  { value: "bodybuilding", label: "بدنسازی" },
  { value: "aerobic", label: "هوازی" },
  { value: "nutrition", label: "تغذیه" },
  { value: "yoga", label: "یوگا" },
  { value: "crossfit", label: "کراس فیت" },
] as const

// Define experience levels
const experienceLevels = [
  { value: "beginner", label: "تازه کار" },
  { value: "intermediate", label: "متوسط" },
  { value: "advanced", label: "پیشرفته" },
] as const

export default function RequestTrainer() {
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [openServices, setOpenServices] = useState(false)
    const [selectedServices, setSelectedServices] = useState<string[]>([])

    const formSchema = z.object({
        name: z.string({ required_error: "نام وارد نشده است" }).min(2, "نام باید حداقل ۲ حرف باشد"),
        phone: z.string({ required_error: "شماره تلفن وارد نشده است" })
            .min(11, { message: "شماره تلفن باید ۱۱ رقم باشد" })
            .regex(/^[0-9]+$/, { message: "شماره تلفن فقط باید شامل اعداد باشد" }),
        age: z.preprocess(
            (val) => Number(val) || undefined,
            z.number({ invalid_type_error: "سن باید عدد باشد" })
                .min(18, { message: "حداقل سن ۱۸ سال است" })
                .max(80, { message: "حداکثر سن ۸۰ سال است" })
        ),
        gender: z.enum(["male", "female"], { required_error: "جنسیت انتخاب نشده است" }),
        experienceLevel: z.string({ required_error: "سطح تجربه انتخاب نشده است" }),
        services: z.array(z.string()).min(1, "حداقل یک سرویس باید انتخاب شود"),
        goals: z.string().min(10, "اهداف شما باید حداقل ۱۰ حرف باشد").max(500, "اهداف شما نمی‌تواند بیشتر از ۵۰۰ حرف باشد"),
        preferredDays: z.array(z.string()).min(1, "حداقل یک روز باید انتخاب شود"),
        preferredTime: z.string({ required_error: "زمان ترجیحی انتخاب نشده است" }),
        address: z.string().min(10, "آدرس باید حداقل ۱۰ حرف باشد").optional()
    });

    // Days of the week
    const daysOfWeek = [
        { value: "saturday", label: "شنبه" },
        { value: "sunday", label: "یکشنبه" },
        { value: "monday", label: "دوشنبه" },
        { value: "tuesday", label: "سه‌شنبه" },
        { value: "wednesday", label: "چهارشنبه" },
        { value: "thursday", label: "پنجشنبه" },
        { value: "friday", label: "جمعه" },
    ] as const

    // Preferred times
    const preferredTimes = [
        { value: "morning", label: "صبح (۸-۱۲)" },
        { value: "afternoon", label: "ظهر (۱۲-۱۶)" },
        { value: "evening", label: "عصر (۱۶-۲۰)" },
        { value: "night", label: "شب (۲۰-۲۴)" },
    ] as const

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            phone: '',
            age: undefined,
            gender: 'male',
            experienceLevel: '',
            services: [],
            goals: '',
            preferredDays: [],
            preferredTime: '',
            address: ''
        },
        mode: "onChange"
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/trainer-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: values.name,
                    phone: values.phone,
                    age: values.age,
                    gender: values.gender,
                    experience_level: values.experienceLevel,
                    services: values.services,
                    goals: values.goals,
                    preferred_days: values.preferredDays,
                    preferred_time: values.preferredTime,
                    address: values.address
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('درخواست مربی با موفقیت ثبت شد', {
                    style: { background: "#31C440", color: "#fff" }
                });
                form.reset();
                setSelectedServices([]);
                router.push("/");
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

            <div className="z-10 pt-10 flex flex-col items-center justify-center gap-5 w-full max-w-md px-4">
                <p className="md:text-4xl text-3xl text-[var(--secondary)]">
                    درخواست مربی شخصی
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 bg-secondary p-6 mb-2 rounded-xl">
                        {/* Name Field */}
                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        نام و نام خانوادگی
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="text"
                                            dir="ltr"
                                            maxLength={50}
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

                        {/* Age Field */}
                        <FormField
                            name="age"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        سن
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="number"
                                            dir="ltr"
                                            min={18}
                                            max={80}
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

                        {/* Experience Level Field */}
                        <FormField
                            name="experienceLevel"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-end w-full">
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <div className="text-[var(--primary)]">سطح تجربه :</div>
                                    </div>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="grid grid-cols-3 gap-2"
                                        >
                                            {experienceLevels.map((level) => (
                                                <div key={level.value} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={level.value} id={level.value} />
                                                    <Label htmlFor={level.value}>{level.label}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Services Field */}
                        <FormField
                            control={form.control}
                            name="services"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <div className="text-[var(--primary)] mb-2">سرویس‌های مورد نیاز:</div>
                                    <Popover open={openServices} onOpenChange={setOpenServices}>
                                        <PopoverTrigger asChild className="bg-secondary"> 
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openServices}
                                                    className="w-full justify-between border-[var(--primary)] text-[var(--primary)]"
                                                >
                                                    {selectedServices.length > 0
                                                        ? selectedServices.map(service => 
                                                            services.find(s => s.value === service)?.label
                                                        ).join(", ")
                                                        : "سرویس‌ها را انتخاب کنید"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0 bg-secondary">
                                            <Command>
                                                <CommandInput placeholder="جستجوی سرویس..." />
                                                <CommandEmpty>سرویس یافت نشد</CommandEmpty>
                                                <CommandGroup>
                                                    {services.map((service) => (
                                                        <CommandItem
                                                            key={service.value}
                                                            onSelect={() => {
                                                                const newSelected = selectedServices.includes(service.value)
                                                                    ? selectedServices.filter(item => item !== service.value)
                                                                    : [...selectedServices, service.value]
                                                                setSelectedServices(newSelected)
                                                                field.onChange(newSelected)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedServices.includes(service.value)
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {service.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedServices.map(service => (
                                            <Badge 
                                                key={service} 
                                                variant="secondary"
                                                className="text-[var(--primary)] border-[var(--primary)]"
                                            >
                                                {services.find(s => s.value === service)?.label}
                                            </Badge>
                                        ))}
                                    </div>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Goals Field */}
                        <FormField
                            name="goals"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        اهداف و انتظارات شما
                                    </div>
                                    <FormControl>
                                        <textarea
                                            {...field}
                                            dir="rtl"
                                            rows={4}
                                            maxLength={500}
                                            className="w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 py-2 text-[var(--primary)] outline-0"
                                            placeholder="اهداف خود از کار با مربی و انتظاراتتان را بنویسید..."
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Preferred Days Field */}
                        <FormField
                            control={form.control}
                            name="preferredDays"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <div className="text-[var(--primary)] mb-2">روزهای ترجیحی برای تمرین:</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {daysOfWeek.map((day) => (
                                            <div key={day.value} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={day.value}
                                                    checked={field.value?.includes(day.value)}
                                                    onChange={(e) => {
                                                        const newValue = e.target.checked
                                                            ? [...(field.value || []), day.value]
                                                            : field.value?.filter((v) => v !== day.value) || []
                                                        field.onChange(newValue)
                                                    }}
                                                    className="h-4 w-4 rounded border-[var(--primary)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                                />
                                                <Label htmlFor={day.value}>{day.label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Preferred Time Field */}
                        <FormField
                            name="preferredTime"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-end w-full">
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <div className="text-[var(--primary)]">زمان ترجیحی برای تمرین :</div>
                                    </div>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="grid grid-cols-2 gap-2"
                                        >
                                            {preferredTimes.map((time) => (
                                                <div key={time.value} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={time.value} id={time.value} />
                                                    <Label htmlFor={time.value}>{time.label}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        {/* Address Field */}
                        <FormField
                            name="address"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="relative w-full">
                                    <div className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        آدرس (اختیاری)
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="text"
                                            dir="rtl"
                                            maxLength={200}
                                            className="h-11 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                            placeholder="در صورت تمایل به تمرین در منزل"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600" />
                                </FormItem>
                            )}
                        />

                        <Button
                            className="h-10 w-full rounded-lg text-[var(--secondary)] bg-primary text-center text-[16px] font-semibold active:scale-95 duration-500 hover:brightness-90"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? <Spinner /> : 'ثبت درخواست مربی'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
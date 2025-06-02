"use client";
import React, {useEffect, useState} from "react";
//utils
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import toast from "react-hot-toast";
import {toggleFullScreen} from "@/lib/utils";
import { formatToPersianCurrency } from "@/lib/utils";
import {createService} from "@/lib/services";
//component
import Header from "@/components/ui/header";
//service
import {getAllServices} from "@/lib/services";
//type
import {GymService} from '@/data/type'
//icon
import {Dumbbell, Bike, Beef, HeartPulse} from 'lucide-react';

// Define validation schema
const serviceSchema = z.object({
    name: z.string()
        .min(2, "نام خدمت باید حداقل ۲ حرف باشد")
        .max(30, "نام خدمت نمی‌تواند بیش از 30 حرف باشد"),
    cost: z.number()
        .min(1000, "مبلغ خدمت باید حداقل ۱,۰۰۰ ریال باشد")
        .max(10000000, "مبلغ خدمت نمی‌تواند بیش از ۱۰,۰۰۰,۰۰۰ ریال باشد"),
    icon: z.string().min(1, "لطفاً یک آیکون انتخاب کنید")
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

const icons = [
    {name: "Dumbbell", component: <Dumbbell size={24}/>, label: 'بدنسازی'},
    {name: "Bike", component: <Bike size={24}/>, label: 'دوچرخه'},
    {name: "Beef", component: <Beef size={24}/>, label: 'گوشت'},
    {name: "HeartPulse", component: <HeartPulse size={24}/>, label: 'آزمایش'}
];

const IconPicker = ({
                        selectedIcon,
                        onIconSelect
                    }: {
    selectedIcon: string,
    onIconSelect: (iconName: string) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <div
                className="w-full h-11 rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] flex items-center justify-between cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedIcon ? (
                    <div className="flex items-center gap-2">
                        {icons.find(icon => icon.label === selectedIcon)?.component}
                        <span>{icons.find(icon => icon.label === selectedIcon)?.label}</span>
                    </div>
                ) : (
                    <span className="text-gray-600 text-xs">آیکون را انتخاب کنید</span>
                )}
                <span className="text-[var(--primary)] text-x font-bold ">{isOpen ? '↑' : '↓'}</span>
            </div>

            {isOpen && (
                <div
                    className="absolute z-10 mt-1 w-full bg-[var(--secondary)] border border-[var(--primary)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2 p-2">
                        {icons.map((icon) => (
                            <div
                                key={icon.name}
                                className={`p-2 rounded-md flex flex-col items-center cursor-pointer hover:bg-[var(--primary)] hover:text-[var(--secondary)] ${
                                    selectedIcon === icon.name ? 'bg-[var(--primary)] text-[var(--secondary)]' : 'text-[var(--primary)]'
                                }`}
                                onClick={() => {
                                    onIconSelect(icon.label);
                                    setIsOpen(false);
                                }}
                            >
                                {icon.component}
                                <span className="text-xs mt-1">{icon.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


export default function Services() {
    const router = useRouter();
    const [services, setServices] = useState<GymService[] | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
        watch,
        setValue,
        reset
    } = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: "",
            cost: 0,
            icon: ""
        }
    });

    const fetchServices = async () => {
        setIsLoading(true)
        try {
            const response = await getAllServices()
            setServices(response.data)
            setIsLoading(false)

        } catch (e: any) {
            toast.error(e.message || "خطایی رخ داده است", {
                style: {background: "red", color: "#fff"},
            });
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (data: ServiceFormValues) => {
        const result = await createService({
            name: data.name,
            amount: data.cost,
            icon: data.icon
        });

        if (result.success) {
            toast.success(result.data.message || "خدمت با موفقیت ثبت شد", {
                style: {background: "#31C440", color: "#fff"}
            });
            fetchServices()
            reset()
        } else {
            toast.error(result.message || "خطایی در ثبت خدمت رخ داد", {
                style: {background: "red", color: "#fff"}
            });
        }
    };
    // Handle numeric input for cost
    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericString = e.target.value.replace(/[^0-9]/g, '');
        const numericValue = numericString ? parseInt(numericString, 10) : 0;
        setValue('cost', numericValue, {shouldValidate: true});
    };


    useEffect(() => {
        fetchServices()
    }, []);

    const handleIconSelect = (iconName: string) => {
        setValue('icon', iconName, {shouldValidate: true});
    };

    return (
        <main
            className="min-h-screen bg-[var(--primary)]"
            onClick={() => toggleFullScreen()}
        >
            <div className="max-w-[430px] mx-auto relative">
                <Header type="filter"/>
                <div className="flex flex-col gap-6 mx-auto px-6">
                    <h2 className="text-3xl text-[var(--secondary)] text-center border-b border-[var(--secondary)] pb-2">
                        خدمات
                    </h2>

                    <div className='flex flex-col items-center gap-3'>
                        <div className='w-full bg-[var(--secondary)] p-4 rounded-lg shadow'>
                            <div className='flex items-center gap-2 mb-4'>
                                <Dumbbell size={25} className="text-[var(--primary)]"/>
                                <p className='font-bold  text-[var(--primary)]'>اضافه کردن خدمت جدید</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                                {/* Service Name Field */}
                                <div className='relative'>
                                    <input
                                        {...register("name")}
                                        type='text'
                                        minLength={2}
                                        maxLength={30}
                                        className={`w-full h-10 rounded-lg border ${errors.name ? 'border-red-500' : 'border-[var(--primary)]'} bg-transparent px-3 text-[var(--primary)] outline-none`}

                                    />
                                    <label className='absolute -top-2 right-2 px-1 bg-[var(--secondary)] text-sm'>
                                        نام خدمت
                                    </label>
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1 text-right">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                {/* Service Cost Field */}
                                <div className='relative'>
                                    <input
                                        {...register("cost", {
                                            valueAsNumber: true,
                                            setValueAs: (value) => value === "" ? 0 : parseInt(value.replace(/[^0-9]/g, ''), 10)
                                        })}
                                        onChange={handleCostChange}
                                        // value={watch('cost') === 0 ? "" : watch('cost').toLocaleString('en-UK')}
                                        minLength={4}
                                        maxLength={12}
                                        className={`w-full h-10 rounded-lg border ${errors.cost ? 'border-red-500' : 'border-[var(--primary)]'} bg-transparent px-3 text-[var(--primary)] outline-none`}
                                    />
                                    <label className='absolute -top-2 right-2 px-1 bg-[var(--secondary)] text-sm'>
                                        مبلغ خدمت (ریال)
                                    </label>
                                    {/*{!errors.cost && watch('cost') !== 0 && <div*/}
                                    {/*    className="absolute right-3 -bottom-7 -translate-y-1/2 text-[var(--primary)] text-xs">*/}
                                    {/*    {formatToPersianCurrency(watch('cost'))}تومان*/}
                                    {/*</div>}*/}
                                    {errors.cost && (
                                        <p className="text-red-500 text-xs mt-1 text-right">
                                            {errors.cost.message}
                                        </p>
                                    )}
                                </div>
                                <div className='relative'>
                                    <input type="hidden" {...register("icon")} />
                                    <label className='absolute -top-2 right-2 px-1 bg-secondary text-sm z-10'>
                                        آیکون خدمت
                                    </label>
                                    <IconPicker
                                        selectedIcon={watch("icon")}
                                        onIconSelect={handleIconSelect}
                                    />
                                    {errors.icon && (
                                        <p className="text-red-500 text-xs mt-1 text-right">
                                            {errors.icon.message}
                                        </p>
                                    )}
                                </div>
                                <div className='flex justify-end gap-3 pt-2'>
                                    <button
                                        type='button'
                                        onClick={() => router.push('/')}
                                        className='w-24 h-9 font-medium rounded-lg border border-[var(--primary)] text-[var(--primary)] active:scale-95 duration-300'
                                    >
                                        انصراف
                                    </button>
                                    <button
                                        type='submit'
                                        disabled={isSubmitting}
                                        className='w-24 h-9 font-medium rounded-lg bg-[var(--primary)] text-[var(--secondary)] active:scale-95 duration-300 disabled:opacity-50'
                                    >
                                        {isSubmitting ? 'در حال ثبت...' : 'ثبت خدمت'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        {
                            isLoading
                                ? Array.from({length: 4}).map((_: any, index: number) => (
                                    <div key={index} className='w-full rounded-md h-20 bg-gray-500 animate-pulse'></div>
                                ))
                                : services && services.length > 0
                                    ? (
                                        services.map((service) => (
                                            <div key={service.service_id}
                                                 className='w-full h-full bg-[var(--secondary)] p-4 rounded-lg shadow flex items-center justify-between'>
                                                <div className='text-2xl'>{icons.find(icon => icon.label === service.icon)?.component &&
                                                    React.cloneElement(
                                                        icons.find(icon => icon.label === service.icon)!.component,
                                                        { size: 31 } // Set your desired size here
                                                    )
                                                }</div>
                                                    <p className='font-semibold truncate max-w-28 '>{service.name}</p>
                                                <div className='flex h-full items-end justify-center'>
                                                    <p className='font-semibold'>{formatToPersianCurrency(service.amount)} <span className='text-xs' >ریال</span></p>
                                                </div>
                                            </div>
                                        ))
                                    )
                                    : <div className='h-full w-full flex justify-center items-center'>
                                        <p className='text-secondary font-bold text-center'>خدمتی وجود ندارد</p>
                                    </div>
                        }
                    </div>
                </div>
            </div>
        </main>
    );
}
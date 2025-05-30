"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dumbbell } from 'lucide-react';
import Header from "@/components/ui/header";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { toggleFullScreen } from "@/lib/utils";
// import { formatToPersianCurrency } from "@/lib/utils";
import {createService} from "@/lib/services";

// Define validation schema
const serviceSchema = z.object({
    name: z.string()
        .min(2, "نام خدمت باید حداقل ۲ حرف باشد")
        .max(30, "نام خدمت نمی‌تواند بیش از 30 حرف باشد"),
    cost: z.number()
        .min(1000, "مبلغ خدمت باید حداقل ۱,۰۰۰ ریال باشد")
        .max(10000000, "مبلغ خدمت نمی‌تواند بیش از ۱۰,۰۰۰,۰۰۰ ریال باشد")
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function Services() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue} = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: "",
            cost: 0
        }
    });

    const onSubmit = async (data: ServiceFormValues) => {
        const result = await createService({
            name: data.name,
            amount: data.cost
        });

        if (result.success) {
            toast.success(result.data.message || "خدمت با موفقیت ثبت شد", {
                style: { background: "#31C440", color: "#fff" }
            });
            router.push('/services');
        } else {
            toast.error(result.message || "خطایی در ثبت خدمت رخ داد", {
                style: { background: "red", color: "#fff" }
            });
        }
    };
    // Handle numeric input for cost
    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericString = e.target.value.replace(/[^0-9]/g, '');
        const numericValue = numericString ? parseInt(numericString, 10) : 0;
        setValue('cost', numericValue, { shouldValidate: true });
    };

    return (
        <main
            className="min-h-screen bg-[var(--primary)]"
            onClick={() => toggleFullScreen()}
        >
            <div className="max-w-[430px] mx-auto relative">
                <Header type="filter" />
                <div className="flex flex-col gap-6 mx-auto px-6">
                    <h2 className="text-3xl text-[var(--secondary)] text-center border-b border-[var(--secondary)] pb-2">
                        خدمات
                    </h2>

                    <div className='flex flex-col items-center gap-3'>
                        <div className='w-full bg-[var(--secondary)] p-4 rounded-lg shadow'>
                            <div className='flex items-center gap-2 mb-4'>
                                <Dumbbell size={25} className="text-[var(--primary)]" />
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
                    </div>
                </div>
            </div>
        </main>
    );
}
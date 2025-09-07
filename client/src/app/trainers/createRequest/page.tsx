"use client";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import toast from "react-hot-toast";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import Spinner from "@/components/loading/LoadingSpinner";
import Image from "next/image";
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
import {Check, ChevronsUpDown} from "lucide-react"
import {cn} from "@/lib/utils"
import {Badge} from "@/components/ui/badge"
import {getCookie} from "@/action/cookie";

// Define service types - these should match your service_types table in the database
const services = [
    {id: 1, name: "Bodybuilding", label: "بدنسازی"},
    {id: 2, name: "Aerobic", label: "هوازی"},
    {id: 3, name: "Nutrition", label: "تغذیه"},
] as const

export default function RequestTrainer() {
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [open, setOpen] = useState(false)
    const [selectedServices, setSelectedServices] = useState<number[]>([])

    const [id, setId] = useState<string>('')

    useEffect(() => {
        const fetchId = async () => {
            const idCookie = await getCookie('id')
            setId(idCookie || '')
        }
        if (!id) {
            fetchId()
        }

    }, [id])

    const formSchema = z.object({
        client_phone: z.string({required_error: "شماره تلفن وارد نشده است"})
            .min(11, {message: "شماره تلفن باید ۱۱ رقم باشد"})
            .regex(/^09[0-9]+$/, {message: "شماره تلفن باید با 09 شروع شود و فقط شامل اعداد باشد"})
            .regex(/^[0-9]+$/, {message: "شماره تلفن فقط باید شامل اعداد باشد"}),
        services: z.array(z.number()).min(1, "حداقل یک سرویس باید انتخاب شود"),
        notes: z.string().optional()
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_phone: '',
            services: [],
            notes: ''
        },
        mode: "onChange"
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/client-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_phone: values.client_phone,
                    services: values.services,
                    notes: values.notes,
                    created_by: id
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'درخواست با موفقیت ایجاد شد', {
                    style: {background: "#31C440", color: "#fff"}
                });
                form.reset();
                setSelectedServices([]);
                router.push("/"); // Or wherever you want to redirect
            } else {
                toast.error(data.message || 'خطایی در خواست رخ داده است', {
                    style: {background: "red", color: "#fff", fontSize: "14px"}
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'مشکل در ارتباط با سرور', {
                style: {background: "red", color: "#fff"}
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
                    ایجاد درخواست جدید
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                          className="sm-plus:px-0 space-y-6 bg-secondary p-6 mb-2 rounded-xl">
                        {/* Phone Field */}
                        <FormField
                            name="client_phone"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="relative w-full">
                                    <div
                                        className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        شماره تلفن مشتری
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="tel"
                                            dir="ltr"
                                            pattern="09[0-9]*"
                                            maxLength={11}
                                            inputMode="numeric"
                                            onInput={(e) => {
                                                if (!e.currentTarget.value.startsWith('09')) {
                                                    e.currentTarget.value = '09' + e.currentTarget.value.replace(/[^0-9]/g, '').substring(2);
                                                } else {
                                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                                }
                                            }}
                                            className="h-11 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600"/>
                                </FormItem>
                            )}
                        />

                        {/* Notes Field */}
                        <FormField
                            name="notes"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="relative w-full">
                                    <div
                                        className="absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]">
                                        توضیحات (اختیاری)
                                    </div>
                                    <FormControl>
                                        <textarea
                                            {...field}
                                            maxLength={150}
                                            dir="rtl"
                                            className="h-20 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 py-2 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600"/>
                                </FormItem>
                            )}
                        />

                        {/* Services Field */}
                        <FormField
                            control={form.control}
                            name="services"
                            render={({field}) => (
                                <FormItem className="flex flex-col">
                                    <div className="text-[var(--primary)]">سرویس‌های مورد نیاز:</div>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild className="bg-secondary">
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open}
                                                    className="w-full justify-between border-[var(--primary)] text-[var(--primary)]"
                                                >
                                                    {selectedServices.length > 0
                                                        ? selectedServices.map(serviceId =>
                                                            services.find(s => s.id === serviceId)?.label
                                                        ).join(", ")
                                                        : "سرویس‌ها را انتخاب کنید"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0 bg-secondary">
                                            <Command>
                                                <CommandInput placeholder="جستجوی سرویس..."/>
                                                <CommandEmpty>سرویس یافت نشد</CommandEmpty>
                                                <CommandGroup>
                                                    {services.map((service) => (
                                                        <CommandItem
                                                            key={service.id}
                                                            onSelect={() => {
                                                                const newSelected = selectedServices.includes(service.id)
                                                                    ? selectedServices.filter(id => id !== service.id)
                                                                    : [...selectedServices, service.id]
                                                                setSelectedServices(newSelected)
                                                                field.onChange(newSelected)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedServices.includes(service.id)
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
                                        {selectedServices.map(serviceId => (
                                            <Badge
                                                key={serviceId}
                                                variant="secondary"
                                                className="text-[var(--primary)] border-[var(--primary)]"
                                            >
                                                {services.find(s => s.id === serviceId)?.label}
                                            </Badge>
                                        ))}
                                    </div>
                                    <FormMessage dir="rtl" className="text-red-600"/>
                                </FormItem>
                            )}
                        />

                        <Button
                            className="h-10 w-full rounded-lg text-[var(--secondary)] bg-primary text-center text-[16px] font-semibold active:scale-95 duration-500 hover:brightness-90"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? <Spinner/> : 'ثبت درخواست'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
"use client";
import Image from "next/image";
import {useState} from "react";
//form
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
//shadCn
import {Button} from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
//utils
import Spinner from "@/components/loading/LoadingSpinner";
import {useRouter} from "next/navigation";
// import {toggleFullScreen} from "@/lib/utils";
import toast from "react-hot-toast";
//icon

export default function Register() {
    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

    const formSchema = z.object({
        name: z.string({required_error: "نام وارد نشده است"}),
        familyName: z.string({required_error: "نام خانوادگی وارد نشده است"}),
        phone: z
            .string({required_error: "شماره تلفن وارد نشده است"})
            .min(11, {message: "شماره تلفن باید ۱۱ رقم باشد"})
            .regex(/^[0-9]+$/, {message: "شماره تلفن فقط باید شامل اعداد باشد"}),
        age: z
            .number({
                required_error: "سن وارد نشده است",
                invalid_type_error: "سن باید عدد باشد",
            })
            .min(10, {message: "سن باید بزرگتر از ۱۰ باشد"})
            .max(120, {message: "سن نمی‌تواند بیشتر از ۱۲۰ باشد"}),
        weight: z
            .string({
                required_error: "وزن وارد نشده است"
            }),
        height: z
            .string({
                required_error: "قد وارد نشده است"
            }),
        gender: z.enum(["male", "female"], {
            required_error: "جنسیت انتخاب نشده است",
        }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            familyName: '',
            phone: '',
            age: 0,
            weight: '',
            height: '',
            gender: 'male' // or 'female' as default
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: values.name,
                    last_name: values.familyName,
                    phone: values.phone,
                    age: values.age,
                    weight_kg: Number(values.weight),
                    height_cm: Number(values.height),
                    gender: values.gender,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'ثبت نام موفقیت‌آمیز بود', {
                    style: {
                        background: "#31C440",
                        color: "#fff",
                    },
                    duration: 2000
                });
                form.reset();
                toast.promise(new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(true)
                        router.push("");
                    }, 1500)
                }), {
                    loading: 'در حال بازگشت به صفحه اصلی...',
                });

            } else {
                toast.error(data.message || 'خطایی رخ داده است', {
                    style: {
                        background: "red",
                        color: "#fff",
                    }
                });
            }
        } catch (error) {
            toast.error('مشکل در ارتباط با سرور', {
                style: {
                    background: "red",
                    color: "#fff",
                }
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    //   useEffect(() => {
    //     const handleFullScreen = () => {
    //       toggleFullScreen();
    //     };

    //     document.addEventListener("click", handleFullScreen);

    //     return () => {
    //       document.removeEventListener("click", handleFullScreen);
    //     };
    //   }, []);

    return (
        <div className="w-full min-h-screen relative flex justify-center relative">
            <button className='absolute z-40 left-2 top-2 active:scale-95 duration-300 w-20 h-10 text-sm  rounded-lg bg-[var(--secondary)]'
                    onClick={() => router.back()}>بازگشت
            </button>
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/register-bg.webp"
                    alt="Login background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
            <div className="z-10 flex flex-col items-center justify-center gap-5 ">
                <p className="md:text-4xl text-3xl text-[var(--secondary)]">ثبت نام</p>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="sm-plus:px-0 space-y-6 bg-secondary p-6 rounded-xl"
                    >
                        <FormField
                            name="name"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="relative w-full">
                                    <div
                                        className={`absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]`}
                                    >
                                        نام
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="text"
                                            dir="ltr"
                                            className="h-12 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600"/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="familyName"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="relative w-full">
                                    <div
                                        className={`absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]`}
                                    >
                                        نام خانوادگی
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="text"
                                            dir="ltr"
                                            className="h-12 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600"/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="phone"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="relative w-full">
                                    <div
                                        className={`absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]`}
                                    >
                                        شماره تلفن
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="tel"
                                            dir="ltr"
                                            pattern="[0-9]*"
                                            inputMode="numeric"
                                            className="h-12 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600"/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="age"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="relative w-full">
                                    <div
                                        className={`absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]`}
                                    >
                                        سن
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="number"
                                            dir="ltr"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            className="h-12 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600"/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="weight"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="relative w-full">
                                    <div
                                        className={`absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]`}
                                    >
                                        وزن (کیلو گرم)
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="number"
                                            dir="ltr"
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className="h-12 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600"/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="height"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="relative w-full">
                                    <div
                                        className={`absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]`}
                                    >
                                        قد (سانتی متر)
                                    </div>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="number"
                                            dir="ltr"
                                            min="50"
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className="h-12 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                                        />
                                    </FormControl>
                                    <FormMessage dir="rtl" className="text-red-600"/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="gender"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="flex flex-col items-end w-full">
                                    <div className="flex items-center justify-between w-full flex-row-reverse">
                                        <div className={`text-[var(--primary)]`}>: جنسیت</div>
                                        <FormControl>
                                            <RadioGroup
                                                {...field}
                                                onValueChange={field.onChange}
                                                value={field.value || ""}
                                                className="flex items-center flex-row-reverse"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="male" id="r1"/>
                                                    <Label htmlFor="r1">مذکر</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="female" id="r2"/>
                                                    <Label htmlFor="r2">مونث</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                    </div>
                                    <FormMessage dir="rtl" className="text-red-600"/>
                                </FormItem>
                            )}
                        />
                        <Button
                            className="h-10 w-full rounded-lg text-[var(--secondary)] bg-primary text-center text-[16px] font-semibold hover:brightness-90 active:scale-95 duration-500"
                            type="submit"
                        >
                            {loading ? <Spinner/> : "ثبت اطلاعات"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

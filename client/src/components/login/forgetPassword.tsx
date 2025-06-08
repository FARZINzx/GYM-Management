"use client"

import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerClose
} from "@/components/ui/drawer"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {CircleX} from 'lucide-react'
import {useEffect, useState} from "react"
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";

// Schemas for validation
const forgotPasswordSchema = z.object({
    username: z.string().min(1, "نام کاربری را وارد کنید"),
    answer: z.string().optional()
})

const passwordResetSchema = z.object({
    newPassword: z.string()
        .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
        .regex(/[A-Za-z]/, "رمز عبور باید شامل حروف باشد")
        .regex(/\d/, "رمز عبور باید شامل عدد باشد")
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
type PasswordResetFormValues = z.infer<typeof passwordResetSchema>

function PasswordResetForm({ userId, onSuccess }: { userId: string, onSuccess: () => void }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordResetFormValues>({
        resolver: zodResolver(passwordResetSchema)
    });

    const onSubmit = async (data: PasswordResetFormValues) => {
        try {
            const response = await fetch(`http://localhost:3001/api/auth/reset-password/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    newPassword: data.newPassword
                })
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("رمز عبور با موفقیت تغییر یافت", {
                    style: {
                        background: "#31C440",
                        color: "#fff",
                        fontSize: "12px",
                        textAlign: 'center',
                        direction: "rtl"
                    }
                });
                onSuccess();
            } else {
                toast.error(result.message || "خطا در تغییر رمز عبور", {
                    style: {
                        background: "red",
                        color: "#fff",
                        fontSize: "12px",
                        textAlign: 'center',
                        direction: "rtl"
                    }
                });
            }
        } catch (error: any) {
            toast.error(error.message || "خطا در ارتباط با سرور", {
                style: {
                    background: "red",
                    color: "#fff",
                    fontSize: "12px",
                    textAlign: 'center',
                    direction: "rtl"
                }
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-8 text-right">
            <div className="w-full relative h-11 rounded-lg px-1 border">
                <Label htmlFor="newPassword"
                       className="absolute -top-[10px] right-2 bg-secondary px-1 text-sm text-[var(--primary)]">
                    رمز عبور جدید
                </Label>
                <input
                    id="newPassword"
                    type="password"
                    className="outline-none border-0 size-full text-sm"
                    dir="rtl"
                    {...register("newPassword")}
                />
                {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
            </div>

            <Button type="submit" className="text-[var(--secondary)] w-full bg-primary">
                {isSubmitting ? "در حال ذخیره..." : "تغییر رمز عبور"}
            </Button>
        </form>
    );
}

export default function ForgotPasswordDrawer() {
    const [questionFetched, setQuestionFetched] = useState(false);
    const [question, setQuestion] = useState("");
    const [drawer, setDrawer] = useState<boolean>(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
        reset,
        setError
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    useEffect(() => {
        reset();
        setQuestion("");
        setQuestionFetched(false);
        setShowPasswordReset(false);
        setUserId(null);
    }, [drawer]);

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        if (!questionFetched) {
            try {
                const response = await fetch(`http://localhost:3001/api/auth/forgot-password/${data.username}`, {
                    method: "GET",
                });
                const result = await response.json();

                if (response.ok) {
                    setQuestion(result.data.question);
                    setQuestionFetched(true);
                } else {
                    toast.error(result.message, {
                        style: {
                            background: "red",
                            color: "#fff",
                            fontSize: "12px",
                            textAlign: 'center',
                            direction: "rtl"
                        }
                    });
                }
            } catch (error: any) {
                toast.error(error.message || 'خطایی رخ داده است', {
                    style: {
                        background: "red",
                        color: "#fff",
                        fontSize: "12px",
                        textAlign: 'center',
                        direction: "rtl"
                    }
                });
            }
        } else {
            if (!data.answer) {
                setError("answer", {
                    type: "manual",
                    message: "پاسخ را وارد کنید",
                });
                return;
            }
            try {
                const response = await fetch(`http://localhost:3001/api/auth/verify-security-answer`, {
                    method: "POST",
                    body: JSON.stringify({username: data.username, answer: data.answer}),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const result = await response.json();

                if (response.ok) {
                    setUserId(result.data.id);
                    setShowPasswordReset(true);
                    toast.success("پاسخ صحیح بود. لطفاً رمز عبور جدید را وارد کنید", {
                        style: {
                            background: "#31C440",
                            color: "#fff",
                            fontSize: "12px",
                            textAlign: 'center',
                            direction: "rtl"
                        },
                        duration: 2000
                    });
                } else {
                    toast.error(result.message || 'خطایی رخ داده است', {
                        style: {
                            background: "red",
                            color: "#fff",
                            fontSize: "12px",
                            textAlign: 'center',
                            direction: "rtl"
                        }
                    });
                }
            } catch (error: any) {
                toast.error(error.message || 'خطایی رخ داده است', {
                    style: {
                        background: "red",
                        color: "#fff",
                        fontSize: "12px",
                        textAlign: 'center',
                        direction: "rtl"
                    }
                });
            }
        }
    };

    const handlePasswordResetSuccess = () => {
        setDrawer(false);
        router.refresh();
    };

    return (
        <Drawer open={drawer} onOpenChange={setDrawer}>
            <DrawerTrigger asChild>
                <button type="button"
                        onClick={() => setDrawer(true)}
                        className="bg-none border-0 hover:underline text-[var(--secondary)] cursor-pointer">
                    فراموشی رمز عبور
                </button>
            </DrawerTrigger>

            <DrawerContent className="bg-secondary p-0 mt-0 rounded-t-xl">
                <DrawerHeader
                    className="bg-secondary mt-0 rounded-t-xl flex-row-reverse flex-nowrap border-b w-full flex items-center justify-between">
                    <DrawerTitle>
                        {showPasswordReset ? "تغییر رمز عبور" : "فراموشی رمز عبور"}
                    </DrawerTitle>
                    <DrawerClose>
                        <CircleX/>
                    </DrawerClose>
                </DrawerHeader>

                {showPasswordReset && userId ? (
                    <PasswordResetForm
                        userId={userId}
                        onSuccess={handlePasswordResetSuccess}
                    />
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-8 text-right">
                        {!questionFetched && (
                            <div className="w-full relative h-11 rounded-lg px-1 border">
                                <Label htmlFor="username"
                                       className="absolute -top-[10px] right-2 bg-secondary px-1 text-sm text-[var(--primary)]">
                                    نام کاربری
                                </Label>
                                <input id="username"
                                       maxLength={40}
                                       className="outline-none border-0 size-full" {...register("username")} />
                                {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                            </div>
                        )}
                        {questionFetched && (
                            <>
                                <div className="w-full relative h-11 rounded-lg px-1 border">
                                    <Label htmlFor="question"
                                           className="absolute -top-[10px] right-2 bg-secondary px-1 text-sm text-[var(--primary)]">
                                        سؤال امنیتی
                                    </Label>
                                    <input
                                        id="question"
                                        className="outline-none border-0 size-full text-sm"
                                        type="text"
                                        value={question}
                                        disabled
                                        dir='rtl'
                                        maxLength={40}
                                    />
                                </div>
                                <div className="w-full relative h-11 rounded-lg px-1 border">
                                    <Label htmlFor="answer"
                                           className="absolute -top-[10px] right-2 bg-secondary px-1 text-sm text-[var(--primary)]">
                                        پاسخ
                                    </Label>
                                    <input id="answer" maxLength={40} className="outline-none border-0 size-full  text-sm"
                                           type="text" dir='rtl' {...register("answer")} />
                                    {errors.answer && <p className="text-sm text-red-500">{errors.answer.message}</p>}
                                </div>
                            </>
                        )}

                        <Button type="submit" className="text-[var(--secondary)] w-full bg-primary">
                            {isSubmitting ? "در حال ارسال..." : questionFetched ? "بررسی پاسخ" : "دریافت سوال امنیتی"}
                        </Button>
                    </form>
                )}
            </DrawerContent>
        </Drawer>
    )
}
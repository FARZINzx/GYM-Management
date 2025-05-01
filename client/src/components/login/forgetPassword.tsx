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

// Schema for validation
const forgotPasswordSchema = z.object({
    username: z.string().min(1, "نام کاربری را وارد کنید"),
    answer: z.string().optional()
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordDrawer() {
    const [questionFetched, setQuestionFetched] = useState(false) // To manage question state
    const [question, setQuestion] = useState("") // To store the security question
    const [drawer, setDrawer] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
        reset, setError
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    useEffect(() => {
        reset()
        setQuestion("")
        setQuestionFetched(false)
    }, [drawer]);

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        if (!questionFetched) {
            // If question hasn't been fetched, fetch it using the username
            try {
                const response = await fetch(`http://localhost:3001/api/auth/forgot-password/${data.username}`, {
                    method: "GET",
                })
                const result = await response.json()

                if (response.ok) {
                    setQuestion(result.data.question) // Set the question
                    setQuestionFetched(true) // Mark the question as fetched
                } else {
                    toast.error(result.message, {
                        style: {
                            background: "red",
                            color: "#fff",
                            fontSize: "12px",
                            textAlign: 'center',
                            direction: "rtl"
                        }
                    })
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
            // If question has been fetched, verify the answer
            if (!data.answer) { // Manually check for answer
                setError("answer", {
                    type: "manual",
                    message: "پاسخ را وارد کنید",
                })
                return // Prevent submission if answer is missing
            }
            try {
                const response = await fetch(`http://localhost:3001/api/auth/verify-security-answer`, {
                    method: "POST",
                    body: JSON.stringify({username: data.username, answer: data.answer}),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                const result = await response.json()


                if (response.ok) {
                    // Return password or any recovery token here
                    toast.success("پاسخ صحیح بود , در حال رفتن به صفحه تغییر رمز عبور... ", {
                        style: {
                            background: "#31C440",
                            color: "#fff",
                            fontSize: "12px",
                            textAlign: 'center',
                            direction: "rtl"
                        },
                        duration: 2000
                    })
                    reset()
                    setDrawer(false)
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

        // reset()
    }

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
                    <DrawerTitle>فراموشی رمز عبور</DrawerTitle>
                    <DrawerClose>
                        <CircleX/>
                    </DrawerClose>
                </DrawerHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-8 text-right">
                    {!questionFetched && (
                        <div className="w-full relative h-11 rounded-lg px-1 border">
                            <Label htmlFor="username"
                                   className="absolute -top-[10px] right-2 bg-secondary px-1 text-sm text-[var(--primary)]">
                                نام کاربری
                            </Label>
                            <input id="username"
                                   className="outline-none border-0 size-full" {...register("username")} />
                            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                        </div>
                    )}
                    {questionFetched && (
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
                            />
                        </div>
                    )}

                    {questionFetched && (
                        <div className="w-full relative h-11 rounded-lg px-1 border">
                            <Label htmlFor="answer"
                                   className="absolute -top-[10px] right-2 bg-secondary px-1 text-sm text-[var(--primary)]">
                                پاسخ
                            </Label>
                            <input id="answer" className="outline-none border-0 size-full  text-sm"
                                   type="text" dir='rtl' {...register("answer")} />
                            {errors.answer && <p className="text-sm text-red-500">{errors.answer.message}</p>}
                        </div>
                    )}


                    <Button type="submit" className="text-[var(--secondary)] w-full bg-primary">
                        {isSubmitting ? "در حال ارسال..." : questionFetched ? "بررسی پاسخ" : "دریافت سوال امنیتی"}
                    </Button>

                </form>
            </DrawerContent>
        </Drawer>
    )
}

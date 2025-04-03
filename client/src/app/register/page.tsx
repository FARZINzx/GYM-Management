"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
//form
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
//shadCn
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
//utils
import Spinner from "@/components/loading/LoadingSpinner";
import { toggleFullScreen } from "@/lib/utils";
import toast from "react-hot-toast";
//icon

export default function Register() {
  const [loading, setLoading] = useState<boolean>(false);

  const formSchema = z.object({
    name: z.string({ required_error: "نام وارد نشده است" }),
    familyName: z.string({ required_error: "نام خانوادگی وارد نشده است" }),
    phone: z
      .string({ required_error: "شماره تلفن وارد نشده است" })
      .min(11, { message: "شماره تلفن باید ۱۱ رقم باشد" })
      .regex(/^[0-9]+$/, { message: "شماره تلفن فقط باید شامل اعداد باشد" }),
    age: z
      .number({
        required_error: "سن وارد نشده است",
        invalid_type_error: "سن باید عدد باشد",
      })
      .min(1, { message: "سن باید بزرگتر از ۰ باشد" })
      .max(120, { message: "سن نمی‌تواند بیشتر از ۱۲۰ باشد" }),
    BMI: z
      .string({
        required_error: "شاخص توده بدنی وارد نشده است",
      })
      .regex(/^\d*\.?\d+$/, { message: "شاخص توده بدنی باید عدد باشد" })
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val) && val >= 10 && val <= 50, {
        message: "شاخص توده بدنی باید بین ۱۰ تا ۵۰ باشد",
      }),
    gender: z.enum(["male", "female"], {
      required_error: "جنسیت انتخاب نشده است",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      form.reset();
      toast.success("ثبت نام با موفقیت انجام شد", {
        style: {
          background: "#31C440",
          color: "#fff",
        },
      });
    }, 2000);
    console.log(values);
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
    <div className="w-full min-h-screen relative flex justify-center">
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
        <p className="text-4xl text-[var(--secondary)]">ثبت نام</p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="sm-plus:px-0 space-y-8 bg-secondary p-8 rounded-xl"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
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
                      className="h-12 w-full rounded-lg border border-[var(--primary) bg-transparent px-3 text-[var(--primary)] outline-0"
                    />
                  </FormControl>
                  <FormMessage dir="rtl" className="text-red-600" />
                </FormItem>
              )}
            />
            <FormField
              name="familyName"
              control={form.control}
              render={({ field }) => (
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
                      className="h-12 w-full rounded-lg border border-[var(--primary) bg-transparent px-3 text-[var(--primary)] outline-0"
                    />
                  </FormControl>
                  <FormMessage dir="rtl" className="text-red-600" />
                </FormItem>
              )}
            />
            <FormField
              name="phone"
              control={form.control}
              render={({ field }) => (
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
                      className="h-12 w-full rounded-lg border border-[var(--primary) bg-transparent px-3 text-[var(--primary)] outline-0"
                    />
                  </FormControl>
                  <FormMessage dir="rtl" className="text-red-600" />
                </FormItem>
              )}
            />
            <FormField
              name="age"
              control={form.control}
              render={({ field }) => (
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
                      min="1"
                      max="120"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-12 w-full rounded-lg border border-[var(--primary) bg-transparent px-3 text-[var(--primary)] outline-0"
                    />
                  </FormControl>
                  <FormMessage dir="rtl" className="text-red-600" />
                </FormItem>
              )}
            />
            <FormField
              name="BMI"
              control={form.control}
              render={({ field }) => (
                <FormItem className="relative w-full">
                  <div
                    className={`absolute -top-[12px] right-2 bg-secondary px-1 text-[var(--primary)]`}
                  >
                    شاخص توده بدنی
                  </div>
                  <FormControl>
                    <input
                      {...field}
                      type="number"
                      dir="ltr"
                      step="0.1"
                      min="10"
                      max="50"
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-12 w-full rounded-lg border border-[var(--primary) bg-transparent px-3 text-[var(--primary)] outline-0"
                    />
                  </FormControl>
                  <FormMessage dir="rtl" className="text-red-600" />
                </FormItem>
              )}
            />
            <FormField
              name="gender"
              control={form.control}
              render={({ field }) => (
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
              className="h-10 w-full rounded-lg text-[var(--secondary)] bg-primary text-center text-[16px] font-semibold hover:brightness-90 active:scale-95 duration-500"
              type="submit"
            >
              {loading ? <Spinner /> : "ثبت اطلاعات"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

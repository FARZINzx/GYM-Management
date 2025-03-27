"use client";
import Image from "next/image";
import { useState } from "react";
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
//utils
import Spinner from "@/components/loading/LoadingSpinner";
import { toggleFullScreen } from "@/lib/utils";
//icon
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const formSchema = z.object({
    username: z.string().nonempty({ message: "نام کاربری وارد نشده است" }),
    password: z
      .string()
      .min(7, { message: "رمز عبور باید بیشتر از 8 رقم باشد" })
      .refine((val) => /[A-Za-z]/.test(val) && /\d/.test(val), {
        message: "رمز عبور باید شامل حروف و عدد انگلیسی باشد",
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    toggleFullScreen()
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    console.log(values);
  };

  const pass = form.watch("password");

  return (
    <div className="w-full min-h-screen relative flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/login-bg.webp"
          alt="Login background"
          fill
          className="object-cover"
          priority
        />
        {/* Optional overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="z-10 flex flex-col items-center justify-center gap-10 ">
        <p className="text-5xl text-[var(--secondary)]">ورود</p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="sm-plus:px-0 space-y-6 bg-secondary p-8 rounded-xl"
          >
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem className="relative w-full">
                  <div
                    className={`absolute -top-[15px] right-2 bg-secondary px-1 text-lg text-[var(--primary)]`}
                  >
                    نام کاربری
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
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative h-full w-full">
                      <div
                        className={`absolute -top-[17px] right-2 bg-[var(--secondary)] px-1 text-lg text-midnightNavy`}
                      >
                        رمز عبور
                      </div>
                      <input
                        dir="ltr"
                        type={showPassword ? "text" : "password"}
                        {...field}
                        className={`h-12 w-full rounded-lg border border-midnightNavy bg-transparent px-3 text-midnightNavy outline-0`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute inset-y-0 right-3 ${
                          pass != "" ? "flex" : "hidden"
                        } items-center text-gray-500`}
                      >
                        {showPassword ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage dir="rtl" className="text-red-600" />
                </FormItem>
              )}
            />
            <Button
              className="h-10 w-full rounded-lg text-[var(--secondary)] bg-primary text-center text-[16px] font-semibold hover:brightness-90 active:scale-95 duration-500"
              type="submit"
            >
              {loading ? <Spinner /> : "ورود"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

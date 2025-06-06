"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import ForgotPasswordDrawer from "@/components/login/forgetPassword"
// import { toggleFullScreen } from "@/lib/utils";
import { setCookie } from "@/action/cookie";
import toast from "react-hot-toast";
//icon
import { Eye, EyeOff } from "lucide-react";
//zustand
import { useMeStore } from "@/zustand/stores/me-store";

// Define response type
type LoginResponse = {
  message: string;
  success: boolean;
  data: {
    token: string;
    role : string
    employee_id : number
  };
  status: number;
};

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const {setMe} = useMeStore()

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: "نام کاربری وارد نشده است" })
    .max(25, { message: "نام کاربری نمی‌تواند بیش از ۲۵ حرف باشد" }),
  password: z
    .string()
    .min(8, { message: "رمز عبور باید حداقل ۸ کاراکتر باشد" })
    .max(20, { message: "رمز عبور نمی‌تواند بیش از ۲۰ حرف باشد" })
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
    mode : "onChange"
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: LoginResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "خطا در ورود به سیستم");
      }

      if (data.success) {
        setCookie("token", data.data.token);
        setCookie('role' , data.data.role)
        setCookie('id' , data.data.employee_id.toString())
        setMe({
          id :  data.data.employee_id,
          role :  data.data.role
        })
        toast.success(data.message, {
          style: {
            background: "#31C440",
            color: "#fff",
          },
          duration : 2000
        });
        router.push("/");
      } else {
        throw new Error(data.message || "خطا در ورود به سیستم");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "خطا در ورود به سیستم";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const handleFullScreen = () => {
  //     toggleFullScreen();
  //   };

  //   document.addEventListener("click", handleFullScreen);

  //   return () => {
  //     document.removeEventListener("click", handleFullScreen);
  //   };
  // }, []);

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
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="z-10 flex flex-col items-center justify-center gap-10">
        <p className="text-5xl text-[var(--secondary)]">ورود</p>
        <Form {...form}>
          <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="sm-plus:px-0 space-y-6 max-w-[285px] bg-secondary p-8 rounded-xl"
          >
            <FormField
                name="username"
                control={form.control}
                render={({field}) => (
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
                            maxLength={25}
                            className="h-12 w-full rounded-lg border border-[var(--primary)] bg-transparent px-3 text-[var(--primary)] outline-0"
                            disabled={loading}
                        />
                      </FormControl>
                      <FormMessage dir="rtl" className="text-red-600 text-xs"/>
                    </FormItem>
                )}
            />
            <FormField
                name="password"
                control={form.control}
                render={({field}) => (
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
                              maxLength={20}
                              className={`h-12 w-full rounded-lg border border-midnightNavy bg-transparent px-3 text-midnightNavy outline-0`}
                              disabled={loading}
                          />
                          <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className={`absolute inset-y-0 right-3 ${
                                  pass != "" ? "flex" : "hidden"
                              } items-center text-[var(--primary)]`}
                              disabled={loading}
                          >
                            {showPassword ? (
                                <Eye className="h-5 w-5"/>
                            ) : (
                                <EyeOff className="h-5 w-5"/>
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage dir="rtl" className="text-red-600 text-xs"/>
                    </FormItem>
                )}
            />
            {error && (
                <div className="text-red-600 text-center text-sm" dir="rtl">
                  {error}
                </div>
            )}
            <Button
                className="h-10 w-full rounded-lg text-[var(--secondary)] disabled:bg-gray-600 bg-primary text-center text-[16px] font-semibold hover:brightness-90 active:scale-95 duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={!form.formState.isValid || loading}
            >
              {loading ? <Spinner/> : "ورود"}
            </Button>
          </form>
        </Form>
        <ForgotPasswordDrawer/>
      </div>
    </div>
  );
}

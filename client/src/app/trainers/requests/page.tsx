'use client'
import {useEffect, useState} from "react";
import Header from "@/components/ui/header";
import {convertToJalali} from '@/lib/utils'
import {Request} from "@/data/type";
//services
import {getRequestsService} from "@/lib/services";
import toast from "react-hot-toast";

export default function Requests() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [requests, setRequests] = useState<Request[]>([]);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response = await getRequestsService()
            setRequests(response.data);
        } catch (error: any) {
            toast.error(error.message || 'خطا در ارتباط با سرور', {
                style: {background: "red", color: "#fff"}
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchRequests()
        console.log(requests)
    }, []);


    return (
        <main
            className="min-h-screen bg-[var(--primary)]"
        >
            <div className="max-w-[430px] mx-auto relative">
                {/* Header */}
                <Header type="page"/>
                <div className="flex flex-col gap-6 mx-auto  px-6">
                    <div
                        className='w-full flex text-[var(--secondary)] text-center border-b border-[var(--secondary)] items-center pb-2 justify-center relative'>
                        <h2 className="text-3xl">
                            درخواست ها
                        </h2>
                    </div>

                    {/* Grid of Management Options */}
                    {
                        isLoading
                            ? Array.from({length: 10}).map((_, index) => (
                                <div
                                    key={index}
                                    className="w-full animate-pulse gap-1 bg-gray-500 rounded-xl h-40 duration-500">
                                </div>
                            ))
                            : <div className="flex flex-col gap-3 overflow-y-scroll h-full hide-scrollbar">
                                {requests.map((request) => (
                                    <div
                                        key={request.request_id}
                                        className='flex w-full flex-col '>
                                        <div
                                            className='flex w-full gap-2 flex-col p-2 rounded-t-md bg-secondary text-sm'>
                                            <div className='w-full flex justify-between items-center'>
                                                <p>نام و نام خانوادگی :</p>
                                                <p className='font-semibold'>{request.client_name} {request.client_last_name}</p>
                                            </div>
                                            <div className='w-full flex justify-between items-center'>
                                                <p>شماره تلفن :</p>
                                                <p className='font-semibold'>{request.client_phone}</p>
                                            </div>
                                            <div className='w-full flex justify-between items-center'>
                                                <p> وزن :</p>
                                                <p className='font-semibold'>{request.client_phone}</p>
                                            </div>
                                            <div className='w-full flex justify-between items-center'>
                                                <p> قد :</p>
                                                <p className='font-semibold'>{request.client_phone}</p>
                                            </div>
                                            <div className='w-full flex justify-between items-center'>
                                                <p>شاخص BMI  :</p>
                                                <p className='font-semibold'>{request.client_phone}</p>
                                            </div>
                                            <div className='w-full flex justify-between items-center'>
                                                <p>تاریخ درخواست :</p>
                                                <p className='font-semibold'>{convertToJalali(request.created_at.toString())}</p>
                                            </div>
                                            <div className='w-full flex justify-between items-center'>
                                                <p>توضیحات :</p>
                                                <p className='font-semibold'>{request.notes}</p>
                                            </div>
                                            <div className='w-full flex flex-col justify-between'>
                                                <p>خدمت های خواسته شده :</p>
                                                <div
                                                    className='flex items-center gap-1'>{request.services.map((item) => (
                                                    <div key={item.service_id}
                                                         className=' font-semibold flex items-center justify-center p-1 rounded border text-sm'>{item.name}</div>
                                                ))}</div>
                                            </div>
                                        </div>
                                        <div
                                            className='flex items-center justify-between w-full border-t border-primary'>
                                            <button

                                                className='bg-secondary active:scale-95 font-semibold duration-300 py-2 border-l rounded-br-md border-primary text-green-600 w-full '> پذیرفتن
                                            </button>
                                            <button
                                                className='bg-secondary py-2 text-red-500 font-semibold rounded-bl-md active:scale-95 duration-300 w-full rounded-lb-md flex items-center justify-center'> رد
                                                کردن
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                    }

                </div>
            </div>
        </main>
    )
}
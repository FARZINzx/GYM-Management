'use client'
import {useEffect, useState} from "react";
import Header from "@/components/ui/header";
import {convertToJalali} from '@/lib/utils'
import {Request} from "@/data/type";
import Spinner from "@/components/loading/LoadingSpinner";
//services
import {getRequestsService, handleAcceptOrRejectService} from "@/lib/services";
import toast from "react-hot-toast";
import {getCookie} from "@/action/cookie";

export default function Requests() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [requests, setRequests] = useState<Request[]>([]);
    const [isStatusLoading, setIsStatusLoading] = useState<boolean>(false);
    const [trainerId, setTrainerId] = useState<string>('')

    useEffect(() => {
        const fetchId = async () => {
            const idCookie = await getCookie('id')
            setTrainerId(idCookie || '')
        }
        if (!trainerId) {
            fetchId()
        }

    }, [trainerId])

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

    const handleAcceptOrReject = async (status: "accepted" | "rejected", request_id: number) => {
        setIsStatusLoading(true)
        try {
            const response = await handleAcceptOrRejectService(Number(trainerId), status, request_id)
            if (response.success) {
                fetchRequests()
                setIsStatusLoading(false)
                toast.success(response.message || "درخواست با موفقیت انجام شد", {
                    style: {
                        background: "#31C440",
                        color: "#fff",
                    },
                    duration: 2000
                });

            }
        } catch (error: any) {
            toast.error(error.message || 'خطا در ارتباط با سرور', {
                style: {background: "red", color: "#fff"}
            });
        } finally {
            setIsStatusLoading(false);
        }
    }

    useEffect(() => {
        fetchRequests()
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
                                {
                                    requests.length > 0
                                        ? requests.map((request) => (
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
                                                        <p className='font-semibold'>{request.client_weight_kg}</p>
                                                    </div>
                                                    <div className='w-full flex justify-between items-center'>
                                                        <p> قد :</p>
                                                        <p className='font-semibold'>{request.client_height_cm}</p>
                                                    </div>
                                                    <div className='w-full flex justify-between items-center'>
                                                        <p>شاخص BMI :</p>
                                                        <p className='font-semibold'>{request.client_bmi}</p>
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
                                                        onClick={() => handleAcceptOrReject('accepted', request.request_id)}
                                                        disabled={isStatusLoading}
                                                        className='bg-secondary disabled:opacity-70 active:scale-95 font-semibold duration-300 py-2 border-l rounded-br-md border-primary text-green-600 w-full '> {
                                                        isStatusLoading ? <Spinner/> : 'پذیرفتن'
                                                    }
                                                    </button>
                                                    <button
                                                        disabled={isStatusLoading}
                                                        onClick={() => handleAcceptOrReject('rejected', request.request_id)}
                                                        className='bg-secondary py-2 text-red-500 disabled:opacity-70 font-semibold rounded-bl-md active:scale-95 duration-300 w-full rounded-lb-md flex items-center justify-center'> رد
                                                        کردن
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                        : <div className='text-secondary text-lg text-center'>درخواستی وجود ندارد</div>
                                }
                            </div>
                    }

                </div>
            </div>
        </main>
    )
}
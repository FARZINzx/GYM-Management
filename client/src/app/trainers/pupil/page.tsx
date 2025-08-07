'use client'
import {useEffect, useState} from "react";
import Header from "@/components/ui/header";
import {convertToJalali} from '@/lib/utils'
import {Pupil} from "@/data/type";
//services
import {getPupilOfTrainerService} from "@/lib/services";
import toast from "react-hot-toast";
import {getCookie} from "@/action/cookie";

export default function PupilsOfTrainers() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<Pupil[]>([]);
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
            const response = await getPupilOfTrainerService(Number(trainerId))
            console.log(response)
            setData(response.data);
        } catch (error: any) {
            toast.error(error.message || 'خطا در ارتباط با سرور', {
                style: {background: "red", color: "#fff"}
            });
        } finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        if(!trainerId) return
        fetchRequests()
    }, [trainerId]);


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
                            شاگرد ها
                        </h2>
                    </div>

                    {/* Grid of Management Options */}
                    {
                        isLoading
                            ? Array.from({length: 10}).map((_, index) => (
                                <div
                                    key={index}
                                    className="w-full animate-pulse gap-1 bg-gray-500 rounded-xl h-80 duration-500">
                                </div>
                            ))
                            : <div className="flex flex-col gap-3 overflow-y-scroll h-full hide-scrollbar">
                                {
                                    data.length > 0
                                        ? data.map((request) => (
                                            <div
                                                key={request.request_id}
                                                    className='flex w-full gap-2 flex-col p-2 rounded-md bg-secondary text-sm'>
                                                    <div className='w-full flex justify-between items-center'>
                                                        <p>نام و نام خانوادگی :</p>
                                                        <p className='font-semibold'>{request.first_name} {request.last_name}</p>
                                                    </div>
                                                    <div className='w-full flex justify-between items-center'>
                                                        <p>شماره تلفن :</p>
                                                        <p className='font-semibold'>{request.phone}</p>
                                                    </div>
                                                    <div className='w-full flex justify-between items-center'>
                                                        <p> وزن :</p>
                                                        <p className='font-semibold'>{request.weight_kg}</p>
                                                    </div>
                                                    <div className='w-full flex justify-between items-center'>
                                                        <p> قد :</p>
                                                        <p className='font-semibold'>{request.height_cm}</p>
                                                    </div>
                                                    <div className='w-full flex justify-between items-center'>
                                                        <p>شاخص BMI :</p>
                                                        <p className='font-semibold'>{request.bmi}</p>
                                                    </div>
                                                    <div className='w-full flex justify-between items-center'>
                                                        <p>تاریخ درخواست :</p>
                                                        <p className='font-semibold'>{convertToJalali(request.created_at.toString())}</p>
                                                    </div>
                                                    <div className='w-full flex justify-between items-center'>
                                                        <p>جنسیت :</p>
                                                        <p className='font-semibold'>{request.gender == 'male' ?  'مذکر' : "مونث"}</p>
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
                                        ))
                                        : <div className='text-secondary text-lg text-center'>شاگردی برای شما وجود ندارد</div>
                                }
                            </div>
                    }

                </div>
            </div>
        </main>
    )
}
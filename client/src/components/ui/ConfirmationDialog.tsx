"use client";
import { Trash2 } from 'lucide-react';


export default function ConfirmationDialog({
                                               isOpen,
                                               onClose,
                                               onConfirm,
                                               title,
                                               message
                                           }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
            <div className="bg-[var(--secondary)] p-3 rounded-lg max-w-[300px] w-full text-[var(--primary)]">
                <div className='w-full flex items-center justify-between mb-4'>
                    <h3 className="text-lg font-bold ">{title}</h3>
                    <Trash2 className='text-red-700' size={26} />
                </div>

                <p className="mb-6 font-semibold">{message}</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-[var(--primary)] rounded-md active:scale-95 duration-200 focus:outline-none"
                    >
                        انصراف
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-md active:scale-95 duration-200 focus:outline-none"
                    >
                        حذف
                    </button>
                </div>
            </div>
        </div>
    );
}
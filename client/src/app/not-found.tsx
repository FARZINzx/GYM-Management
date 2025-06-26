import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="grid h-screen bg-primary px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                <p className="text-base font-semibold text-primary">404</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-secondary sm:text-7xl">
                    صفحه مورد نظر پیدا نشد</h1>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link href="/"
                       className="rounded-md bg-secondary  px-3.5 py-2.5 text-sm font-semibold text-primary shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        بازگشت به منو اصلی</Link>
                </div>
            </div>
        </main>
    )
}
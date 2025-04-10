'use server'

import { cookies } from 'next/headers'

export async function setCookie(name: string, value: string) {
     const cookieStore = await cookies()
     cookieStore.set({
          name: name,
          value: value,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/'
     })
}

export async function getCookie(name: string) {
     const cookieStore = await cookies()
     return cookieStore.get(name)?.value
}

export async function deleteCookie(name: string) {
     const cookieStore = await cookies()
     cookieStore.delete(name)
}




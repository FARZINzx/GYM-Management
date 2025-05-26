//interface
import {IconButtonProps, Coach} from "@/data/type"
//icon
import {UserRoundPlus, TrendingUpDown, HandCoins, Anchor, ChartPie, Users} from "lucide-react";

export const AdminPanelItem: IconButtonProps[] = [
    {
        id: 1,
        label: "ثبت باشگاه جدید",
        icon: UserRoundPlus,
        href: '/register'
    },
]

export const ManagerPanelItem: IconButtonProps[] = [
    {
        id: 1,
        label: "ثبت کاربر جدید",
        icon: UserRoundPlus,
        href: '/register'
    },
    {
        id: 2,
        label: "تعریف هزینه ها",
        icon: TrendingUpDown,
        href: '/register'
    },
    {
        id: 3,
        label: "پرداخت کارمزد",
        icon: HandCoins,
        href: '/register'
    },
    {
        id: 4,
        label: "مربیان",
        icon: Anchor,
        href: '/trainers'
    },
    {
        id: 5,
        label: "گزارش گیری",
        icon: ChartPie,
        href: '/register'
    },
    {
        id: 6,
        label: "کاربران",
        icon: Users,
        href: '/users'
    },
    {
        id: 10,
        label: "پرسنل",
        icon: Users,
        href: '/personnel'

    }


]

export const ReceptionPanelItem: IconButtonProps[] = [
    {
        id: 1,
        label: "ثبت کاربر جدید",
        icon: UserRoundPlus,
        href: '/register'
    },
    {
        id: 7,
        label: "درخواست مربی",
        icon: ChartPie,
        href: '/'
    },
    {
        id: 6,
        label: "کاربران",
        icon: Users,
        href: '/users'
    },


]

export const CoachPanelItem: IconButtonProps[] = [
    {
        id: 8,
        label: "درخواست ها",
        icon: UserRoundPlus,
        href: '/'
    },
    {
        id: 9,
        label: "شاگرد ها",
        icon: Users,
        href: '/'
    },


]

export const CoachesDB: Coach[] = [
    {
        id: 1,
        name: "محمد حسین حسینی",
        present: true
    },
    {
        id: 2,
        name: "محمد حسین حسینی",
        present: false
    },
    {
        id: 3,
        name: "محمد حسین حسینی",
        present: true
    },
    {
        id: 4,
        name: "محمد حسین حسینی",
        present: false
    },
    {
        id: 5,
        name: "محمد حسین حسینی",
        present: true
    },
    {
        id: 6,
        name: "محمد حسین حسینی",
        present: false
    },
    {
        id: 7,
        name: "محمد حسین حسینی",
        present: true
    },
    {
        id: 8,
        name: "محمد حسین حسینی",
        present: false
    },
    {
        id: 9,
        name: "محمد حسین حسینی",
        present: true
    },
    {
        id: 10,
        name: "محمد حسین حسینی",
        present: false
    },
    {
        id: 11,
        name: "محمد حسین حسینی",
        present: true
    },
    {
        id: 12,
        name: "محمد حسین حسینی",
        present: true
    },
    {
        id: 13,
        name: "محمد حسین حسینی",
        present: true
    },

    {
        id: 14,
        name: "محمد حسین حسینی",
        present: true
    }, {
        id: 15,
        name: "محمد حسین حسینی",
        present: true
    },
    {
        id: 16,
        name: "محمد حسین حسینی",
        present: true
    },
    {
        id: 17,
        name: "محمد حسین حسینی",
        present: true
    },
    {
        id: 18,
        name: "محمد حسین حسینی",
        present: true
    },
]

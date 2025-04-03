//interface
import {IconButtonProps} from "@/data/type"
//icon
import { UserRoundPlus , TrendingUpDown , HandCoins , Anchor , ChartPie , Users } from "lucide-react";

export const ManagerPanelItem : IconButtonProps[] = [
     {
          id : 1,
          label : "ثبت کاربر جدید",
          icon : UserRoundPlus,
          href : '/register'
     },
     {
          id : 2,
          label : "تعریف هزینه ها",
          icon : TrendingUpDown,
          href : '/register'
     },
     {
          id : 3,
          label : "پرداخت کارمزد",
          icon : HandCoins,
          href : '/register'
     },
     {
          id : 4,
          label : "مربیان",
          icon : Anchor,
          href : '/register'
     },
     {
          id : 5,
          label : "گزارش گیری",
          icon : ChartPie,
          href : '/register'
     },
     {
          id : 6,
          label : "کاربران",
          icon : Users,
          href : '/register'
     },


]

export const ReceoptionPanelItem : IconButtonProps[] = [
     {
          id : 1,
          label : "ثبت کاربر جدید",
          icon : UserRoundPlus,
          href : '/'
     },
     {
          id : 7,
          label : "درخواست مربی",
          icon : ChartPie,
          href : '/'
     },
     {
          id : 6,
          label : "کاربران",
          icon : Users,
          href : '/'
     },


]

export const CoachPanelItem : IconButtonProps[] = [
     {
          id : 8,
          label : "درخواست ها",
          icon : UserRoundPlus,
          href : '/'
     },
     {
          id : 9,
          label : "شاگرد ها",
          icon : Users,
          href : '/'
     },


]
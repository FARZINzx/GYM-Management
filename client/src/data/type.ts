import {LucideIcon } from "lucide-react";

export interface IconButtonProps {
     id : number
     icon: LucideIcon;
     label: string;
     size?: number;
     href: string;
   }

export interface Coach {
     id : number
     name : string
     present : boolean
}

export interface User {
     id: string
     first_name : string
     last_name : string
     age : number
     phone : string
     gender : "male" | "female"
     weight_kg : number
     height_cm : number
     bmi : string
     is_fee_paid: string,
     trainer_id : any,
     created_at : string
     birth_date : string
}

export interface PersonnelType {
     id: string
     first_name : string
     last_name : string
     role_name : string
     age?:number
     created_at? : string
     is_active?:boolean
     phone?:number
     address?:string
}



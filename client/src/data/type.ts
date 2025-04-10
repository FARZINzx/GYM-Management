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



"use client";
import { useEffect , useState } from "react";
//components
// import { toggleFullScreen } from "@/lib/utils";
import LoadingScreen from "@/components/loading/loadingScreen";
import Header from "@/components/ui/header";
import Link from "next/link";
//utils
import { getCookie } from "@/action/cookie";
//db
import { ManagerPanelItem , AdminPanelItem , ReceptionPanelItem , CoachPanelItem } from "@/data/db";
//interface
import { IconButtonProps } from "@/data/type";

const Item = ({ icon: Icon, label, href, id }: IconButtonProps) => {
  return (
    <Link
      href={href}
      key={id}
      className="bg-[var(--secondary)] rounded-lg p-1 flex gap-3 flex-col items-center justify-center aspect-square hover:brightness-90  active:scale-90 duration-500 text-center max-[400px]:text-sm text-lg"
    >
      <Icon className="max-[400px]:size-10 size-15"/>
      <span className="text-[var(--primary)] font-medium">
        {label}
      </span>
    </Link>
  );
};

export default function Home() {
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    const fetchRole = async () => {
      const roleCookie = await getCookie('role')
      setRole(roleCookie || '')
    }
    fetchRole()
  }, [])

  // useEffect(() => {
  //   const handleClick = () => {
  //     toggleFullScreen();
  //   };

  //   document.addEventListener("click", handleClick);
  //   return () => document.removeEventListener("click", handleClick);
  // }, []);

  if (!role) {
    return <LoadingScreen/>
  }

  return (
    <main className="min-h-screen bg-[var(--primary)] ">
      <div className="max-w-[430px] mx-auto">
        {/* Header */}
        <Header type="menu"/>
        <div className="flex flex-col gap-12 px-10">
          <h2 className="text-3xl max-[400px]:text-2xl text-[var(--secondary)] text-center border-b border-[var(--secondary)] pb-2">
            {role === "manager" ? " پنل مدیریت" : role === 'receptionist' ? "پنل منشی" : role === 'admin' ? "پنل ادمین" : "پنل مربی" }
           
          </h2>
          {/* Grid of Management Options */}
          <div className="grid grid-cols-2 gap-4 pb-2 ">
          {role === "manager" ? ManagerPanelItem.map((item : IconButtonProps) => (
              <Item
                label={item.label}
                href={item.href}
                icon={item.icon}
                id={item.id}
                key={item.id}
              />
            )) : role === 'receptionist' ? ReceptionPanelItem.map((item : IconButtonProps) => (
              <Item
                label={item.label}
                href={item.href}
                icon={item.icon}
                id={item.id}
                key={item.id}
              />
            )) : role === 'admin' ? AdminPanelItem.map((item : IconButtonProps) => (
              <Item
                  label={item.label}
                  href={item.href}
                  icon={item.icon}
                  id={item.id}
                  key={item.id}
              />
          )) :  CoachPanelItem.map((item : IconButtonProps) => (
              <Item
                label={item.label}
                href={item.href}
                icon={item.icon}
                id={item.id}
                key={item.id}
              />
            ))}          
          </div>
        </div>
      </div>
    </main>
  );
}

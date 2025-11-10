'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home(){
    const router = useRouter();
    useEffect(() => {
    getData();
}, []);

const getData = async () => {
  const storage = localStorage.getItem('auth_token');
  if (!storage) {
    router.push("/login");
    return;
  }

 router.push("/social-media");
}

    return(
        <div>Redirecionando...</div>
    )
}
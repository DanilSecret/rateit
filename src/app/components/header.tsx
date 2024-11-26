"use client"

import Link from "next/link";
import {useCookies} from "react-cookie";
import Cookies from 'js-cookie';
import {useEffect, useState} from "react";
import Image from "next/image";



export function Header() {
    const [userData, setUserData] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [cookies] = useCookies(['auth_token']);


    const destroyCookie = () => {
        Cookies.remove('auth_token');
        window.location.reload();
    }
    useEffect(() => {
        if (cookies.auth_token) {
            setIsAuth(true);
            const fetchUserData = async () => {
                try {
                    const response = await fetch('/api/getUser', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${cookies.auth_token}`
                        },
                    })

                    const result = await response.json();

                    if (response.ok) {
                        console.log(result)
                        setUserData(result.result);
                    } else {
                        console.error("Error fetching user data", result.message);
                    }

                } catch (error) {
                    console.error("fetching data error", error);
                }
            };
            fetchUserData();
        } else {
            setIsAuth(false);
        }
    }, [cookies]);

    return (
        <div className="flex items-center bg-[#343A40] h-[50px] w-full">
            <div className="flex items-center w-full justify-between text-[#f8f9fa] mx-5">
                <Link href="/"><h1 className="font-[500] text-[20px]">RateIt</h1></Link>
                <div>
                    {isAuth ?
                        <div className="flex gap-5 justify-end">
                            <Link href="/" className="w-full bg-indigo-600 text-white py-1 px-2 rounded-lg flex gap-2 hover:bg-indigo-700 ">
                                Написать отзыв
                                <Image src="hand.svg" width={25} height={25} alt=""/>
                            </Link>
                            <button className="flex items-center bg-red-600 text-white py-1 px-2 rounded-lg hover:bg-red-700" onClick={destroyCookie}>Выйти</button>
                        </div>
                        :
                        <div className="flex gap-5 justify-end" >
                            <Link href="/auth/" className="w-full bg-indigo-600 text-white py-1 px-2 rounded-lg flex gap-2 hover:bg-indigo-700">
                                Написать отзыв
                                <Image src="hand.svg" width={25} height={25} alt=""/>
                            </Link>
                            <Link href="/auth/" className="flex items-center bg-green-600 text-white py-1 px-2 rounded-lg hover:bg-green-700">
                                Войти
                            </Link>
                        </div>

                    }
                </div>
            </div>
        </div>
    );
}
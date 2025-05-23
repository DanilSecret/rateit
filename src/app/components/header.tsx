"use client";

import Link from "next/link";
import { useCookies } from "react-cookie";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function Header() {
    const [userData, setUserData] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [cookies] = useCookies(["auth_token"]);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const destroyCookie = () => {
        Cookies.remove("auth_token");
        window.location.reload();
    };

    const handleSearch = () => {
        router.push(`/search/`);
    };

    useEffect(() => {
        if (cookies.auth_token) {
            setIsAuth(true);
            const fetchUserData = async () => {
                try {
                    const response = await fetch("/api/getUserInf", {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${cookies.auth_token}`,
                        },
                    });

                    const result = await response.json();

                    if (response.ok) {
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
                <Link href="/">
                    <h1 className="font-[500] text-[20px]">RateIt</h1>
                </Link>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSearch}
                        className="bg-indigo-600 text-white py-1 px-2 rounded hover:bg-indigo-700"
                    >
                        Найти товар
                    </button>
                    {isAuth ? (
                        <div className="flex gap-5">
                            <button
                                className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700"
                                onClick={destroyCookie}
                            >
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-5">
                            <Link
                                href="/auth/"
                                className="bg-green-600 text-white py-1 px-2 rounded hover:bg-green-700"
                            >
                                Войти
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

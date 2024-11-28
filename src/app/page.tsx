"use client";
import Image from "next/image";
import { Header } from "@/app/components/header";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";

interface Product {
    id: number;
    name: string;
    image: string;
    average_rating: string;
    company: string;
    comm_count: number;
    description: string;
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [cookies] = useCookies(["auth_token"]);
    const [currUserRole, setCurrUserRole] = useState("");

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/getAllProd", { method: "GET" });
            const result = await response.json();

            if (response.ok) {
                setProducts(result.result);
            } else {
                console.error("Ошибка получения данных");
            }
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkRole = async () => {
        try {
            const response = await fetch(`/api/getUserInf?cookie=${cookies}`, { method: "GET" });
            const result = await response.json();

            if (response.ok) {
                setCurrUserRole(result.userRole);
            } else {
                console.error("Ошибка получения данных");
            }
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
        }
    };

    const deleteProduct = async (id: number) => {
        if (!confirm("Вы уверены, что хотите удалить этот товар?")) return;

        try {
            const response = await fetch(`/api/deleteProduct?id=${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${cookies.auth_token}`,
                },
            });

            if (response.ok) {
                setProducts((prev) => prev.filter((product) => product.id !== id));
                alert("Товар успешно удален.");
            } else {
                console.error("Ошибка при удалении товара");
            }
        } catch (error) {
            console.error("Ошибка при удалении:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        checkRole();
    }, []);

    return (
        <div>
            <Header/>
            {currUserRole === "admin" ? (
                <Link
                    href="/createProduct/"
                    className="flex justify-center items-center bg-green-600 text-white py-1 px-2 rounded-lg hover:bg-green-700 w-[150px] m-5"
                >
                    + Добавить товар
                </Link>
            ) : null}
            <div className="flex flex-wrap gap-4 p-5">
                {isLoading ? (
                    <p>Загрузка товаров...</p>
                ) : products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="border border-gray-300 rounded-lg p-4 shadow-md w-[300px]">
                            <Link href={`/products/${product.id}`} className="block">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        width={180}
                                        height={180}
                                        className="object-cover rounded-md"
                                    />
                                ) : (
                                    <div
                                        className="bg-gray-200 w-[200px] h-[200px] flex items-center justify-center rounded-md">
                                        <span className="text-gray-500">Нет изображения</span>
                                    </div>
                                )}
                                <h3 className="text-lg font-bold mt-2">{product.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {product.description.length > 100
                                        ? product.description.slice(0, 100) + "..."
                                        : product.description}
                                </p>
                                <p className="text-md text-gray-800">Компания: {product.company}</p>
                                <p className="text-md font-semibold mt-1">
                                    Рейтинг: {product.average_rating}
                                </p>
                                <p className="text-sm text-gray-600">Комментарии: {product.comm_count}</p>
                            </Link>
                            {currUserRole === "admin" && (
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={`/editProduct/${product.id}`}
                                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                    >
                                        Изменить
                                    </Link>
                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Товары отсутствуют</p>
                )}
            </div>

        </div>
    );
}

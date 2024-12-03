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

const ITEMS_PER_PAGE = 12;

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [cookies] = useCookies(["auth_token"]);
    const [currUserRole, setCurrUserRole] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

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

    const paginatedProducts = products.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            {currUserRole === "admin" && (
                <Link
                    href="/createProduct/"
                    className="flex justify-center items-center bg-green-600 text-white py-1 px-2 rounded-lg hover:bg-green-700 w-[150px] m-5"
                >
                    + Добавить товар
                </Link>
            )}
            <div className="flex-grow">
                <div className="flex flex-wrap w-[100%] justify-center">
                    {isLoading ? (
                        <p>Загрузка товаров...</p>
                    ) : paginatedProducts.length > 0 ? (
                        paginatedProducts.map((product) => (
                            <div key={product.id} className="border border-gray-300 rounded-lg p-4 shadow-md w-[300px] m-2">
                                <Link href={`/products/${product.id}`} className="block">
                                    {product.image ? (
                                        <div className="h-[240px] flex items-center">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={180}
                                                height={240}
                                                className="rounded-md mx-auto"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="bg-gray-200 w-[180px] h-[240px] flex items-center justify-center rounded-md">
                                            <span className="text-gray-500">Нет изображения</span>
                                        </div>
                                    )}
                                    <h3 className="text-md font-bold mt-2">
                                        {product.name.length > 25 ? product.name.slice(0,25)+"..." : product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 h-[80px]">
                                        {product.description.length > 125
                                            ? product.description.slice(0, 125) + "..."
                                            : product.description}
                                    </p>
                                    <p className="text-md text-gray-800">Компания: {product.company}</p>
                                    <p className="text-md font-semibold mt-1">
                                        Рейтинг:{" "}<span
                                        className="text-yellow-500 font-bold">{parseFloat(product.average_rating).toFixed(1)}</span>{" "}⭐
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
            <div className="flex justify-center gap-2 my-5">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-gray-300 text-gray-800 py-1 px-3 rounded hover:bg-gray-400 disabled:bg-gray-200"
                >
                    Назад
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`py-1 px-3 rounded ${
                            currentPage === index + 1
                                ? "bg-blue-500 text-white"
                                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-gray-300 text-gray-800 py-1 px-3 rounded hover:bg-gray-400 disabled:bg-gray-200"
                >
                    Вперед
                </button>
            </div>
        </div>
    );
}

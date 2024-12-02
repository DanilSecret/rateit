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

export default function SearchPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [cookies] = useCookies(["auth_token"]);
    const [currUserRole, setCurrUserRole] = useState("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/getAllProd", { method: "GET" });
            const result = await response.json();

            if (response.ok) {
                setProducts(result.result);
                setFilteredProducts(result.result);
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
            const response = await fetch(`/api/getUserInf?cookie=${cookies.auth_token}`, {
                method: "GET",
            });
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
        if (!confirm("Вы уверены, что хотите удалить этот товар?")) {
            return;
        }

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

    const handleSearch = (query: string) => {
        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(query) ||
            product.company.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
    };

    useEffect(() => {
        fetchProducts();
        checkRole();
    }, []);

    return (
        <div>
            <Header />
            <div className="p-5">
                <div>
                    <h2>Поиск товаров</h2>
                    <div className="flex gap-4 items-center mb-5">
                        <input
                            type="text"
                            placeholder="Поиск товаров..."
                            onChange={(e) => handleSearch(e.target.value.toLowerCase())}
                            className="border border-gray-300 rounded-md px-4 py-2 w-full"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <p>Загрузка товаров...</p>
                ) : filteredProducts.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="border border-gray-300 rounded-lg p-4 shadow-md w-[300px] m-2"
                            >
                                <Link href={`/products/${product.id}`}>
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            width={180}
                                            height={180}
                                            className="object-cover rounded-md"
                                        />
                                    ) : (
                                        <div className="bg-gray-200 w-[200px] h-[200px] flex items-center justify-center rounded-md">
                                            <span className="text-gray-500">Нет изображения</span>
                                        </div>
                                    )}
                                    <h3 className="text-lg font-bold mt-2">{product.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {product.description.length > 100
                                            ? product.description.slice(0, 100) + "..."
                                            : product.description}
                                    </p>
                                    <p className="text-md text-gray-800">
                                        Компания: {product.company}
                                    </p>
                                    <p className="text-md font-semibold mt-1">
                                        Рейтинг:{" "}
                                        <span className="text-yellow-500 font-bold">
                                            {parseFloat(product.average_rating).toFixed(1)}
                                        </span>{" "}
                                        ⭐
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Комментарии: {product.comm_count}
                                    </p>
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
                        ))}
                    </div>
                ) : (
                    <p>Товары отсутствуют</p>
                )}
            </div>
        </div>
    );
}

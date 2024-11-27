"use client"

import { useEffect, useState } from 'react';
import {useParams} from "next/navigation";

interface Product {
    id: number;
    name: string;
    image: string;
    average_rating: string;
    company: string;
    comm_count: number;
    description: string;
}

export default function ProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!params) return;

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                // const response = await fetch(`/api/getOneProd/${params?.id}`);
                const response = await fetch(`/api/getOneProd?id=${params?.id}`);
                const result = await response.json();
                if (response.ok) {

                    setProduct(result.product);
                } else {
                    console.error("Ошибка получения данных");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [params?.id]);

    if (isLoading) {
        return <div className="text-center text-lg font-bold mt-10">Загрузка...</div>;
    }

    if (!product) {
        return <div className="text-center text-lg font-bold mt-10">Товар не найден</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center bg-white shadow-md rounded-lg overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full md:w-1/2 h-80 object-cover"
                />
                <div className="w-full md:w-1/2 p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                    <p className="text-gray-600 text-sm mb-4">Производитель: <span className="text-gray-800">{product.company}</span></p>
                    <p className="text-gray-600 text-sm mb-4">
                        Рейтинг: <span className="text-yellow-500 font-bold">{product.average_rating}</span> ⭐
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                        Отзывы: <span className="font-semibold">{product.comm_count}</span>
                    </p>
                    <p className="text-gray-600 mb-6">{product.description}</p>
                </div>
            </div>
        </div>
    );
}

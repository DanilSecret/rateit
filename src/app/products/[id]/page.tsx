"use client"
import Image from "next/image";
import {useEffect, useState} from 'react';
import {useParams} from "next/navigation";
import {Header} from "@/app/components/header";
import Link from "next/link";
import { useCookies } from "react-cookie";

interface User {
    id: string;
    username: string;
    role:string;
}

interface Product {
    id: number;
    name: string;
    image: string;
    average_rating: string;
    company: string;
    comm_count: number;
    description: string;
}

interface Comment {
    id: number;
    rate: number;
    description: string;
    plus?: string;
    minus?: string;
    buy_method?: string;
    price?: string;
    product_id: number;
    author: string;
    user_id: string;
}

export default function ProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [cookies] = useCookies(["auth_token"]);
    const [currUser, setCurrUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        if (!params) return;

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/getOneProd?id=${params?.id}`);
                const result = await response.json();
                if (response.ok && result.product) {
                    setProduct(result.product);
                } else {
                    console.error("Ошибка получения данных о товаре");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        const checkUser = async () => {
            try {

                const response = await fetch(`/api/getUserInf?cookie=${cookies}`, { method: "GET" });
                const result = await response.json();

                if (response.ok) {
                    setIsAuth(true);
                    setCurrUser(result.userData);
                } else {
                    console.error("Ошибка получения данных");
                    setIsAuth(false);
                }
            } catch (error) {
                console.error("Ошибка при отправке данных:", error);
                setIsAuth(false);
            }
        };


        const fetchComments = async () => {
            try {
                const response = await fetch(`/api/getAllComments?id=${params?.id}`);
                const result = await response.json();
                if (response.ok && Array.isArray(result.comments)) {
                    setComments(result.comments);
                } else {
                    setComments([]); // Если данные некорректны, устанавливаем пустой массив
                    console.error("Ошибка получения комментариев");
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchProduct();
        fetchComments();
        checkUser();
    }, [params?.id]);


    if (isLoading) {
        return <div className="text-center text-lg font-bold mt-10">Загрузка...</div>;
    }

    if (!product) {
        return <div className="text-center text-lg font-bold mt-10">Товар не найден</div>;
    }

    const deleteComment = async (commentId: number, productId: number) => {
        if (!confirm("Вы уверены, что хотите удалить этот комментарий?")) return;

        try {
            const response = await fetch(`/api/deleteComment?id=${commentId}&productId=${productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${cookies.auth_token}`,
                },
            });

            if (response.ok) {
                alert("Комментарий успешно удален.");
                window.location.reload(); // Обновление страницы
            } else {
                console.error("Ошибка при удалении комментария");
            }
        } catch (error) {
            console.error("Ошибка при удалении:", error);
        }
    };


    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
        <div>
            <Header/>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div
                    className="grid grid-cols-1 md:grid-cols-2 items-center bg-white shadow-lg rounded-lg overflow-hidden mb-4">
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={180}
                        height={180}
                        className="object-cover rounded-md mx-auto w-36 sm:w-44"
                    />
                    <div className="w-full p-4 md:p-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                        <p className="text-gray-600 text-sm mb-4">
                            Производитель: <span className="text-gray-800">{product.company}</span>
                        </p>
                        <p className="text-gray-600 text-sm mb-4">
                            Рейтинг:{" "}
                            <span
                                className="text-yellow-500 font-bold">{parseFloat(product.average_rating).toFixed(1)}</span>{" "}⭐
                        </p>
                        <p className="text-gray-600 text-sm mb-4">
                            Отзывы: <span className="font-semibold">{product.comm_count}</span>
                        </p>
                        <p className="text-gray-600 mb-6 overflow-y-auto max-h-60 pr-2">
                            {product.description}
                        </p>
                    </div>
                </div>
                {isAuth && (
                    <Link
                        href={`/products/${product.id}/add_comment/`}
                        className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 mb-4"
                    >
                        Написать отзыв
                    </Link>
                )}

                <h2 className="text-2xl font-bold mb-4">Отзывы:</h2>

                <div className="grid gap-4">
                    {Array.isArray(comments) && comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="card bg-white shadow-lg rounded-lg p-4">
                                <div className="card-header text-lg font-semibold text-gray-800">
                                    Автор: {comment.author}
                                </div>
                                <div className="card-body">
                                    <p className="text-sm text-gray-600 mb-2">Оценка: {comment.rate} ⭐</p>
                                    <p className="text-gray-800 mb-2">Комментарий: {comment.description}</p>
                                    {comment.plus && <p className="text-green-600 mb-1">Плюсы: {comment.plus}</p>}
                                    {comment.minus && <p className="text-red-600 mb-1">Минусы: {comment.minus}</p>}
                                    {comment.buy_method && (
                                        <p className="text-gray-600 mb-1">Способ покупки: {comment.buy_method}</p>
                                    )}
                                    {comment.price && <p className="text-gray-600 mb-1">Цена: {comment.price}</p>}

                                    {/* Удаление комментария (доступно автору или админу) */}
                                    {(comment.author === currUser?.username || currUser?.role === 'admin') && (
                                        <button
                                            onClick={() => deleteComment(comment.id, product.id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mt-2"
                                        >
                                            Удалить
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600">Пока отзывов нет. Будьте первым!</p>
                    )}
                </div>
            </div>
        </div>


    );
}

"use client";

import { useState } from "react";
import * as yup from "yup";
import { useRouter } from "next/navigation";

interface LoginFormData {
    username: string;
    password: string;
}

const schema = yup.object({
    username: yup
        .string()
        .required("Имя пользователя обязательно")
        .min(3, "Имя пользователя должно содержать минимум 3 символа"),
    password: yup
        .string()
        .required("Пароль обязателен")
        .min(4, "Пароль должен содержать минимум 4 символов"),
});

export default function LoginForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginFormData>({
        username: "",
        password: "",
    });
    const [errors, setErrors] = useState<any>({});
    const [message, setMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = async () => {
        try {
            await schema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err: any) {
            const validationErrors: { [key: string]: string } = {};
            err.inner.forEach((error: any) => {
                validationErrors[error.path] = error.message;
            });
            setErrors(validationErrors);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = await validate();
        if (!isValid) {
            return;
        }

        try {
            const response = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (response.ok) {
                router.push("/");
            } else {
                setMessage(result.message || "Ошибка авторизации");
            }
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
            setMessage("Ошибка соединения с сервером");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-xl font-semibold text-center mb-4">Авторизация</h1>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Имя пользователя
                    </label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Имя пользователя"
                        value={formData.username}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    />
                    {errors.username && <p className="text-red-600">{errors.username}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Пароль
                    </label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.password && <p className="text-red-600">{errors.password}</p>}
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700">
                    Войти
                </button>
                {message && <p className="w-full text-center text-red-600 mt-4">{message}</p>}
            </form>
        </div>
    );
}

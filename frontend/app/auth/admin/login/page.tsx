"use client";
import { useToast } from "@/hooks/use-toast"
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";


// Define the form schema with Zod
const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

const LoginAdmin = () => {
    const { toast } = useToast();
    const [loading, setloading] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    // Initialize the form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            if (response.status === 201) {
                toast({
                    title: "Login Successful",
                    description: "You have been logged in successfully",
                    duration: 3000,
                    className: "bg-green-600 text-white border-0",
                });

                window.localStorage.setItem("isLoggIn", "true");
                setTimeout(() => {
                    router.push("/");
                }, 500);
            } else {
                toast({
                    variant: "Login Faild",
                    title: "Faild!",
                    description: "حدث خطأ أثناء التسجيل",
                });
            }
        } catch (error) {
            toast({
                title: "Login Failed",
                description: "Invalid email or password",
                variant: "destructive"
            });
        }
    };
    return (
        <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col mx-auto my-20 md:flex-row bg-gray-100 shadow-2xl rounded-2xl overflow-hidden w-full max-w-3xl h-[550px]"
        >
            <motion.div
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full p-10 flex flex-col justify-center"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h1 className="text-3xl font-bold text-center text-purple-600 mb-8">Welcome Admin</h1>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                                                <Input
                                                    placeholder="your@email.com"
                                                    className="w-full rounded-lg p-3 pr-10 border-2 border-purple-100 focus:border-purple-500 transition-all"
                                                    {...field}
                                                />
                                            </motion.div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password Field */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="w-full rounded-lg p-3 pr-10 border-2 border-purple-100 focus:border-purple-500 transition-all"
                                                    {...field}
                                                />
                                            </motion.div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg transition-all ${form.formState.isSubmitting ? "opacity-80" : "hover:shadow-lg"
                                    }`}
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="animate-spin mr-2" />
                                        Signing in...
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </motion.button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center space-y-3">
                        <motion.div whileHover={{ scale: 1.05 }}>
                            <Link
                                href="#"
                                className="text-purple-600 hover:underline text-sm"
                            >
                                Forgot password?
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
export default LoginAdmin;
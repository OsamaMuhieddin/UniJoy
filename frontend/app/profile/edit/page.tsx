'use client';
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
export default function EditProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [form, setForm] = useState({
        name: "Sarah Johnson",
        email: "sarah.johnson@uni.edu",
        university: "Oxford University",
        bio: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // لإرسال الـ cookie مع التوكن
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            toast({
                title: "Success",
                description: "Profile updated successfully.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-purple-100 p-6 flex items-center justify-center">
            <motion.form
                onSubmit={handleSubmit}
                className="w-full max-w-lg bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-2xl font-bold text-center text-purple-700">Edit Profile</h2>
                <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
                <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                <Input name="university" placeholder="University" value={form.university} onChange={handleChange} />
                <textarea
                    name="bio"
                    placeholder="Short bio..."
                    className="w-full p-2 rounded-md border border-gray-300"
                    rows={3}
                    value={form.bio}
                    onChange={handleChange}
                ></textarea>
                <Button type="submit" className="w-full">Save Changes</Button>
            </motion.form>
        </div>
    );
}
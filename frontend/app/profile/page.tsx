'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
    name: string;
    email: string;
    university: string;
    bio?: string;
    avatar?: string;
}


export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const { toast } = useToast();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setProfile({
            name: "Sarah Johnson",
            email: "sarah.johnson@uni.edu",
            university: "Oxford University",
            bio: "Student of Computer Science. Passionate about AI and Tech Events.",
            avatar: "https://i.pravatar.cc/150?img=47"
        });
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${process.env.API_URL}/api/profile`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch profile");
                }

                setUser(data);
            } catch (err: any) {
                toast({
                    title: "Error loading profile",
                    description: err.message,
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        //fetchProfile();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-[60vh]">Loading...</div>;
    }
    if (!profile) {
        return <div className="text-center py-20 text-xl">Loading profile...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-white p-6 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-lg"
            >
                <Card className="rounded-2xl shadow-lg border border-purple-300">
                    <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-24 h-24 rounded-full border-4 border-purple-400 shadow-md"
                        />
                        <h2 className="text-2xl font-semibold">{profile.name}</h2>
                        <p className="text-gray-500">{profile.email}</p>
                        <p className="text-gray-600">{profile.university}</p>
                        {profile.bio && <p className="text-sm text-gray-700 italic">{profile.bio}</p>}
                        <Button variant="default" className="mt-4" asChild>
                            <a href="/profile/edit">Edit Profile</a>
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
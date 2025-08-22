"use client"
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
export default function AddEventSection() {
    const { userRole } = useAuth();
    return (
        <>
            {userRole === "host" ?
                <section className="bg-purple-100 py-12">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <h2 className="text-3xl font-bold text-purple-800 mb-4">Want to Host a University Event?</h2>
                        <p className="text-gray-700 mb-6">Share your idea and let the whole campus know about it!</p>
                        <Link href="/add-event">
                            <span className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-semibold transition"> Add Your Event </span>
                        </Link>
                    </div>
                </section>
            :<></>}
        </>
    );
}
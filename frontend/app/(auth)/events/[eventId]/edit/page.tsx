// app/(auth)/host/events/[eventId]/edit/page.tsx

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPin, Ticket, Image as ImageIcon } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const eventSchema = z.object({
    // نفس schema صفحة الإنشاء
});

export default function EditEventPage() {
    const { toast } = useToast();
    const { eventId } = useParams();
    const router = useRouter();
    const [eventData, setEventData] = useState(null);

    const form = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            // القيم الافتراضية من البيانات المسترجعة
        },
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}`);
                const data = await response.json();
                setEventData(data);
                form.reset(data);
            } catch (error) {
                toast.error('فشل في تحميل بيانات الفعالية');
            }
        };
        fetchEvent();
    }, [eventId]);

    const onSubmit = async (values: z.infer<typeof eventSchema>) => {
        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'PUT',
                body: JSON.stringify(values),
            });
            if (!response.ok) throw new Error('فشل في التحديث');
            toast({
                title: "Login Successful",
                description: "You have been logged in successfully",
                duration: 3000,
                className: "bg-green-600 text-white border-0",
            });

            router.push('/host/events');
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto p-6"
        >
            {/* نفس واجهة الإنشاء مع تعديل القيم */}
            {/* ... */}
        </motion.div>
    );
}
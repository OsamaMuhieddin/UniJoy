import { BadgeCheck, Ban, Clock, Hourglass, XCircle } from "lucide-react";

export const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
        case "approved":
            return {
                label: "approved",
                icon: <BadgeCheck className="w-4 h-4 text-green-600" />,
                className: "bg-green-100 text-green-700",
            };
        case "rejected":
            return {
                label: "rejected",
                icon: <Ban className="w-4 h-4 text-blue-600" />,
                className: "bg-blue-100 text-blue-700",
            };
        case "pending":
            return {
                label: "pending",
                icon: <Hourglass className="w-4 h-4 text-yellow-600" />,
                className: "bg-yellow-100 text-yellow-700",
            };
        default:
            return {
                label: "غير معروف",
                icon: <XCircle className="w-4 h-4 text-gray-600" />,
                className: "bg-gray-100 text-gray-700",
            };
    }
};
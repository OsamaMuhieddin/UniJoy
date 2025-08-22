// components/dashboard/RecentActivities.tsx
import { User } from 'lucide-react';

export default function RecentActivities() {
    const activities = [
        {
            id: 1,
            user: { name: "Ahmed Ali", initial: "A" },
            action: "created event",
            event: "Tech Conference",
            time: "2h ago"
        }
    ];

    return (
        <div className="space-y-3">
            {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 items-start p-2 hover:bg-gray-50 rounded-lg">
                    <div className="bg-indigo-50 p-2 rounded-full text-indigo-600">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm">
                            <span className="font-medium">{activity.user.name}</span> {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
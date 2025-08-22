import { Calendar, MapPin, Clock } from 'lucide-react';

const events = [
    {
        id: 1,
        title: "Tech Conference 2024",
        date: "2024-06-15",
        time: "09:00 - 17:00",
        location: "Main Auditorium"
    },
    // المزيد من الأحداث...
];

export default function UpcomingEvents() {
    return (
        <div className="space-y-4">
            {events.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{event.date} • {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                        </div>
                    </div>
                    <button className="text-sm text-indigo-600 hover:underline">
                        Details
                    </button>
                </div>
            ))}
        </div>
    );
}
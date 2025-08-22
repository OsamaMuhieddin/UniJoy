
import HeroSection from "@/components/ui/HeroSection";
import EventCategories from "@/components/ui/EventCategories";
import UpcomingEvents from "@/components/ui/UpcomingEvents";
import AddEventSection from "@/components/ui/AddEventSection";
import PastEvents from "@/components/ui/PastEvents";
import ReviewsSection from "@/components/ui/ReviewsSection";

export default function EventHome() {
    return (
        <main className="bg-white text-gray-800">
            <HeroSection />
            <EventCategories />
            <UpcomingEvents />
            <AddEventSection />
            {/* <PastEvents /> */}
            <ReviewsSection />
        </main>
    );
}
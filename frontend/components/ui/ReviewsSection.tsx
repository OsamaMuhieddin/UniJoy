// components/ReviewsSection.tsx 
const reviews = [{ name: "Sara Ahmed", university: "NSU", review: "One of the best organized tech events I’ve attended! Loved the speakers and the energy." }, { name: "Tariq Hasan", university: "IUB", review: "Great chance to meet fellow developers and showcase our hackathon project." }, { name: "Rima Chowdhury", university: "BRAC", review: "A colorful event full of talent and culture. Waiting for the next one!" }];

export default function ReviewsSection() {
    return (
        <section className="bg-white py-12">
            <div className="max-w-5xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-10">What Students Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((r, idx) => (<div key={idx} className="bg-gray-100 p-6 rounded-lg shadow">
                        <p className="text-gray-700 italic mb-4">“{r.review}”</p>
                        <h4 className="text-purple-700 font-bold">{r.name}</h4>
                        <span className="text-sm text-gray-500">{r.university}</span>
                    </div>
                    ))}
                </div>
            </div>
        </section>);
}
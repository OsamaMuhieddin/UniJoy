interface TestimonialsType {
    id: number,
    name: string,
    image: string,
    rating: number,
    text: string,
}
export const testimonials: TestimonialsType[] = [
    {
        id: 1,
        name: "م. عماد الصمادي",
        image: "/images/person-1.png",
        rating: 3,
        text: "تطبيق رائع ساعدني أتواصل مع دكتور خصوصاً لما تكون عندي مشكلة صحية ضرورية",
    },
    {
        id: 2,
        name: "أ. ماريا هيثم",
        image: "/images/person-2.png",
        rating: 5,
        text: "تواصلت مع طبيب عبر التطبيق وتفاجأت بسرعة الرد والاستجابة، وكان الطبيب متعاون جدًا.",
    },
    {
        id: 3,
        name: "جابر سمير",
        image: "/images/person-3.png",
        rating: 4,
        text: "كنت مترددة من مشاركة بياناتي الشخصية، ولكن بعد تجربة الخدمة والتواصل مع الطبيب شعرت بالأمان والخصوصية.",
    },
];
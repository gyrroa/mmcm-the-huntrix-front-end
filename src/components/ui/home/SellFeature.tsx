import Image from "next/image";

const SellFeature = ({
    image,
    title,
    description,
}: {
    image: string;
    title: string;
    description: string;
}) => (
    <div className="flex flex-col items-center text-center w-full h-full bg-white shadow-md rounded-lg pb-8 flex-1 transition hover:scale-[102%]">
        <div className="relative w-20 h-20 mt-8 mb-4">
            <Image
                src={image}
                alt={title}
                fill
                className="object-contain"
                placeholder="blur"
                blurDataURL="/logo.svg"
            />
        </div>
        <h3 className="text-xl font-bold text-[#002353] mb-2">{title}</h3>
        <p className="text-[#5C7188] text-sm font-medium">{description}</p>
    </div>

);
export default SellFeature

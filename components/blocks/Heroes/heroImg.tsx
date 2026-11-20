
export default function HeroImg({
    src,
    alt
}: {
    src: string;
    alt: string;
}){
    return (
        <>
            <img src={src} alt={alt} className="w-full h-auto" />
        </>
    );
}
// components/blocks/Pricing.tsx
export function Pricing({ 
  title, 
  price, 
  features, 
  bgColor 
}: { 
  title: string; 
  price: string; 
  features: string[];
  bgColor?: string; 
}) {
  return (
    <div style={{ backgroundColor: bgColor || '#f3f4f6' }} className="p-10 text-center rounded-xl">
      <h2 className="text-3xl font-bold">{title}</h2>
      <div className="text-5xl my-4">{price}</div>
      <ul className="space-y-2">
        {features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
    </div>
  );
}
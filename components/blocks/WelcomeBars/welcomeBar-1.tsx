export default function WelcomeBar1({
  bgColor,  
  text_color,
  welcome_txt
}: {
  bgColor?: string;
  text_color?: string;
  welcome_txt: string;
}) {
  return (
    <div style={{ backgroundColor: bgColor || '#f3f4f6', color: text_color || '#000000' }} className="flex items-center border-none justify-center px-4 py-2">
      {welcome_txt}
    </div>
  );
}
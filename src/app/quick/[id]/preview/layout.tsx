import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function QuickPreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={robotoMono.className}
      style={{
        fontFamily: '"Roboto Mono", "Courier New", monospace',
        lineHeight: "1.4em",
      }}
    >
      {children}
    </div>
  );
}

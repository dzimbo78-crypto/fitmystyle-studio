import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'FitMyStyle · FamilyLook Studio',description:'Family outfit matching and tailor measurement studio'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pl"><body>{children}</body></html>}
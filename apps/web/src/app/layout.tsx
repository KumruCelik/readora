import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Navbar from '@/components/Navbar'
import { BookSearchProvider } from '@/components/BookSearchModal'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Readora',
  description: 'Sosyal okuma platformu',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={cn("font-sans", geist.variable)}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <BookSearchProvider>
          <Navbar />
          {children}
        </BookSearchProvider>
      </body>
    </html>
  )
}

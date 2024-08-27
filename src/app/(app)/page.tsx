'use client'
import React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from 'lucide-react';

export default function HomePage() {

 const messages = [
  {
    "title": "Message from Ghost",
    "content": "AI is transforming industries faster than ever! The future looks incredibly exciting.",
    "received": "10 minutes ago"
},
{
    "title": "Message from Unknown",
    "content": "Bitcoin continues to disrupt traditional finance. The latest trends are truly fascinating!",
    "received": "2 hours ago"
},
{
    "title": "Message from Anonymous",
    "content": "What do you think are the biggest advantages of Web 3.0?",
    "received": "1 day ago"
},
{
    "title": "Message from Confidential",
    "content": "DeFi is changing the landscape of finance with decentralized lending and borrowing platforms.",
    "received": "3 hours ago"
}
]

  return (
  <>
  <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-gray-800 text-white">
    <section className="text-center mb-8 md:mb-12">
      <h1 className="text-3xl md:text-5xl font-bold">

      </h1>
      <p className="mt-3 md:mt-4 text-base md:text-lg">

      </p>
    </section>

    <Carousel 
    plugins={[Autoplay({ delay: 3000 })]}
    className="w-full max-w-lg md:max-w-xl">

      <CarouselContent>
        {messages.map((message, index) => (
          <CarouselItem key={index}>
            <div className="p-4">
              <Card>
                <CardHeader>
                    <CardTitle>{message.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                    <Mail className="flex-shrink-0" />
                    <div>
                      <p>{message.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {message.received}
                      </p>
                    </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className='bg-gray-600 border-none'/>
      <CarouselNext className='bg-gray-600 border-none'/>
    </Carousel>
  </main>

  <footer className="text-center p-4 md:p-6 bg-gray-900 text-white">
        © 2024 GhostNotes. All rights reserved.
      </footer>
  </>
    
  )
}


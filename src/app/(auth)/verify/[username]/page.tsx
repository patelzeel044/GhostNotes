"use client"
import { Button } from "@/components/ui/button";
import {
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
    } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { verifySchema } from "@/schemas/verify.schema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";


export default function Page() {

    const router = useRouter();
    const params = useParams();

    const{ toast } = useToast()

    const form = useForm <z.infer<typeof verifySchema>> ({
        resolver: zodResolver(verifySchema),
        defaultValues: {
        code: "",
    },
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {

        try {
            const response = await axios.post <ApiResponse> ('/api/verify-code', {
                username: params.username,
                code: data.code,
            })

            toast({
                title: response.data.success ? "Success" : "Failure",
                description: response.data.message,
            });
        
            router.replace('/sign-in');

        } catch (error) {
            const axiosError = error as AxiosError <ApiResponse>

            toast({
                title:"Verification Failed",
                description: axiosError.response?.data.message ??
                'An error occurred. Please try again.',
                variant: 'destructive',
            })
        }
    }


  return (

    
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                    Verify Your Account
                </h1>
                <p className="mb-4">
                    Enter the verification code sent to your email
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                            <Input placeholder="Verification Code" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className='w-full'>
                    Verify
                </Button>
                </form>
            </Form>
        </div>
    </div>
    )
}

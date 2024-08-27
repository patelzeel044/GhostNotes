'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z  from "zod"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"    
import { 
    Form,
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
    } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signInSchema } from "@/schemas/signIn.schema"
import { signIn } from "next-auth/react"
import googleSvg from "../../../../public/google.svg";
import githubSvg from "../../../../public/github.svg";
import Image from "next/image";


export default function Page() {

    const [IsSubmitting, setIsSubmitting] = useState(false)

    

    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues:{
            identifier: '',
            password: '',
        }
    })
    
    const onSubmit = async (data: z.infer<typeof signInSchema>) => {

        setIsSubmitting(true);

        const result = await signIn("credentials", {
            redirect: false,
            identifier: data.identifier,
            password: data.password
        })

        if(result?.error){
            if (result.error === "CredentialsSignIn") {
                toast({
                    title:"Login Failed",
                    description:"Incorrect username or Password"
                })
            } else {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                })
            }
        }

        setIsSubmitting(false);

        if (result?.url) {
            router.replace('/dashboard');
        }

    }

    return (

    <div className="flex justify-center items-center min-h-screen bg-gray-800">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                    GhostNotes
                </h1>
                <p className="mb-4">
                    SignIn to Get Notes From the Ghosts 
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Username/Email</FormLabel>
                        <FormControl>
                            <Input placeholder="Username/Email" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className='w-full' disabled={IsSubmitting}>
                {IsSubmitting ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                    </>
                ) : (
                    'SignIn'
                )}
            </Button>
                </form>
            </Form>
            <div className=" grid gap-x-2 grid-cols-2">
                        <Button
                            onClick={() => signIn("google")}
                            className="w-full"
                        >
                            <Image src={googleSvg} alt="googleSvg" className="scale-50"></Image>
                            Google
                        </Button>
                        <Button
                            onClick={() => signIn("github")}
                            className="w-full"
                        >
                            <Image src={githubSvg} alt="githubSvg" className="scale-50 -ml-6 p-1"></Image>
                            <span className="-ml-5">Github</span>
                        </Button>
                    </div>
            <div className="text-center mt-4">
            <p>
                Don&apos;t have an Account?{' '}
                <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
                SignUp
                </Link>
            </p>
        </div>
        </div>
    </div>
    )
}

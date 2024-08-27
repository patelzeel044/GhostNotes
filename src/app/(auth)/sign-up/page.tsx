'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z  from "zod"
import { useDebounceCallback } from 'usehooks-ts'
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { signUpSchema } from "@/schemas/signUp.schema"
import axios, {AxiosError} from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signIn } from "next-auth/react"
import googleSvg from "../../../../public/google.svg";
import githubSvg from "../../../../public/github.svg";
import Image from "next/image";
export default function Page() {

    const [Username, setUsername] = useState('')
    const [UsernameMessage, setUsernameMessage] = useState('')
    const [IsCheckingUsername, setIsCheckingUsername] = useState(false)
    const [IsSubmitting, setIsSubmitting] = useState(false)

    const debounced = useDebounceCallback(setUsername, 400);

    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues:{
            username: '',
            email: '',
            password: '',
        }
    })

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if(Username){
                setIsCheckingUsername(true)
                setUsernameMessage('')
                try {
                    const response= await axios.get <ApiResponse> (`/api/check-username-unique?username=${Username}`)
                    setUsernameMessage(response.data.message)

                } catch (error) {
                    const axiosError = error as AxiosError <ApiResponse>
                    setUsernameMessage(axiosError.response?.data?.message ?? "Error checking Username")

                } finally {
                    setIsCheckingUsername(false);
                }
            }
        }
        checkUsernameUnique();
    }, [Username])
    
    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {

        setIsSubmitting(true);

        try {
            const response = await axios.post <ApiResponse> ('/api/sign-up', data)

            toast({
                title: response.data.success ? "Success" : "Failure",
                description: response.data.message,
            })
            router.replace(`/verify/${data.username}`);

        } catch (error) {

            console.log("Error during Sign-up", error)
            const axiosError = error as AxiosError <ApiResponse>

            toast({
                title:"Sign-up Failed",
                description: axiosError.response?.data.message,
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false);
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
                SignUp to Get Notes From the Ghosts
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            <Input placeholder="username" 
                            {...field}
                            onChange={(e)=>{
                                field.onChange(e);
                                debounced(e.target.value)
                            }}
                            />
                        </FormControl>
                        <FormDescription>
                            { IsCheckingUsername && <Loader2 className="animate-spin"/> }
                            { !IsCheckingUsername && UsernameMessage && (
                                <span className={`text-sm ${UsernameMessage === "Username is unique" 
                                                        ? 'text-green-500'
                                                        : 'text-red-500' }`}>
                                    {UsernameMessage}
                                </span>
                            )
                            }
                        </FormDescription>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormDescription className="text-muted text-gray-400 text-sm">
                            We will send you a verification code
                        </FormDescription>
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
                    'Sign Up'
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
                Already have an Account?{' '}
                <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                SignIn
                </Link>
            </p>
            </div>
        </div>
    </div>
    )
}

'use client'
import MessageCard from '@/components/MessageCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/model/user.model';
import { acceptMessageSchema } from '@/schemas/acceptMessage.schema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';


export default function Page() {

    const [Messages, setMessages] = useState <Message[]> ([]);
    const [IsLoading, setIsLoading] = useState(false);
    const [IsSwitchLoading, setIsSwitchLoading] = useState(false)
    const [deleting, setDeleting] = useState(false);

    const { toast } = useToast();
    const { data: session } = useSession();

    const { register, watch, setValue } = useForm({
        resolver: zodResolver(acceptMessageSchema),
    });

    const acceptMessages = watch('acceptMessages');


    const handleDeleteMessage = (messageId: string) => {
        setMessages(Messages.filter((message) => message._id !== messageId));
    }


    const fetchAcceptMessages = useCallback ( async () => {

        setIsSwitchLoading(true);
        try {
            const response = await axios.get<ApiResponse>('/api/accept-messages');
            setValue('acceptMessages', response.data.isAcceptingMessages)

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description: axiosError.response?.data.message
                        ?? 'Failed to fetch message acceptance status',
                variant: 'destructive',
            })
        } finally {
            setIsSwitchLoading(false);
        }

    },[ setValue, toast ])


    const fetchMessages = useCallback ( async (refresh: boolean = false) => {

        setIsSwitchLoading(true);
        setIsLoading(true);
        try {
            const response = await axios.get<ApiResponse>('/api/get-messages');
            
            setMessages(response.data?.messages || [])

            if (refresh) {
                toast({
                title: 'Messages Refreshed',
                description: 'Showing latest messages',
                });
            }

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description: axiosError.response?.data.message
                        ?? 'Failed to fetch messages',
                variant: 'destructive',
            })
        } finally {
            setIsSwitchLoading(false);
            setIsLoading(false);
        }

    },[ setIsLoading, setMessages, toast ])


    useEffect(() => {
        if (!session || !session.user) return;
    
        fetchMessages();
    
        fetchAcceptMessages();
    }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);
    

    const handleSwitchChange = async () => {
        try {
            const response = await axios.post<ApiResponse>('/api/accept-messages',{
                acceptMessages: !acceptMessages,
            });
            setValue('acceptMessages', !acceptMessages);
            toast({
                title: response.data.message,
            });
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description: axiosError.response?.data.message
                        ?? 'Failed to switch accept messages status',
                variant: 'destructive',
            })
        }
    }

    const deleteAllMessages = async () => {
        try {
            setDeleting(true);
            const response = await axios.delete<ApiResponse>(
                "/api/delete-all-messages"
            );
            if (response?.data?.success) {
                setMessages([]);
                toast({
                    title: "Delete Success",
                    description: response?.data?.message,
                });
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "Delete Failed",
                description: axiosError.response?.data.message,
                variant: "destructive",
            });
        } finally {
            setDeleting(false);
        }
    };

    
        if (!session || !session.user) {
            return 
        }

        const user: User = session?.user;
        
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const profileUrl = `${baseUrl}/u/${user.username}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl);
        toast({
            title: 'URL Copied!',
            description: 'Profile URL has been copied to clipboard.',
        });
    }

    
        return (
            <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
        
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
                <div className="flex items-center">
                <input
                    type="text"
                    value={profileUrl}
                    disabled
                    className="input input-bordered w-full p-2 mr-2"
                />
                <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>
        
            <div className="mb-4">
                <Switch
                {...register('acceptMessages')}
                checked={acceptMessages}
                onCheckedChange={handleSwitchChange}
                disabled={IsSwitchLoading}
                />
                <span className="ml-2">
                Accept Notes: {acceptMessages ? 'On' : 'Off'}
                </span>
            </div>
            <Separator />
            <div className='flex justify-between items-center'>
            <Button
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                e.preventDefault();
                fetchMessages(true);
                }}
            >
                {IsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                <RefreshCcw className="h-4 w-4" />
                )}
            </Button>
            {Messages?.length > 0 && (
                            <>
                                <AlertDialog>
                                    <AlertDialogTrigger>
                                        <Button disabled={deleting}>
                                            {deleting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                    Please wait
                                                </>
                                            ) : (
                                                "Delete All Notes"
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Are you absolutely sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone.
                                                This will permanently delete all
                                                the Notes recieved.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={deleteAllMessages}
                                            >
                                                Continue
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {Messages.length > 0 ? (
                Messages.map((message, index) => (
                    <MessageCard
                    key={index}
                    message={message}
                    onMessageDelete={handleDeleteMessage}
                    />
                ))
                ) : (
                <p>No Notes to display.</p>
                )}
            </div>
            </div>
        );
        }
        
import { Link, usePage } from '@inertiajs/react';
import { Wifi } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps, SharedData } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
                    <div className="absolute bottom-0 left-0 right-0 top-0 m-auto h-[300px] w-[300px] rounded-full bg-primary/20 opacity-40 blur-[80px]" />
                </div>
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-medium"
                >
                    <Wifi className="mr-2 size-8 text-white" />
                    WiFi Lambda
                </Link>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-center sm:items-center">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

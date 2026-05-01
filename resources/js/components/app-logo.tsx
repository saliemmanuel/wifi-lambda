import { Wifi } from 'lucide-react';

export default function AppLogo({ className }: { className?: string }) {
    return (
        <div className={className}>
            <div className="flex items-center gap-2 text-foreground">
                <Wifi className="size-6 stroke-[2.5px]" />
                <span className="text-xl font-black tracking-tight uppercase">
                    ZAWIFI
                </span>
            </div>
        </div>
    );
}

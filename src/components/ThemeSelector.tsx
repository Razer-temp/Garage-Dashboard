import { useEffect, useState } from "react";
import { Palette, Check, Circle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const themes = [
    { name: "Industrial (Default)", value: "default", color: "hsl(38 92% 50%)" },
    { name: "Midnight Blue", value: "midnight", color: "hsl(221 83% 53%)" },
    { name: "Forest Green", value: "forest", color: "hsl(142 76% 36%)" },
    { name: "Luxury Gold", value: "luxury", color: "hsl(47 95% 53%)" },
];

export function ThemeSelector() {
    const [currentBrand, setCurrentBrand] = useState("default");

    useEffect(() => {
        const saved = localStorage.getItem("brand-theme") || "default";
        setCurrentBrand(saved);
        applyTheme(saved);
    }, []);

    const applyTheme = (theme: string) => {
        const root = window.document.documentElement;
        if (theme === "default") {
            root.removeAttribute("data-brand");
        } else {
            root.setAttribute("data-brand", theme);
        }

        localStorage.setItem("brand-theme", theme);
        setCurrentBrand(theme);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 hover:bg-accent ring-offset-background transition-colors">
                    <Palette className="h-5 w-5" />
                    <span className="sr-only">Select brand theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] animate-scale-in">
                <DropdownMenuLabel>Brand Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {themes.map((theme) => (
                    <DropdownMenuItem
                        key={theme.value}
                        onClick={() => applyTheme(theme.value)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full border border-muted"
                                style={{ backgroundColor: theme.color }}
                            />
                            <span>{theme.name}</span>
                        </div>
                        {currentBrand === theme.value && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

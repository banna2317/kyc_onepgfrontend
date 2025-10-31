import { cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {

      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all duration-300",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-all duration-300",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-300",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300",
        ghost: "hover:bg-accent hover:text-accent-foreground transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline transition-all duration-300",
        hero: "bg-gradient-hero text-white shadow-glow hover:shadow-lg hover:scale-105 transform transition-all duration-300 border-0",
        success: "bg-gradient-success text-success-foreground shadow-sm hover:shadow-md transition-all duration-300",
        premium: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-lg hover:scale-105 transform transition-all duration-300 border-0",
        fintech: "bg-white/10 backdrop-blur-sm text-primary-foreground border border-white/20 hover:bg-white/20 transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        iconlg: "h-12 w-12",
      },


    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant?: "primary" | "secondary";
};

const variantClasses = {
    primary: "text-white border-2 border-[#3871C1] hover:bg-[#285080] bg-[#3871C1]",
    secondary: "text-[#002353] border-2 border-[#B8D6FF] hover:bg-[#E3F0FF]",
};

const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    ...props
}) => (
    <button
        className={`cursor-pointer px-6 py-3 rounded-[8px] font-bold transition-colors ${variantClasses[variant]}`}
        {...props}
    >
        {children}
    </button>
);

export default Button;
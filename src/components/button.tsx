import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "tertiary" | "quaternary" | "property";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses = {
    primary: "text-white border-2 border-[#3871C1] hover:brightness-90 bg-[#3871C1] px-6 py-3 ",
    secondary: "text-[#002353] border-2 border-[#B8D6FF] hover:brightness-90 bg-[#FFFFFF]/80 px-6 py-3 ",
    tertiary: "text-white border-2 border-[#002353] bg-[#002353] hover:brightness-90 px-2.5 py-2.5 w-fit",
    quaternary: "text-[#3871C1] border-2 border-[#D2E4FF] hover:brightness-90 bg-[#ECF4FF] px-6 py-3",
    property: "text-white border-2 border-[#002353] bg-[#002353] hover:brightness-90 px-8 py-4 w-fit",
};

const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    ...props
}) => (
    <button
        className={`cursor-pointer rounded-[8px] font-bold transition-colors ${variantClasses[variant]}`}
        {...props}
    >
        {children}
    </button>
);

export default Button;
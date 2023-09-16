type InputProps = {
    id: string;
    children?: React.ReactNode;
    type: string;
    placeholder?: string;
};

export default function Input({ id, children, type, placeholder }: InputProps) {
    return (
        <div className="relative">
            <input
                id={id}
                autoComplete="off"
                type={type}
                placeholder="Full Name"
                className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300
                    focus:outline-none focus:border-secondary-200 bg-transparent
                    font-mulish text-white pl-1"
            />
            <label
                htmlFor={id}
                className="absolute left-0 -top-3.5 text-[#ccc] text-sm
                    peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2
                    transition-all peer-focus:-top-3.5 peer-focus:text-[#ccc] peer-focus:text-sm peer-placeholder-shown:pl-1
                    font-mulish pl-0 select-none peer-focus:pl-0"
            >
                {children ?? placeholder}
            </label>
        </div>
    );
}

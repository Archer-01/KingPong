import Logo from '@/components/Logo';

export default function BordGame() {
    return (
        <div className="border-secondary-500 bg-gradient-radial from-primary to-background relative flex h-[250px] w-[350px] items-center justify-between rounded-3xl border-8 sm:h-[200px] sm:w-[350px] md:h-[400px] md:w-[700px] lg:h-[500px] lg:w-[1000px] xl:h-[600px] xl:w-[1200px]">
            <div className="from-secondary-200 to-secondary-500 sm:h-22 md:h-26 border-inactive-200 h-20 w-2 rounded-l-3xl border-2 bg-gradient-to-r sm:w-3 md:w-3  lg:h-32 lg:w-4 xl:h-36 xl:w-4"></div>
            <Logo
                className=" animate-ball absolute h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 lg:h-6 lg:w-6"
                mylogo="/images/ball.svg"
            />
            <div
                className="border-inactive-200 from-secondary-200 to-secondary-500 sm:h-22 md:h-26 h-20 w-2 rounded-r-3xl border-2
             bg-gradient-to-l sm:w-3 md:w-3  lg:h-32 lg:w-4 xl:h-36 xl:w-4"
            ></div>
        </div>
    );
}

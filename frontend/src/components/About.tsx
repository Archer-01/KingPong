import CardAbout from './CardAbout';

import { Jockey_One } from 'next/font/google';






const AnimationSpin = () => {
    return (
        <div className=" flex items-center justify-center absolute inset-0 animate-[rotation_1.5s_linear_infinite] blur-xl h-48 w-48 xl:w-64 xl:h-64 ">
            <div className="h-24 w-24 xl:h-36 xl:w-36 bg-green-600 absolute left-0 rounded-full mix-blend-screen "></div>
            <div className="h-24 w-24 xl:h-36 xl:w-36 bg-secondary-500 absolute right-0 rounded-full mix-blend-screen "></div>
            <div className="h-24 w-24 xl:h-36 xl:w-36 bg-red-600 rounded-full absolute top-1 mix-blend-screen"></div>
            <div className="h-24 w-24 xl:h-36 xl:w-36 bg-cyan-600 rounded-full absolute bottom-1 mix-blend-screen"></div>
        </div>
    );
};

export default function About() {
    return (
        <div className="justify-center items-center">
            <div className="flex flex-col ">
                <div className="flex justify-center text-white drop-shadow-neon-white text-4xl border-red-400 col-span-2 border-2 z-20 font-jockey-one  ">
                    About
                </div>
                <div className="sm:text-sm md:text-md lg:text-lg xl:text-xl  text-[#E6E6E6]  md:absolute md:inset-0 flex justify-center items-center border-2">
                    <div className="bg-blend-darken backdrop-blur backdrop-brightness-75 shadow-inner rounded-xl z-20 xl:mx-[42%] lg:mx-[38%] md:mx-64 ">
                        <div className="m-6 ">
                            Lorem Ipsum is simply dummy text of the printing and
                            typesetting industry. Lorem Ipsum has been the
                            industry's standard dummy text ever since the 1500s,
                            when an unknown printer took a galley of type and
                            scrambled it to make a type specimen book. It has
                            survived not only five centuries, but also the leap
                            into electronic typesetting, remaining essentially
                            unchanged. It was popularised in the 1960s with the
                            release of Letraset sheets containing Lorem Ipsum
                            passages
                        </div>
                    </div>
                </div>
                <div className=" md:w-screen lg:w-fit grid sm:grid-cols-2 md:grid-cols-6 md:my-52 z-20 border-2 border-green-500">
                    <div className="my-2 sm:col-span-2 flex justify-start md:col-start-1 md:col-span-2">
                        <CardAbout
                            firstName="Aymane"
                            LastName="Aggoujjil"
                            links={[
                                'https://github.com/AymanAkashi',
                                'https://www.linkedin.com/in/aymane-aggoujjil/',
                                '',
                            ]}
                            description=""
                            image="https://cdn.intra.42.fr/users/90acb3217b4be8350fa9f9fc32dd2200/aaggoujj.jpg"
                            className="animate-dragR w-full h-auto"
                        />
                    </div>
                    <div className="my-2 sm:col-span-2 md:col-start-5 md:col-span-2 flex justify-end">
                        <CardAbout
                            firstName="Omar"
                            LastName="Aizab"
                            links={[
                                'https://github.com/oaizab',
                                'https://www.linkedin.com/in/omaraizab/',
                                '',
                            ]}
                            description=""
                            image="https://cdn.intra.42.fr/users/10ebb5a3e3bf8fdf210566bfe0a102e0/oaizab.jpg"
                            className="animate-dragL w-full h-auto"
                        />
                    </div>
                    <div className="my-2 sm:col-span-2 flex justify-start md:col-start-1 md:col-span-2">
                        <CardAbout
                            firstName="Moussa"
                            LastName="Seddik"
                            links={[
                                'https://github.com/Mou-SED',
                                'https://www.linkedin.com/in/moussaseddik/',
                                '',
                            ]}
                            description=""
                            image="https://cdn.intra.42.fr/users/811c6da3283271dcc1794c667938159c/moseddik.jpg"
                            className="animate-dragR w-full h-auto"
                        />
                    </div>
                    <div className="my-2 sm:col-span-2 flex justify-end md:col-start-5 md:col-span-2 ">
                        <CardAbout
                            firstName="Hamza"
                            LastName="Haddani"
                            links={[
                                'https://github.com/Archer-01/',
                                'https://www.linkedin.com/in/hamza-haddani/',
                                '',
                            ]}
                            description=""
                            image="https://cdn.intra.42.fr/users/40ff48680a112910914c132211cbc9a3/hhamza.jpg"
                            className="animate-dragL w-full h-auto"
                        />
                    </div>
                </div>
            </div>
            <div
                className="absolute flex justify-center items-center w-48 h-48 xl:w-64 xl:h-64 opacity-100 animate-wiggle"
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <AnimationSpin />
            </div>
            <div className="w-72 h-64 fixed -right-20 bg-[#0F2325] -bottom-32 rotate-[-24deg] overflow z-10"></div>
            <div className="w-56 h-56 fixed -right-24 bg-[#467483] -bottom-4 rotate-[25deg] overflow z-0"></div>
            <div className="w-72 h-64 fixed -left-20 bg-[#0F2325] -top-32 rotate-[-24deg] overflow z-10"></div>
            <div className="w-56 h-56 fixed -left-24 bg-[#467483] -top-4 rotate-[25deg] overflow z-0"></div>
            <div className="fixed bottom-0 left-0 z-0 sm:w-48 lg:w-auto">
                <img src="/images/lines-about.svg" alt="" />
            </div>
        </div>
    );
}

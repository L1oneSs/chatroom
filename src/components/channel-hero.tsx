import {format} from "date-fns"

interface ChannelHeroProps {
    name: string;
    creationTime: number;
}

/**
 * Компонент, отображающий имя и дату создания канала
 *
 * @param {{ name: string; creationTime: number }} props - Свойства
 * @prop {string} name - Имя канала
 * @prop {number} creationTime - Время создания канала
 *
 * @returns {JSX.Element}
 */
export const ChannelHero = ({ name, creationTime }: ChannelHeroProps) => {

    return (
        <div className="mt-[88px] mx-5 mb-4">
            <p className="text-2xl font-bold flex items-center mb-2">
                # {name}
            </p>
            <p className="font-normal text-slate-800 mb-4">
                This channel was created on {format(creationTime, "MMMM do, yyyy")}.
            </p>
        </div>
    );
}
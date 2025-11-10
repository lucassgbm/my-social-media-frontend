import Image from "next/image";

export default function ListPhotos() {
    return (
        <div className="bg-white text-center rounded-2xl p-4 mb-4">
            <h1 className="text-md font-semibold mb-4">Fotos</h1>
            <div className="w-full flex flex-row gap-4">

                <div className="w-[120px] flex flex-col">
                    <Image
                        src="/imgs/drift.jpg"
                        alt="Foto de perfil"
                        className="rounded-md w-[120px] mr-4 hover:opacity-90"
                        width={120}
                        height={120}
                        priority
                    />
                    <label className="text-sm font-semibold">foto</label>

                </div>
                <div className="w-[120px] flex flex-col">
                    <Image
                        src="/imgs/drift.jpg"
                        alt="Foto de perfil"
                        className="rounded-md w-[120px] mr-4 hover:opacity-90"
                        width={120}
                        height={120}
                        priority
                    />
                    <label className="text-sm font-semibold">foto</label>

                </div>
            </div>
        </div>
    );
}
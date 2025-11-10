export default function RingImage(pros: { className?: string; children?: React.ReactNode; padding?: string; }) {
    return (
        <div className={`p-[2px] rounded-full bg-gradient-to-r from-green-300 via-green-400 to-green-600 ${pros.className}`}>
            <div className={`rounded-full  bg-white dark:bg-black ${pros.padding || 'p-[2px]' }`}>
                {pros.children}
            </div>
        </div>
    )
}
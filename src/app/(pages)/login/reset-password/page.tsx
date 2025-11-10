import HeaderLogin from "../../../../../components/login/header-login";

export default function Home(){
    return(
        <div className="flex sm:flex-row flex-col">

            <div className="sm:w-full text-white flex flex-col w-full bg-neutral-950 h-screen items-center justify-center p-4">
                
                <HeaderLogin />
                
                <h1 className="flex flex-end text-lg font-semibold mb-4">Recuperar senha</h1>

                <div className="w-[90%] sm:w-[50%] flex flex-row">
                    <div className="w-full p-4">
                        
                        <div className="flex flex-col mb-4">
                            <label className="font-semibold text-xs mb-2">Nova senha</label>

                            <input className="w-full text-sm text-gray-700 p-3 bg-white focus:outline-blue-400 rounded-sm" type="password" placeholder="Nova senha"></input>

                        </div>
                        <div className="flex flex-col mb-4">
                            <label className="font-semibold text-xs mb-2">Repetir senha</label>

                            <input className="w-full text-sm text-gray-700 p-3 bg-white focus:outline-blue-400 rounded-sm" type="password" placeholder="Repetir senha"></input>

                        </div>
                        
                        <div className="flex flex-row mb-4 mt-6 justify-center">

                            <button className="w-[auto] bg-blue-500 hover:bg-blue-700 font-semibold py-2 px-2 pl-6 pr-6 rounded-sm cursor-pointer">Enviar</button>
                        </div>
                    </div>

                </div>
            </div>  
 
        </div>
    )
}
export default function LoadingSpinner() {
  return (
<div className="flex gap-4 p-4">
      {/* Conteúdo principal longo */}
      <main className="flex-1">
        <div className="h-[2000px] bg-gray-100 p-4">
          <h1 className="text-2xl font-bold">Conteúdo principal</h1>
          <p>Role a página para ver a div azul se comportando.</p>
        </div>
      </main>

      {/* Sidebar ou div menor */}
      <aside className="w-1/4">
        <div className="sticky bottom-0 bg-blue-500 text-white p-4 rounded">
          Eu grudo no rodapé enquanto rola e paro no fim do container
        </div>
      </aside>
    </div>

  );
}

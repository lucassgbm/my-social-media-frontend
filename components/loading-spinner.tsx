export default function LoadingSpinner() {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className="w-5 h-5 rounded-full border-3 border-line-strong border-t-transparent animate-spin"
    />
  );
}

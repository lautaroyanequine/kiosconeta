function App() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <h1 className="text-primary">
          🎉 KIOSCONETA
        </h1>
        
        <div className="card">
          <h2 className="mb-4">¡Tailwind funcionando!</h2>
          <p className="text-neutral-600 mb-4">
            Si ves colores violeta y naranja, todo está perfecto.
          </p>
          
          <div className="flex gap-4">
            <button className="btn-primary">
              Botón Violeta
            </button>
            <button className="btn-secondary">
              Botón Naranja
            </button>
            <button className="btn-outline">
              Outline
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center border-t-4 border-primary">
            <p className="text-sm text-neutral-500">Ventas</p>
            <p className="text-3xl font-bold text-primary">$45.000</p>
          </div>
          
          <div className="card text-center border-t-4 border-secondary">
            <p className="text-sm text-neutral-500">Productos</p>
            <p className="text-3xl font-bold text-secondary">156</p>
          </div>
          
          <div className="card text-center border-t-4 border-success">
            <p className="text-sm text-neutral-500">Empleados</p>
            <p className="text-3xl font-bold text-success">8</p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="badge-success">✅ Activo</span>
          <span className="badge-danger">🔴 Stock bajo</span>
          <span className="badge-warning">⚠️ Advertencia</span>
          <span className="badge-info">ℹ️ Info</span>
        </div>

      </div>
    </div>
  )
}

export default App
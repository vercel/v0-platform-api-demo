'use client'

export default function GodModePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-rows-2 grid-cols-4 h-screen gap-1 p-1">
        {/* Row 1 */}
        <iframe 
          src="/" 
          className="w-full h-full border border-border rounded"
          title="Instance 1"
        />
        <iframe 
          src="/" 
          className="w-full h-full border border-border rounded"
          title="Instance 2"
        />
        <iframe 
          src="/" 
          className="w-full h-full border border-border rounded"
          title="Instance 3"
        />
        <iframe 
          src="/" 
          className="w-full h-full border border-border rounded"
          title="Instance 4"
        />
        
        {/* Row 2 */}
        <iframe 
          src="/" 
          className="w-full h-full border border-border rounded"
          title="Instance 5"
        />
        <iframe 
          src="/" 
          className="w-full h-full border border-border rounded"
          title="Instance 6"
        />
        <iframe 
          src="/" 
          className="w-full h-full border border-border rounded"
          title="Instance 7"
        />
        <iframe 
          src="/" 
          className="w-full h-full border border-border rounded"
          title="Instance 8"
        />
      </div>
    </div>
  )
}
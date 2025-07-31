import Link from 'next/link'
import { Code2, Server } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Choose Your Pattern
          </h1>
          <p className="text-lg text-gray-600">
            Select between client-first or server-first architecture
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Client-First Pattern */}
          <Link
            href="/client"
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-6 group-hover:bg-blue-200 transition-colors">
              <Code2 className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Client-First
            </h2>
            
            <p className="text-gray-600 mb-4">
              Traditional SPA approach with client-side state management and API calls
            </p>
            
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Client-side data fetching</li>
              <li>• Session storage caching</li>
              <li>• Direct API integration</li>
              <li>• Real-time updates</li>
            </ul>
          </Link>

          {/* Server-First Pattern */}
          <Link
            href="/server"
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-green-300 transition-all"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mb-6 group-hover:bg-green-200 transition-colors">
              <Server className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Server-First
            </h2>
            
            <p className="text-gray-600 mb-4">
              Modern RSC approach with server actions and server-side rendering
            </p>
            
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Server-side data fetching</li>
              <li>• Server actions for mutations</li>
              <li>• TanStack Query for client state</li>
              <li>• Progressive enhancement</li>
            </ul>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Both patterns connect to the same v0 Platform API
          </p>
        </div>
      </div>
    </div>
  )
}
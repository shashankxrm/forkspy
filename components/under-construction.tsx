import { AlertTriangle } from "lucide-react"

export default function UnderConstruction() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-yellow-100 p-4 shadow-md z-50">
      <div className="container mx-auto flex items-center justify-center">
        <AlertTriangle className="text-yellow-600 mr-2" />
        <p className="text-yellow-800 font-medium">
          <span className="font-bold">UI Under Construction:</span> The page design is being improved, but all app
          functions are working perfectly. Feel free to use the app as normal.
        </p>
      </div>
    </div>
  )
}


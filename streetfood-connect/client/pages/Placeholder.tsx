import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, ArrowLeft, Construction } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
  backTo?: string;
  backLabel?: string;
}

export default function Placeholder({ 
  title, 
  description, 
  backTo = "/", 
  backLabel = "Back to Home" 
}: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-emerald-600 rounded-xl p-2">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-emerald-800">StreetFood Connect</h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Construction className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 mb-6">{description}</p>
            <p className="text-sm text-gray-500 mb-6">
              This page is under development. Continue the conversation to build out this functionality!
            </p>
            <Link to={backTo}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

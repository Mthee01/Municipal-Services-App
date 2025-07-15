import { createRoot } from "react-dom/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "./index.css";

function SimpleTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>ADA Smart Munic - Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This is a simple test to verify the React app is working.
          </p>
          <Button 
            onClick={() => alert("Button clicked!")}
            className="w-full"
          >
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Test render
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<SimpleTest />);
} else {
  console.error("Root element not found");
}
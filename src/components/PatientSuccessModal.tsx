import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { CheckCircle, Copy } from "lucide-react";
import { useState } from "react";

interface PatientSuccessModalProps {
  patientId: string;
  onContinue: () => void;
}

export function PatientSuccessModal({
  patientId,
  onContinue,
}: PatientSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(patientId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback: select the text for manual copy
      const codeElement = document.getElementById(
        "patient-id-code",
      );
      if (codeElement) {
        const range = document.createRange();
        range.selectNode(codeElement);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          window.getSelection()?.removeAllRanges();
        }, 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle>Registration Successful!</CardTitle>
          <CardDescription>
            Your patient account has been created
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-2">
              Your Secret Patient ID:
            </p>
            <div className="flex items-center gap-2">
              <code
                id="patient-id-code"
                className="flex-1 bg-white px-3 py-2 rounded border border-blue-300 break-all"
              >
                {patientId}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 mt-2">
                Text selected! Press Ctrl+C (Cmd+C on Mac) to
                copy
              </p>
            )}
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm">
              <strong>Important:</strong> Save this ID securely!
              You'll need it to access your medical records, and
              hospitals will use it to update your information.
            </p>
          </div>

          <Button onClick={onContinue} className="w-full">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
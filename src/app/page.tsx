"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisResult {
  fileName: string;
  aim: string;
  methodology: string;
  results: string;
  scope: string;
  relevance: string;
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const { toast } = useToast();

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  const handleAnalysis = async () => {
    if (!topic) {
      toast({
        title: "Error",
        description: "Please enter your research topic",
        variant: "destructive",
      });
      return;
    }

    if (acceptedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    const newResults: AnalysisResult[] = [];

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("topic", topic);

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Analysis failed");
        }

        const data = await response.json();
        newResults.push({
          fileName: file.name,
          ...data,
        });
      }

      setResults(newResults);
      toast({
        title: "Success",
        description: "Analysis completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Literature Review Assistant
      </h1>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="topic">Research Topic</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your research topic..."
            className="w-full"
          />
        </div>

        <div
          {...getRootProps()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2">
            Drag & drop PDF files here, or click to select files
          </p>
        </div>

        {acceptedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Uploaded Files:</h3>
            <ul className="space-y-1">
              {acceptedFiles.map((file: File) => (
                <li key={file.name} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleAnalysis}
          disabled={isAnalyzing || !topic || acceptedFiles.length === 0}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Papers"
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Analysis Results</h2>
            {results.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{result.fileName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Aim/Purpose:</h4>
                    <p>{result.aim}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Methodology:</h4>
                    <p>{result.methodology}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Results:</h4>
                    <p>{result.results}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Scope:</h4>
                    <p>{result.scope}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Relevance to Topic:</h4>
                    <p>{result.relevance}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

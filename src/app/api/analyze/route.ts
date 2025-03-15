import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const topic = formData.get("topic") as string;

    if (!file || !topic) {
      return NextResponse.json(
        { error: "File and topic are required" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert Buffer to Blob
    const blob = new Blob([buffer], { type: "application/pdf" });

    // Load PDF
    const loader = new PDFLoader(blob);
    const docs = await loader.load();

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);

    // Create vector store
    const vectorStore = await HNSWLib.fromDocuments(
      splitDocs,
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        modelName: "embedding-001",
      })
    );

    // Create chain
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: "gemini-pro",
      temperature: 0,
    });

    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    // Analyze the paper
    const [aim, methodology, results, scope, relevance] = await Promise.all([
      chain.call({
        query:
          "What is the main aim, goal, or purpose of this research paper? Be concise.",
      }),
      chain.call({
        query:
          "What methodology or methods were used in this research? List the key methods.",
      }),
      chain.call({
        query:
          "What are the main results or findings of this research? Summarize briefly.",
      }),
      chain.call({
        query:
          "What is the scope of this research? Include any limitations or boundaries mentioned.",
      }),
      chain.call({
        query: `How relevant is this paper to the research topic: "${topic}"? Explain why or why not.`,
      }),
    ]);

    return NextResponse.json({
      aim: aim.text,
      methodology: methodology.text,
      results: results.text,
      scope: scope.text,
      relevance: relevance.text,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: "Error processing PDF" },
      { status: 500 }
    );
  }
}

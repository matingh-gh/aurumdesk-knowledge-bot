import { NextRequest, NextResponse } from "next/server";
import { buildAnswer } from "@/lib/answer";
import { loadKnowledgeSections } from "@/lib/docs";
import { retrieveRelevantSections } from "@/lib/retriever";

export const runtime = "nodejs";

type AskRequestBody = {
  question?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AskRequestBody;
    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json(
        {
          error: "Question is required.",
        },
        { status: 400 },
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        {
          error: "Question is too long. Please keep it under 500 characters.",
        },
        { status: 400 },
      );
    }

    const sections = await loadKnowledgeSections();
    const matches = retrieveRelevantSections(question, sections, 3);
    const result = buildAnswer(matches);

    return NextResponse.json({
      question,
      ...result,
    });
  } catch (error) {
    console.error("Ask API error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while answering the question.",
      },
      { status: 500 },
    );
  }
}

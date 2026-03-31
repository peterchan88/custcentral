import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";

// Initialize Gemini (using environment variable or placeholder for now)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function POST(req: Request) {
  try {
    const { source_channel, created, customer_id, original_feedback } = await req.json();

    const prompt = `You are a customer feedback analyst for a major global Bank X.

Analyze the following customer feedback from source channel in JSON format:
{
"created": "${created}",
"customer_id": "${customer_id}",
"original_feedback": "${original_feedback}",
"source_channel": "${source_channel}"
}

and respond ONLY with valid JSON in this exact format:
{
"created": "created from channel",
"customer_id": "customer_id from channel",
"original_feedback": "original_feedback from channel",
"source_channel": "source_channel from channel",
"updated": "timestamp of this feedback analysis",
"feedback_en": "original feedback in English or translated into English limited to 250 characters maximum",
"sentiment": "positive" or "negative" or "neutral" or "unclassified",
"category": "bug" or "feature_request" or "praise" or "complaint" or "question" or "fraud" or "unclassified",
"severity": 0-6 where 0 is unclassified 1 is minor 5 is critical and 6 is fraud,
"assignee": "Relationship Manager" for onboarding, risk assessments, branch, sales, account related issues or "Product Team" for product features or gaps or "Technology" for system errors or downtime or "Compliance" or "Customer Experience & Operations",
"summary": "concise summary in 1 to 3 numbered bullet points max 250 characters no new line",
"suggested_action": "concise recommended next step in 1 to 3 numbered bullet points max 250 characters no new line",
"confidence_score": 0 to 1
}

Role boundaries handling - Feedback scope limit to Bank X related products & services only. For feedback outside this scope set "suggested_action": "Politely state unable to comment on feedback outside Bank X products & services".

Confidence gating – 
Medium confidence (0.6-0.85) → add "Medium confidence: suggest human review." to the beginning of "suggested_action"; Low confidence (< 0.6) → assign "unclassified" to "sentiment", "category", "severity" fields and "Low confidence: human analysis required." to the beginning of "suggested_action" and set "assignee" as "Customer Experience & Operations".

Source grounding – Do not include any text outside the JSON. Do not include markdown backticks. Do not add explanations.

Refusal design – Deepfake detection, anti-scam. Report such incident under "category": "scam_detected", "sentiment": "negative" and stop processing.

Output constraints – Choose wording according to Banking compliance tone and constraints.
Prioritize explainability. All output JSON fields only based on "original_feedback".
Avoid biased or sensitive inference. Fair / unbiased triage.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const analysis = JSON.parse(responseText);

    // Save to Supabase
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        source_channel,
        created_at_source: new Date(created).toISOString(),
        customer_id,
        original_feedback,
        feedback_en: analysis.feedback_en,
        sentiment: analysis.sentiment,
        category: analysis.category,
        severity: analysis.severity,
        assignee: analysis.assignee,
        summary: analysis.summary,
        suggested_actions: analysis.suggested_action,
        confidence_score: analysis.confidence_score,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Processing error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export interface CredibilityProof {
  claim_verified: string;
  matched_fact: string;
  source_proof_url: string;
}

export interface Evidence {
  reputation_score: number;
  similarity_score: number;
  source_title: string;
  source_url: string;
  summary: string;
}

export interface DeepfakeAnalysisResponse {
  analysis_summary: string;
  confidence_score: number;
  credibility_proof: CredibilityProof[];
  evidence: Evidence[];
  input_content: string;
  input_type: string;
  verdict: string;
}

const API_BASE_URL = "https://deepfake-api-txer.onrender.com";

export async function analyzeContent(
  inputType: "text" | "image" | "video",
  inputContent: string | File
): Promise<DeepfakeAnalysisResponse> {
  const formData = new FormData();

  if (inputType === "image" && inputContent instanceof File) {
    formData.append("image", inputContent);
  } else {
    formData.append("input_type", inputType);
    formData.append("input_content", inputContent as string);
  }

  const response = await fetch(`${API_BASE_URL}/analyze-content`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to analyze content");
  }

  const rawResponse = await response.json();
  let parsedResponse: DeepfakeAnalysisResponse;

  try {
    // Attempt to parse if it's a nested JSON string
    parsedResponse = JSON.parse(rawResponse.raw_response);
  } catch (e) {
    // If parsing fails or raw_response.raw_response doesn't exist, assume it's a direct JSON
    parsedResponse = rawResponse;
  }
  return parsedResponse;
}

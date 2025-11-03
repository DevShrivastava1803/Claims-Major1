import os
import json
import re
import random
from dotenv import load_dotenv
from typing import List, Dict

# Gemini and LangChain imports
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings

# --------------------------
# ENVIRONMENT SETUP
# --------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
    print("[WARN] GEMINI_API_KEY not found or not configured. Using mock mode.")
    GEMINI_API_KEY = "mock_key"

try:
    if GEMINI_API_KEY != "mock_key":
        genai.configure(api_key=GEMINI_API_KEY)
        print("[INFO] Gemini API configured successfully.")
    else:
        print("[INFO] Running in mock mode (no real Gemini API calls).")
except Exception as e:
    print(f"[ERROR] Failed to configure Gemini API: {e}")
    GEMINI_API_KEY = "mock_key"


# --------------------------
# LLM SERVICE
# --------------------------
class LLMService:
    def __init__(self):
        """Initialize the LLM and embedding model with fallback to mock mode."""
        self.is_mock = GEMINI_API_KEY == "mock_key"

        if not self.is_mock:
            try:
                print("[INFO] Initializing Gemini LLM and Embedding models...")
                # ✅ Use ChatGoogleGenerativeAI instead of GoogleGenerativeAI
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-pro-latest",
                    google_api_key=GEMINI_API_KEY,
                    temperature=0.2,
                )
                self.embedding_model = GoogleGenerativeAIEmbeddings(
                    model="models/embedding-001",
                    google_api_key=GEMINI_API_KEY,
                )
                print("[INFO] Gemini models loaded successfully.")
            except Exception as e:
                print(f"[ERROR] Failed to initialize Gemini models: {e}")
                print("[WARN] Switching to mock mode for embeddings and responses.")
                self.is_mock = True
                self.llm = None
                self.embedding_model = None
        else:
            print("[INFO] Mock mode activated — no real API calls will be made.")
            self.llm = None
            self.embedding_model = None

    # --------------------------
    # EMBEDDING GENERATION
    # --------------------------
    def get_embeddings(self, texts: List[str]):
        """Generate embeddings for a list of texts."""
        if self.is_mock:
            print("[MOCK] Returning random mock embeddings.")
            return [[random.random() for _ in range(768)] for _ in texts]

        try:
            print(f"[INFO] Generating embeddings for {len(texts)} texts...")
            embeddings = self.embedding_model.embed_documents(texts)
            print("[INFO] Embeddings generated successfully.")
            return embeddings
        except Exception as e:
            print(f"[ERROR] Embedding failed: {e}")
            print("[WARN] Switching to mock mode for embeddings.")
            self.is_mock = True
            return [[random.random() for _ in range(768)] for _ in texts]

    # --------------------------
    # CLAIM ANALYSIS
    # --------------------------
    def analyze_claim(self, query: str, relevant_clauses: List[str]) -> Dict:
        """Analyze the insurance claim based on relevant policy clauses."""
        if self.llm is None and not self.is_mock:
            print("[WARN] LLM not initialized, attempting to reinitialize...")
            try:
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-pro-latest",
                    google_api_key=GEMINI_API_KEY,
                    temperature=0.2,
                )
            except Exception as e:
                print(f"[ERROR] Failed to reinitialize LLM: {e}")
                self.is_mock = True

        if self.is_mock:
            print("[MOCK] Returning mock claim analysis result.")
            return {
                "decision": "approved",
                "amount": "1000.00",
                "justification": "Mock analysis - external LLM unavailable; fallback response.",
                "reference_clauses": ["clause_1", "clause_2"],
            }

        prompt = f"""
        Given the insurance claim query: {query}
        And the following relevant policy clauses:
        {' '.join(relevant_clauses)}

        Analyze if the claim should be approved or rejected based on the policy clauses.
        Return ONLY a valid JSON response in the following format:
        {{
            "decision": "approved/rejected",
            "amount": "optional amount if approved",
            "justification": "brief explanation of the decision",
            "reference_clauses": ["list of relevant clause numbers"]
        }}
        """

        print("[INFO] Sending claim analysis prompt to Gemini...")
        try:
            response = self.llm.invoke(prompt)
            # Robustly extract text from LangChain AIMessage or raw strings
            response_text = None
            if hasattr(response, "content"):
                content = response.content
                if isinstance(content, str):
                    response_text = content
                elif isinstance(content, list):
                    # Concatenate any part texts; fallback to string conversion
                    try:
                        response_text = " ".join(
                            [
                                getattr(p, "text", str(p)) if not isinstance(p, str) else p
                                for p in content
                            ]
                        )
                    except Exception:
                        response_text = str(content)
                else:
                    response_text = str(content)
            else:
                # In case invoke returns a plain string or other object
                response_text = response if isinstance(response, str) else str(response)

            print("[INFO] Raw response received from Gemini.")

            # Extract JSON safely
            match = re.search(r"\{.*\}", response_text, re.DOTALL)
            if match:
                json_str = match.group(0)
                result = json.loads(json_str)
                print("[INFO] JSON parsed successfully from Gemini response.")
            else:
                print("[WARN] No JSON found in response. Using fallback.")
                result = {
                    "decision": "rejected",
                    "amount": None,
                    "justification": "No valid JSON found in model output.",
                    "reference_clauses": [],
                }

        except json.JSONDecodeError as e:
            print(f"[ERROR] Failed to parse JSON: {e}")
            result = {
                "decision": "rejected",
                "amount": None,
                "justification": "Failed to parse LLM response.",
                "reference_clauses": [],
            }

        except Exception as e:
            print(f"[ERROR] Claim analysis failed: {e}")
            print("[WARN] Switching to mock mode for fallback.")
            self.is_mock = True
            result = {
                "decision": "approved",
                "amount": "1000.00",
                "justification": "Mock analysis - Gemini unavailable.",
                "reference_clauses": ["clause_1", "clause_2"],
            }

        # Safety checks
        result.setdefault("decision", "rejected")
        result.setdefault("justification", "Analysis incomplete")
        result.setdefault("reference_clauses", [])
        result["amount"] = str(result.get("amount")) if result.get("amount") else None

        print(f"[INFO] Final decision: {result['decision']}")
        return result

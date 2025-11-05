import google.generativeai as genai
import os

# Use environment-provided key; do not hardcode secrets
os.environ["GOOGLE_API_KEY"] = ""

try:
    # Configure the API
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
    
    # Use the direct Google Generative AI library with correct model name
    model = genai.GenerativeModel('gemini-pro-latest')
    print("✅ LLM initialized successfully!")

    response = model.generate_content("Hello! Introduce yourself briefly.")
    print("🤖 LLM Response:", response.text)

except Exception as e:
    print("❌ LLM initialization or call failed:", e)

try:
    # Use embedding model with correct format
    text = "AI and law"
    embedding_result = genai.embed_content(
        model="models/embedding-001",
        content=text,
        task_type="retrieval_query"
    )
    vec = embedding_result["embedding"]
    print("✅ Embedding model initialized successfully!")
    print("🔢 Embedding vector length:", len(vec))

except Exception as e:
    print("❌ Embedding initialization failed:", e)

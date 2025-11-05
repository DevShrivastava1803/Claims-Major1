from typing import List, Tuple, Dict
import re
from datetime import datetime, timezone

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter


def build_text_splitter() -> RecursiveCharacterTextSplitter:
    return RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\n\n", "\n", " ", ""]
    )


def guess_section_name(text: str) -> str | None:
    """Heuristic to extract a likely section heading from text.
    - Look for titlecase/uppercase line near the start
    - Or a line ending with ':'
    """
    lines = [l.strip() for l in text.splitlines()[:10] if l.strip()]
    for line in lines:
        if len(line) <= 80:
            # Heading with colon
            if line.endswith(":") and len(line.split()) >= 2:
                return line[:-1].strip()
            # Mostly uppercase or Title Case
            if re.match(r"^[A-Z][A-Za-z ]+$", line) or line.isupper():
                return line.strip()
    return None


def ends_mid_sentence(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return False
    return not re.search(r"[\.!?]\s*$", stripped)


def stitch_with_next_if_needed(text: str, chunk_id: str, collection) -> str:
    """If the chunk appears to end mid-sentence, append next adjacent chunk by ID."""
    if not ends_mid_sentence(text):
        return text
    try:
        # Expect IDs like doc{doc_id}_ts{timestamp}_chunk_{i}
        m = re.search(r"_chunk_(\d+)$", chunk_id)
        if not m:
            return text
        idx = int(m.group(1))
        next_id = chunk_id.replace(f"_chunk_{idx}", f"_chunk_{idx+1}")
        next_res = collection.get(ids=[next_id])
        if next_res and next_res.get("documents"):
            next_doc = next_res["documents"][0]
            return text + "\n" + next_doc
    except Exception:
        pass
    return text


def process_pdf_into_chromadb(file_path: str, doc_id: int, llm_service, collection) -> Tuple[int, List[Dict]]:
    """Load PDF, split, embed, and add to Chroma with metadata.
    Returns number of chunks and the metadatas list for inspection.
    """
    loader = PyPDFLoader(file_path)
    pages = loader.load()

    splitter = build_text_splitter()
    chunks = splitter.split_documents(pages)

    texts = [c.page_content for c in chunks]
    metadatas: List[Dict] = []
    for i, c in enumerate(chunks):
        page_num = c.metadata.get("page")
        section = guess_section_name(c.page_content)
        # Build metadata without None values (Chroma rejects None)
        meta: Dict = {
            "doc_id": doc_id,
            "chunk_index": i,
        }
        if page_num is not None:
            meta["page_number"] = page_num
        if section:
            meta["section_name"] = section
        metadatas.append(meta)

    embeddings = llm_service.get_embeddings(texts)

    unique_prefix = f"doc{doc_id}_{int(datetime.now(timezone.utc).timestamp())}"
    for i, (text, embedding, meta) in enumerate(zip(texts, embeddings, metadatas)):
        collection.add(
            documents=[text],
            embeddings=[embedding],
            metadatas=[meta],
            ids=[f"{unique_prefix}_chunk_{i}"]
        )

    return len(texts), metadatas


def build_context_and_refs(results: Dict, collection) -> Tuple[str, List[str], List[Dict]]:
    """Concatenate top documents into context and derive reference clauses from metadata.
    Applies clause stitcher when chunks end mid-sentence.

    Additionally returns structured reference details with short text snippets
    for each retrieved chunk to support richer UI rendering.
    """
    docs = results.get("documents", [[]])[0] or []
    ids = results.get("ids", [[]])[0] or []
    metas = results.get("metadatas", [[]])[0] or []

    context_parts: List[str] = []
    references: List[str] = []
    details: List[Dict] = []

    for i, text in enumerate(docs):
        meta = metas[i] if i < len(metas) else {}
        meta = meta or {}
        cid = ids[i] if i < len(ids) else ""
        stitched_text = stitch_with_next_if_needed(text, cid, collection)
        context_parts.append(stitched_text)
        section = meta.get("section_name")
        page = meta.get("page_number")
        ref_items = []
        if section:
            ref_items.append(f"Section: {section}")
        if page is not None:
            ref_items.append(f"Page: {page}")
        if ref_items:
            references.append(", ".join(ref_items))

        # Build a readable label and concise snippet for UI
        label = None
        if section and page is not None:
            label = f"{section} (Page {page})"
        elif section:
            label = section
        elif page is not None:
            label = f"Page {page}"
        else:
            label = "Relevant excerpt"

        snippet = stitched_text.strip()
        # Create a concise snippet (~300 chars) ending at a sentence boundary if possible
        max_len = 300
        if len(snippet) > max_len:
            cut = snippet[:max_len]
            # Try to cut at the last sentence-ending punctuation within the slice
            m = re.search(r"[\.\!?](?=[^\.\!?]*$)", cut)
            if m:
                idx = m.end()
                cut = cut[:idx]
            snippet = cut + "…"

        details.append({
            "label": label,
            "snippet": snippet,
        })

    # Deduplicate references while preserving order
    seen = set()
    dedup_refs = []
    for r in references:
        if r not in seen:
            seen.add(r)
            dedup_refs.append(r)

    context = "\n\n---\n\n".join(context_parts)
    return context, dedup_refs, details
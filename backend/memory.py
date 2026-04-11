# memory.py
import chromadb
from chromadb.utils import embedding_functions
import logging

logger = logging.getLogger(__name__)

# Use in-memory client for Render compatibility
client = chromadb.Client()

# Using default embedding function (sentence-transformers)
ef = embedding_functions.DefaultEmbeddingFunction()

# Create or get the collection
collection = client.get_or_create_collection(
    name="csi_case_memory",
    embedding_function=ef
)

def clear_memory():
    """Wipes all documents for a fresh case."""
    global collection
    try:
        client.delete_collection("csi_case_memory")
        collection = client.create_collection(
            name="csi_case_memory",
            embedding_function=ef
        )
        logger.info("Memory collection reset for new investigation.")
    except Exception as e:
        logger.error(f"Error clearing memory: {e}")

def store_memory(text, category, metadata=None):
    """
    Stores a piece of evidence or dialogue turn in the vector DB.
    """
    if not text or not text.strip():
        return
    
    # Simple ID generation based on count
    doc_id = f"{category}_{collection.count() + 1}"
    
    meta = metadata or {}
    meta["category"] = category
    
    try:
        collection.add(
            documents=[text],
            metadatas=[meta],
            ids=[doc_id]
        )
    except Exception as e:
        logger.warning(f"Failed to store memory: {e}")

def retrieve_relevant(query, n=3, category=None):
    """
    Retrieves the most semantically relevant past evidence.
    Optional category filter (e.g. 'analyst', 'witness')
    """
    try:
        count = collection.count()
        if count == 0:
            return ""
        
        where_clause = {"category": category} if category else None
        
        results = collection.query(
            query_texts=[query],
            n_results=min(n, count),
            where=where_clause
        )
        
        if results and results["documents"] and results["documents"][0]:
           evidence_list = results["documents"][0]
           return "\n".join([f"- {ev}" for ev in evidence_list])
    except Exception as e:
        logger.error(f"Error retrieving from memory: {e}")
    
    return ""

if __name__ == "__main__":
    # Test block
    print("Testing memory filtering...")
    store_memory("Fingerprint found on the trigger.", "analyst")
    store_memory("Witness says they were at the bar.", "witness")
    
    print("\nRetrieving ONLY analyst context for 'evidence':")
    print(retrieve_relevant("evidence", category="analyst"))
    
    print("\nRetrieving ALL context for 'evidence':")
    print(retrieve_relevant("evidence"))

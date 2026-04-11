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
# We use a static name, but we will clear it on new case starts
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
    
    try:
        collection.add(
            documents=[text],
            metadatas=[metadata or {"category": category}],
            ids=[doc_id]
        )
    except Exception as e:
        logger.warning(f"Failed to store memory: {e}")

def retrieve_relevant(query, n=3):
    """
    Retrieves the most semantically relevant past evidence for a query.
    """
    try:
        count = collection.count()
        if count == 0:
            return ""
        
        results = collection.query(
            query_texts=[query],
            n_results=min(n, count)
        )
        
        if results and results["documents"] and results["documents"][0]:
           evidence_list = results["documents"][0]
           return "\n".join([f"- {ev}" for ev in evidence_list])
    except Exception as e:
        logger.error(f"Error retrieving from memory: {e}")
    
    return ""

if __name__ == "__main__":
    # Test block
    print("Testing memory...")
    store_memory("The victim was found near the Bellagio fountains.", "narrator")
    store_memory("Suspect Alpha was seen at the Neon Museum at 11 PM.", "witness")
    
    print("\nRetrieving relevant info for 'Where was the body?':")
    print(retrieve_relevant("Where was the body?"))

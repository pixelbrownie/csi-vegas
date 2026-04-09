FROM ollama/ollama:latest

# Keep model configurable from Render env vars.
ENV OLLAMA_MODEL=llama3.2:1b

# Start Ollama, ensure the model exists, then keep serving.
CMD ["sh", "-c", "ollama serve & sleep 3 && ollama pull \"$OLLAMA_MODEL\" && wait"]

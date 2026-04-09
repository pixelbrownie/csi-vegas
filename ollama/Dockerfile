FROM ollama/ollama:latest

# Default model (can be overridden in Render env vars)
ENV OLLAMA_MODEL=llama3.2:1b
ENV OLLAMA_HOST=0.0.0.0
CMD ["sh", "-c", "ollama serve & sleep 5 && ollama pull \"$OLLAMA_MODEL\" && wait"]
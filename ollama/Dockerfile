FROM ollama/ollama:latest
ENV OLLAMA_MODEL=llama3.2:1b
ENV OLLAMA_HOST=0.0.0.0

# The base image entrypoint is "ollama", so switch to a shell explicitly.
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["ollama serve & sleep 5 && ollama pull \"$OLLAMA_MODEL\" && wait"]
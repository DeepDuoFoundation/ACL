export const PROVIDERS = {
    // ── Aggregators / Gateways (7) ──
    "ddf-gateway": {
        id: "ddf-gateway", label: "DDF AI Gateway",
        baseURL: "https://aiback.ddfrl.com/v1", apiKeyEnv: "DDF_API_KEY",
        compat: "openai", category: "aggregator", tier: "all",
    },
    "kilocode": {
        id: "kilocode", label: "Kilo AI Gateway",
        baseURL: "https://api.kilo.ai/api/gateway/v1", apiKeyEnv: "KILO_API_KEY",
        compat: "openai", category: "aggregator", discovery: "kilo-gateway", tier: "pro",
    },
    "openrouter": {
        id: "openrouter", label: "OpenRouter",
        baseURL: "https://openrouter.ai/api/v1", apiKeyEnv: "OPENROUTER_API_KEY",
        compat: "openai", category: "aggregator", tier: "pro",
    },
    "requesty": {
        id: "requesty", label: "Requesty",
        baseURL: "https://router.requesty.ai/v1", apiKeyEnv: "REQUESTY_API_KEY",
        compat: "openai", category: "aggregator", tier: "pro",
    },
    "vercel": {
        id: "vercel", label: "Vercel AI Gateway",
        baseURL: "https://ai-gateway.vercel.sh/v1", apiKeyEnv: "VERCEL_AI_GATEWAY_KEY",
        compat: "openai", category: "aggregator", tier: "pro",
    },
    "glama": {
        id: "glama", label: "Glama",
        baseURL: "https://glama.ai/api/gateway/openai/v1", apiKeyEnv: "GLAMA_API_KEY",
        compat: "openai", category: "aggregator", tier: "pro",
    },
    "unbound": {
        id: "unbound", label: "Unbound",
        baseURL: "https://api.getunbound.ai/v1", apiKeyEnv: "UNBOUND_API_KEY",
        compat: "openai", category: "aggregator", tier: "pro",
    },
    // ── Cloud / First-Party (8) ──
    "anthropic": {
        id: "anthropic", label: "Anthropic (Claude)",
        baseURL: "https://api.anthropic.com/v1", apiKeyEnv: "ANTHROPIC_API_KEY",
        compat: "anthropic-oc", category: "cloud", tier: "pro",
    },
    "openai": {
        id: "openai", label: "OpenAI",
        baseURL: "https://api.openai.com/v1", apiKeyEnv: "OPENAI_API_KEY",
        compat: "openai", category: "cloud", discovery: "openai-models", tier: "pro",
    },
    "azure": {
        id: "azure", label: "Azure OpenAI",
        baseURL: "https://YOUR-RESOURCE.openai.azure.com/openai",
        apiKeyEnv: "AZURE_OPENAI_API_KEY", compat: "azure", category: "cloud", tier: "pro",
    },
    "google": {
        id: "google", label: "Google Gemini",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
        apiKeyEnv: "GEMINI_API_KEY", compat: "anthropic-oc", category: "cloud", tier: "pro",
    },
    "vertex": {
        id: "vertex", label: "Google Vertex AI",
        baseURL: "https://us-central1-aiplatform.googleapis.com/v1beta1",
        apiKeyEnv: "GOOGLE_VERTEX_API_KEY", compat: "proxy", category: "cloud", tier: "pro",
    },
    "bedrock": {
        id: "bedrock", label: "AWS Bedrock",
        baseURL: "https://bedrock-runtime.us-east-1.amazonaws.com",
        apiKeyEnv: "AWS_BEDROCK_API_KEY", compat: "proxy", category: "cloud", tier: "pro",
    },
    "xai": {
        id: "xai", label: "xAI (Grok)",
        baseURL: "https://api.x.ai/v1", apiKeyEnv: "XAI_API_KEY",
        compat: "openai", category: "cloud", tier: "pro",
    },
    "mistral": {
        id: "mistral", label: "Mistral",
        baseURL: "https://api.mistral.ai/v1", apiKeyEnv: "MISTRAL_API_KEY",
        compat: "openai", category: "cloud", tier: "pro",
    },
    // ── API Providers (18) ──
    "groq": {
        id: "groq", label: "Groq",
        apiKeyEnv: "GROQ_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "deepseek": {
        id: "deepseek", label: "DeepSeek",
        apiKeyEnv: "DEEPSEEK_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "moonshot": {
        id: "moonshot", label: "Moonshot AI (Kimi)",
        apiKeyEnv: "MOONSHOT_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "qwen": {
        id: "qwen", label: "Alibaba Qwen",
        apiKeyEnv: "DASHSCOPE_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "fireworks": {
        id: "fireworks", label: "Fireworks",
        apiKeyEnv: "FIREWORKS_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "cerebras": {
        id: "cerebras", label: "Cerebras",
        apiKeyEnv: "CEREBRAS_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "sambanova": {
        id: "sambanova", label: "SambaNova",
        apiKeyEnv: "SAMBANOVA_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "deepinfra": {
        id: "deepinfra", label: "DeepInfra",
        apiKeyEnv: "DEEPINFRA_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "featherless": {
        id: "featherless", label: "Featherless",
        apiKeyEnv: "FEATHERLESS_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "together": {
        id: "together", label: "Together AI",
        apiKeyEnv: "TOGETHER_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "venice": {
        id: "venice", label: "Venice AI",
        apiKeyEnv: "VENICE_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "snowflake-cortex": {
        id: "snowflake-cortex", label: "Snowflake Cortex",
        apiKeyEnv: "SNOWFLAKE_CORTEX_TOKEN", compat: "openai", category: "api", tier: "pro",
    },
    "huggingface": {
        id: "huggingface", label: "HuggingFace",
        apiKeyEnv: "HF_API_KEY", compat: "openai", category: "api", discovery: "env-models", tier: "pro",
    },
    "litellm": {
        id: "litellm", label: "LiteLLM Proxy",
        apiKeyEnv: "LITELLM_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "chutes": {
        id: "chutes", label: "Chutes",
        apiKeyEnv: "CHUTES_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "zai": {
        id: "zai", label: "Z.AI (GLM)",
        apiKeyEnv: "ZAI_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "doubao": {
        id: "doubao", label: "Volcengine Doubao",
        apiKeyEnv: "DOUBAO_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "io-intelligence": {
        id: "io-intelligence", label: "IO Intelligence",
        apiKeyEnv: "IO_INTELLIGENCE_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "minimax": {
        id: "minimax", label: "MiniMax",
        apiKeyEnv: "MINIMAX_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    "roo": {
        id: "roo", label: "Roo Code Gateway",
        apiKeyEnv: "ROO_API_KEY", compat: "openai", category: "api", tier: "pro",
    },
    // ── Local / Self-Hosted (4) ──
    "ollama": {
        id: "ollama", label: "Ollama (local)",
        baseURL: "http://localhost:11434/v1", apiKeyEnv: "",
        compat: "openai", category: "local", tier: "pro",
    },
    "lmstudio": {
        id: "lmstudio", label: "LM Studio (local)",
        baseURL: "http://localhost:1234/v1", apiKeyEnv: "",
        compat: "openai", category: "local", tier: "pro",
    },
    "vllm": {
        id: "vllm", label: "vLLM (self-hosted)",
        baseURL: "http://localhost:8000/v1", apiKeyEnv: "",
        compat: "openai", category: "local", tier: "pro",
    },
    "llamacpp": {
        id: "llamacpp", label: "llama.cpp server",
        baseURL: "http://localhost:8080/v1", apiKeyEnv: "",
        compat: "openai", category: "local", tier: "pro",
    },
};
//# sourceMappingURL=catalog.js.map
export class LLMClient {
    endpoint;
    constructor(endpoint) {
        this.endpoint = endpoint;
    }
    async chat(messages, opts = {}) {
        const url = this.buildURL("/chat/completions");
        const body = {
            model: opts.model ?? this.endpoint.model,
            messages,
            temperature: opts.temperature ?? 0.7,
            max_tokens: opts.maxTokens ?? 4096,
            stream: false,
        };
        const res = await fetch(url, {
            method: "POST",
            headers: this.buildHeaders(),
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`LLM request failed (${res.status}): ${text}`);
        }
        const data = await res.json();
        return data.choices[0]?.message?.content ?? "";
    }
    async *chatStream(messages, opts = {}) {
        const url = this.buildURL("/chat/completions");
        const body = {
            model: opts.model ?? this.endpoint.model,
            messages,
            temperature: opts.temperature ?? 0.7,
            max_tokens: opts.maxTokens ?? 4096,
            stream: true,
        };
        const res = await fetch(url, {
            method: "POST",
            headers: this.buildHeaders(),
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            throw new Error(`LLM stream failed (${res.status})`);
        }
        const reader = res.body?.getReader();
        if (!reader)
            throw new Error("No response body");
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    if (data === "[DONE]")
                        return;
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0]?.delta?.content;
                        if (content)
                            yield content;
                    }
                    catch { /* skip malformed lines */ }
                }
            }
        }
    }
    buildURL(path) {
        const base = this.endpoint.baseURL.replace(/\/$/, "");
        if (this.endpoint.compat === "azure") {
            return `${base}/openai/deployments/${this.endpoint.model}${path}?api-version=2024-02-01`;
        }
        return `${base}${path}`;
    }
    buildHeaders() {
        const headers = {
            "Content-Type": "application/json",
            "X-DDF-Product": "agentic-lithography",
        };
        if (this.endpoint.apiKey) {
            if (this.endpoint.compat === "anthropic-oc") {
                headers["x-api-key"] = this.endpoint.apiKey;
                headers["anthropic-version"] = "2023-06-01";
            }
            else {
                headers["Authorization"] = `Bearer ${this.endpoint.apiKey}`;
            }
        }
        headers["HTTP-Referer"] = "https://lithomind.ai";
        headers["X-Title"] = "LithoMind AI";
        return headers;
    }
}
//# sourceMappingURL=client.js.map